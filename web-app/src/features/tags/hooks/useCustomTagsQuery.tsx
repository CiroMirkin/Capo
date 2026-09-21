'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCustomTags, saveCustomTags } from '../api/repository/customTagRepositoryFactory'
import { useSession, useBoardId } from '@/features/auth'
import { Tag } from '../model/tags'

const customTagsQueryKey = ['customTags']
const tagsQueryKey = ['tags']

export const useCustomTagsQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)

	const fullQueryKey = [...customTagsQueryKey, userId, boardId] as const

	const {
		data: customTags,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchCustomTags(session, boardId),
		enabled: !!boardId,
	})

	const { mutate: rawUpdateCustomTags, isPending: isSaving } = useMutation({
		mutationFn: (updatedTags: Tag[]) => saveCustomTags({ session, boardId, tags: updatedTags }),
		onMutate: async (updatedTags: Tag[]) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })

			const previousCustomTags = queryClient.getQueryData<Tag[]>(fullQueryKey)

			queryClient.setQueryData(fullQueryKey, updatedTags)

			return { previousCustomTags }
		},
		onError: (_err, _newTags, context) => {
			if (context?.previousCustomTags) {
				queryClient.setQueryData(fullQueryKey, context.previousCustomTags)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
			queryClient.invalidateQueries({ queryKey: [...tagsQueryKey, userId, boardId] })
		},
	})

	/**
	 * Antes de que termine la carga inicial, `customTags` es `undefined`: guardar ahí
	 * pisaría los tags reales con un snapshot armado sobre el placeholder vacío
	 * (ver useCustomTagsQuery.test.tsx).
	 */
	const updateCustomTags = (updatedTags: Tag[]) => {
		if (customTags === undefined) return
		rawUpdateCustomTags(updatedTags)
	}

	return {
		customTags: customTags ?? [],
		isLoading,
		isError,
		error,
		updateCustomTags,
		isSaving,
	}
}
