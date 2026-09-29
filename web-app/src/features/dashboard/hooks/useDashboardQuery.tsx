'use client'

import { useSession } from '@/features/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BusinessError from '@/shared/errors/businessError'
import { useTranslation } from 'react-i18next'
import type { CreateBoardInput } from '../api/actions/createBoard'

const queryKey = ['board-dashboard']

export const useDashboardQuery = () => {
	const { t } = useTranslation()
	const { session } = useSession()
	const queryClient = useQueryClient()

	const {
		data: boards = [],
		isLoading,
		error,
	} = useQuery({
		queryKey,
		queryFn: async () => {
			if (!session) return []
			const { getBoards } = await import('../api/actions/getBoards')
			return getBoards()
		},
		enabled: !!session,
	})

	const { mutateAsync: deleteBoard } = useMutation({
		mutationFn: async (boardId: string) => {
			if (!session) throw new BusinessError(t('dashboard.no_active_session'))
			if (!boardId.trim()) throw new BusinessError(t('dashboard.board_id_required'))
			const { deleteBoard: deleteBoardAction } = await import('../api/actions/deleteBoard')
			return deleteBoardAction({ boardId })
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	})

	const { mutateAsync: createAnEmptyBoard } = useMutation({
		mutationFn: async (input: CreateBoardInput) => {
			if (!session) throw new BusinessError(t('dashboard.no_active_session'))
			if (!input.name.trim()) throw new BusinessError(t('dashboard.board_name_required'))
			const { createBoard } = await import('../api/actions/createBoard')
			return createBoard(input)
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey }),
	})

	return { boards, isLoading, error, deleteBoard, createAnEmptyBoard }
}
