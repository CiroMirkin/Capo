import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, useBoardId } from '@/features/auth'
import { Limbo, emptyLimbo } from '../model/limbo'
import { fetchLimbo, saveLimboTasks } from '../api/repository'

const limboQueryKey = ['limbo']

export const useLimboQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...limboQueryKey, userId, boardId] as const

	const { data, isLoading, isError, error } = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchLimbo(session, boardId),
		enabled: !!boardId,
	})

	const limbo = data ?? emptyLimbo

	const { mutate: rawUpdateLimbo, isPending: isSaving } = useMutation({
		mutationFn: (newLimbo: Limbo) => saveLimboTasks({ session, tasks: newLimbo, boardId }),
		onMutate: async (newLimbo: Limbo) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousLimbo = queryClient.getQueryData<Limbo>(fullQueryKey)
			queryClient.setQueryData(fullQueryKey, newLimbo)
			return { previousLimbo }
		},
		onError: (_err, _newLimbo, context) => {
			if (context?.previousLimbo) {
				queryClient.setQueryData(fullQueryKey, context.previousLimbo)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
		},
	})

	/**
	 * Antes de que termine la carga inicial, `data` es `undefined`: guardar ahí
	 * pisaría el limbo real con un snapshot armado sobre el placeholder vacío
	 * (ver useLimboQuery.test.tsx).
	 */
	const updateLimbo = (newLimbo: Limbo) => {
		if (data === undefined) return
		rawUpdateLimbo(newLimbo)
	}

	return { limbo, isLoading, isError, error, updateLimbo, isSaving }
}
