'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UsageHistory } from '../model/usageHistory'
import { localStorageUsageHistoryRepository } from '../api/repository/localstorageUsageHistoryRepository'
import { nextjsUsageHistoryRepository } from '../api/repository/nextjsUsageHistoryRepository'
import { useSession, useBoardId } from '@/features/auth'
import { updateDailyUsageRecord } from '../useCase/updateDailyUsageRecord'

interface IncrementUsageHistoryParams {
	incrementDuration: number
	now: number
	dayStart: number
}

const QUERY_KEY = ['usage-history'] as const

interface UseUsageHistoryQueryOptions {
	onSuccess?: (data: UsageHistory) => void
	onError?: (error: Error) => void
}

export const useUsageHistoryQuery = ({ onSuccess, onError }: UseUsageHistoryQueryOptions = {}) => {
	const { session } = useSession()
	const queryClient = useQueryClient()
	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...QUERY_KEY, userId, boardId] as const

	const {
		data: usageHistory = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: fullQueryKey,
		queryFn: async (): Promise<UsageHistory> => {
			if (session && boardId) return nextjsUsageHistoryRepository.getAll(boardId)
			return localStorageUsageHistoryRepository.getAll()
		},
		// Un usuario logueado debe esperar al boardId de la ruta antes de consultar
		// (si no, lee/escribe datos de invitado en localStorage por error).
		enabled: !!userId && (!session || !!boardId),
		placeholderData: [],
	})

	const customMutationFn = useMutation({
		mutationFn: async (newUsageHistory: UsageHistory): Promise<UsageHistory> => {
			if (session && boardId)
				return nextjsUsageHistoryRepository.save(newUsageHistory, boardId)
			return localStorageUsageHistoryRepository.save(newUsageHistory)
		},
		onSuccess: (data) => {
			queryClient.setQueryData(fullQueryKey, data)
			onSuccess?.(data)
		},
		onError,
	})

	// Solo para logueados
	const incrementMutation = useMutation({
		mutationFn: async (params: IncrementUsageHistoryParams): Promise<void> => {
			if (!boardId) return
			return nextjsUsageHistoryRepository.incrementSession({ ...params, boardId })
		},
		onSuccess: (_data, variables) => {
			const updated = queryClient.setQueryData<UsageHistory>(fullQueryKey, (prev = []) =>
				updateDailyUsageRecord({
					duration: variables.incrementDuration,
					usageHistory: prev,
				})
			)
			onSuccess?.(updated ?? [])
		},
		onError,
	})

	return {
		usageHistory,
		isLoading,
		isError: !!error,
		error,
		updateUsageHistory: customMutationFn.mutate,
		incrementUsageHistory: incrementMutation.mutate,
		isSaving: customMutationFn.isPending || incrementMutation.isPending,
	}
}
