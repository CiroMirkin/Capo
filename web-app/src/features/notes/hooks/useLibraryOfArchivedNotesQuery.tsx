import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, useBoardId } from '@/features/auth'
import { LibraryOfArchivedNotes } from '../model/libraryOfArchivedNotes'
import {
	fetchLibraryOfArchivedNotes,
	saveLibraryOfArchivedNotes,
} from '../api/repository/libraryOfArchivedNotesRepositoryFactory'

const libraryOfArchivedNotesQueryKey = ['libraryOfArchivedNotes']

export const useLibraryOfArchivedNotesQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()
	const boardId = useBoardId((state) => state.board_id)
	const fullQueryKey = [...libraryOfArchivedNotesQueryKey, session?.user.id, boardId]

	const { data: archivedNotes, isLoading } = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchLibraryOfArchivedNotes(session, boardId),
		enabled: !!boardId,
	})

	const { mutate: rawUpdateArchivedNotes, isPending: isSaving } = useMutation({
		mutationFn: (updatedNotes: LibraryOfArchivedNotes) =>
			saveLibraryOfArchivedNotes({ notes: updatedNotes, session, boardId }),
		onMutate: async (updatedNotes: LibraryOfArchivedNotes) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousNotes = queryClient.getQueryData(fullQueryKey)
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

	/**
	 * Antes de que termine la carga inicial, `archivedNotes` es `undefined`: guardar ahí
	 * pisaría la librería real con un snapshot armado sobre el placeholder vacío
	 * (ver useLibraryOfArchivedNotesQuery.test.tsx).
	 */
	const updateArchivedNotes = (updatedNotes: LibraryOfArchivedNotes) => {
		if (archivedNotes === undefined) return
		rawUpdateArchivedNotes(updatedNotes)
	}

	return {
		archivedNotes,
		isLoading,
		updateArchivedNotes,
		isSaving,
	}
}
