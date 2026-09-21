'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBoard, saveBoard } from '../api/repository/boardRepository'
import { useSession, useBoardId } from '@/features/auth'
import { boardModel, defaultBoard, isDefaultBoardName } from '../model/board'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect } from 'react'

const boardQueryKey = ['board']

/** Clave de react-query para un tablero. Única fuente para no desincronizar caches. */
export const boardKey = (userId?: string, boardId?: string) => [...boardQueryKey, userId, boardId]

export const useBoardQuery = (boardId: string) => {
	const { session, isLoading: isSessionLoading } = useSession()
	const queryClient = useQueryClient()
	const { t, i18n } = useTranslation()

	const setBoardId = useBoardId((s) => s.setBoardId)
	useEffect(() => {
		if (boardId) setBoardId(boardId)
	}, [boardId, setBoardId])

	const select = useCallback(
		(rawData: boardModel | undefined) => {
			if (!rawData) {
				return null
			}
			if (isDefaultBoardName(rawData.name)) {
				return { ...rawData, name: t('board_name') }
			}
			return rawData
		},
		[t, i18n.language] // eslint-disable-line react-hooks/exhaustive-deps
	)

	const {
		data: board = null,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: boardKey(session?.user.id, boardId),
		queryFn: () => fetchBoard(session, boardId),
		select,
		enabled: !!boardId && (boardId === defaultBoard.id || !isSessionLoading),
	})

	const { mutate: updateBoard, isPending: isSaving } = useMutation({
		mutationFn: (updatedBoard: boardModel) => {
			let toSave = updatedBoard
			if (updatedBoard.name === t(defaultBoard.name)) {
				toSave = { ...updatedBoard, name: defaultBoard.name }
			}
			return saveBoard({ board: toSave, session, boardId })
		},
		onMutate: async (updatedBoard: boardModel) => {
			await queryClient.cancelQueries({ queryKey: boardQueryKey })
			const previousBoard = queryClient.getQueryData(boardQueryKey)
			queryClient.setQueryData(boardQueryKey, updatedBoard)
			return { previousBoard }
		},
		onError: (_err, _newBoard, context) => {
			if (context?.previousBoard) {
				queryClient.setQueryData(boardQueryKey, context.previousBoard)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: boardQueryKey })
		},
	})

	return {
		board,
		isLoading,
		isError,
		error,
		updateBoard,
		isSaving,
	}
}
