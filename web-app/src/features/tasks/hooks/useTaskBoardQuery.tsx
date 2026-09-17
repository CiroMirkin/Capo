'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchTaskBoard, saveTaskBoard } from '@/features/tasks/api/repository'
import { useSession, useBoardId } from '@/features/auth'
import {
	isThisArrayOfTypeTaskListInEachColumn,
	TaskListInEachColumn,
} from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import {
	emptyTaskBoard,
	isDefaultTaskBoard,
	joinTaskListsAndTaskBoard,
	TaskBoard,
} from '../model/taskBoard'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'

const countTasks = (taskBoardOrLists: TaskListInEachColumn | TaskBoard): number =>
	isThisArrayOfTypeTaskListInEachColumn(taskBoardOrLists)
		? (taskBoardOrLists as TaskListInEachColumn).reduce((total, list) => total + list.length, 0)
		: (taskBoardOrLists as TaskBoard).reduce((total, column) => total + column.tasks.length, 0)

const taskBoardQueryKey = ['taskBoard']

export const useTaskBoardQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = useMemo(
		() => [...taskBoardQueryKey, userId, boardId] as const,
		[userId, boardId]
	)

	const { t, i18n } = useTranslation()
	const select = useCallback(
		(rawData: TaskBoard | undefined) => {
			if (!rawData) {
				return null
			}
			if (isDefaultTaskBoard(rawData)) {
				return rawData.map((taskColumn) => ({
					...taskColumn,
					status: t(`default_columns.${taskColumn.id}`),
				}))
			}
			return rawData
		},
		[t, i18n.language, userId] // eslint-disable-line react-hooks/exhaustive-deps
	)

	const {
		data: taskBoard = null,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchTaskBoard(session, boardId),
		staleTime: 30000,
		refetchInterval: 5000, // sync entre pestañas/PCs - polling simple, subir a push (SSE/Pulse) si 5s no alcanza
		enabled: !!boardId,
		select,
	})

	const { mutate: rawUpdateTaskBoard, isPending: isSaving } = useMutation({
		mutationFn: (updatedTaskBoard: TaskListInEachColumn | TaskBoard) => {
			if (isThisArrayOfTypeTaskListInEachColumn(updatedTaskBoard)) {
				const previousTaskBoard =
					queryClient.getQueryData<TaskBoard>(fullQueryKey) ?? emptyTaskBoard
				const newUpdated = joinTaskListsAndTaskBoard(
					updatedTaskBoard as TaskListInEachColumn,
					previousTaskBoard
				)

				return saveTaskBoard({
					taskBoard: newUpdated,
					session,
					boardId,
				})
			}

			return saveTaskBoard({
				taskBoard: updatedTaskBoard as TaskBoard,
				session,
				boardId,
			})
		},
		onMutate: async (updatedTaskBoard: TaskListInEachColumn | TaskBoard) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousTaskBoard =
				queryClient.getQueryData<TaskBoard>(fullQueryKey) ?? emptyTaskBoard

			if (isThisArrayOfTypeTaskListInEachColumn(updatedTaskBoard)) {
				const newUpdated = joinTaskListsAndTaskBoard(
					updatedTaskBoard as TaskListInEachColumn,
					previousTaskBoard
				)
				queryClient.setQueryData(fullQueryKey, newUpdated)
				return { previousTaskBoard: previousTaskBoard }
			}

			queryClient.setQueryData(fullQueryKey, updatedTaskBoard)
			return { previousTaskBoard: previousTaskBoard }
		},
		onError: (_err, _newTaskBoard, context) => {
			if (context?.previousTaskBoard) {
				queryClient.setQueryData(fullQueryKey, context.previousTaskBoard)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
		},
	})

	/**
	 * Guarda antes de un `saveTaskBoard` full-sync: si el tablero tenía tareas
	 * y el snapshot a persistir las deja todas en cero, algo leyó un estado
	 * incompleto (ver bug de 2026-09-17 en crear-tarea.md). Pide confirmación
	 * en vez de vaciar en silencio.
	 */
	const updateTaskBoard = useCallback(
		(
			updatedTaskBoard: TaskListInEachColumn | TaskBoard,
			options?: Parameters<typeof rawUpdateTaskBoard>[1]
		) => {
			const previousTaskBoard =
				queryClient.getQueryData<TaskBoard>(fullQueryKey) ?? emptyTaskBoard

			if (countTasks(previousTaskBoard) > 0 && countTasks(updatedTaskBoard) === 0) {
				toast.warning(t('task_board.empty_board_warning'), {
					action: {
						label: t('task_board.empty_board_confirm_btn'),
						onClick: () => rawUpdateTaskBoard(updatedTaskBoard, options),
					},
				})
				return
			}

			rawUpdateTaskBoard(updatedTaskBoard, options)
		},
		[queryClient, fullQueryKey, rawUpdateTaskBoard, t]
	)

	return {
		taskBoard,
		isLoading,
		isError,
		error,
		updateTaskBoard,
		isSaving,
	}
}
