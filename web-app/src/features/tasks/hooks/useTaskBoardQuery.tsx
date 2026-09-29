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

	// El tablero nuevo se escribe en la cache (antes de que responda el server) en `updateTaskBoard` y no en `onMutate`
	// react-query hace un `await` interno antes de `onMutate`, así que dos updates seguidos leerían la misma cache como
	// `previous` y el diff del segundo se calcularía contra un tablero sin los cambios del primero.
	const { mutate: rawUpdateTaskBoard, isPending: isSaving } = useMutation({
		scope: { id: `taskBoard-${boardId}` },

		mutationFn: ({ next, previous }: { next: TaskBoard; previous: TaskBoard }) =>
			saveTaskBoard({ taskBoard: next, previous, session, boardId }),

		onMutate: async ({ previous }) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			return { previousTaskBoard: previous }
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
	 * Guarda antes de persistir un `TaskBoard` completo:
	 * Si el tablero tenía tareas y el snapshot a persistir las deja todas en cero, algo leyó un estado incompleto, entonces Pide confirmación en vez de vaciar en silencio.
	 *
	 * Las actualizaciones incrementales (`TaskListInEachColumn`, ej. borrar o archivar una tarea desde la UI) no pasan por este guard: ahí un tablero en cero es una acción intencional del usuario, no un bug de lectura
	 */
	const updateTaskBoard = useCallback(
		(
			updatedTaskBoard: TaskListInEachColumn | TaskBoard,
			options?: Parameters<typeof rawUpdateTaskBoard>[1]
		) => {
			const readPrevious = () =>
				queryClient.getQueryData<TaskBoard>(fullQueryKey) ?? emptyTaskBoard

			const isTaskLists = isThisArrayOfTypeTaskListInEachColumn(updatedTaskBoard)
			// Se relee al momento de mutar
			// Si se confirma el toast más tarde, el diff va contra la cache de ese momento.
			const save = () => {
				const previous = readPrevious()
				const next = isTaskLists
					? joinTaskListsAndTaskBoard(updatedTaskBoard as TaskListInEachColumn, previous)
					: (updatedTaskBoard as TaskBoard)
				queryClient.setQueryData(fullQueryKey, next)
				rawUpdateTaskBoard({ next, previous }, options)
			}

			if (
				!isTaskLists &&
				countTasks(readPrevious()) > 0 &&
				countTasks(updatedTaskBoard) === 0
			) {
				toast.warning(t('task_board.empty_board_warning'), {
					action: { label: t('task_board.empty_board_confirm_btn'), onClick: save },
				})
				return
			}

			save()
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
