'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotes, saveNotes } from '../api/repository/notesRepositoryFactory'
import { useSession, useBoardId } from '@/features/auth'
import { defaultNotes, Notes } from '../model/notes'

const notesQueryKey = ['notes']

export const useNotesQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...notesQueryKey, session?.user.id, boardId]

	const { data: notes = null, isLoading } = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchNotes(session, boardId),
		enabled: !!boardId,
		refetchInterval: 5000, // mismo polling que useTaskBoardQuery para sync entre PCs
	})

	const { mutate: updateNotes, isPending: isSaving } = useMutation({
		mutationFn: (updatedNotes: Notes) => saveNotes({ notes: updatedNotes, session, boardId }),
		onMutate: async (updatedNotes: Notes) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousNotes = queryClient.getQueryData(fullQueryKey) ?? defaultNotes
			queryClient.setQueryData(fullQueryKey, updatedNotes)
			return { previousNotes }
		},
		onError: (_err, _newNotes, context) => {
			if (context?.previousNotes) {
				queryClient.setQueryData(fullQueryKey, context.previousNotes)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: fullQueryKey })
		},
	})

	return {
		notes,
		isLoading,
		updateNotes,
		isSaving,
	}
}
