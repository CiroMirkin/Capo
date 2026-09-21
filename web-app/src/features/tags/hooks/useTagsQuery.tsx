'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTags, saveTags } from '../api/repository/tagRepositoryFactory'
import { useSession, useBoardId } from '@/features/auth'
import { TagRepositoryGetReturn } from '../api/repository/tagRepository'

const tagsQueryKey = ['tags']

export const useTagsQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()

	const userId = session?.user.id ?? 'guest'
	const boardId = useBoardId((state) => state.board_id)

	const fullQueryKey = [...tagsQueryKey, userId, boardId] as const

	const {
		data: tags,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchTags(session, boardId),
		enabled: !!boardId,
	})

	const { mutate: rawUpdateTags, isPending: isSaving } = useMutation({
		mutationFn: (updatedTags: TagRepositoryGetReturn) =>
			saveTags({
				session,
				tags: updatedTags.tags,
				actualTags: updatedTags.actualTagGroup,
				boardId,
			}),
		onMutate: async (updatedTags: TagRepositoryGetReturn) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })

			const previousTags = queryClient.getQueryData<TagRepositoryGetReturn>(fullQueryKey)

			queryClient.setQueryData(fullQueryKey, updatedTags)

			return { previousTags }
		},
		onError: (_err, _newTags, context) => {
			if (context?.previousTags) {
				queryClient.setQueryData(fullQueryKey, context.previousTags)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
		},
	})

	/**
	 * Antes de que termine la carga inicial, `tags` es `undefined`: guardar ahí
	 * pisaría los tags reales con un snapshot armado sobre el placeholder vacío
	 * (ver useTagsQuery.test.tsx).
	 */
	const updateTags = (updatedTags: TagRepositoryGetReturn) => {
		if (tags === undefined) return
		rawUpdateTags(updatedTags)
	}

	return {
		tags,
		isLoading,
		isError,
		error,
		updateTags,
		isSaving,
	}
}
