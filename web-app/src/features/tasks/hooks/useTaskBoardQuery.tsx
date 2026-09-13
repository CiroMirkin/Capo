'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { useCallback } from 'react'

const taskBoardQueryKey = ['taskBoard']

export const useTaskBoardQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...taskBoardQueryKey, userId, boardId] as const

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

	const { mutate: updateTaskBoard, isPending: isSaving } = useMutation({
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

	return {
		taskBoard,
		isLoading,
		isError,
		error,
		updateTaskBoard,
		isSaving,
	}
}
