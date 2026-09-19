'use client'

import { useQuery, useMutation, useQueryClient, MutateOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo } from 'react'
import { fetchNotes, saveNotes } from '../api/repository/notesRepositoryFactory'
import { useSession, useBoardId } from '@/features/auth'
import { defaultNotes, Notes } from '../model/notes'

const notesQueryKey = ['notes']

export const useNotesQuery = () => {
	const { session } = useSession()
	const queryClient = useQueryClient()
	const boardId = useBoardId((state) => state.board_id)
	const userId = session?.user.id
	const fullQueryKey = useMemo(() => [...notesQueryKey, userId, boardId], [userId, boardId])
	const { t } = useTranslation()

	const { data: notes = null, isLoading } = useQuery({
		queryKey: fullQueryKey,
		queryFn: () => fetchNotes(session, boardId),
		enabled: !!boardId,
		refetchInterval: 5000, // mismo polling que useTaskBoardQuery para sync entre PCs
	})

	const { mutate: rawUpdateNotes, isPending: isSaving } = useMutation({
		mutationFn: (updatedNotes: Notes) => saveNotes({ notes: updatedNotes, session, boardId }),
		onMutate: async (updatedNotes: Notes) => {
			await queryClient.cancelQueries({ queryKey: fullQueryKey })
			const previousNotes = queryClient.getQueryData<Notes>(fullQueryKey) ?? defaultNotes
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
	 * Guarda antes de vaciar notas que tenían contenido:
	 * si las notas previas no estaban en blanco y el nuevo valor sí, algo pudo perder datos
	 * (por ejemplo un corte de conexión hizo que se guardara un snapshot vacío encima de notas reales)
	 */
	const updateNotes = useCallback(
		(
			updatedNotes: Notes,
			options?: MutateOptions<void, Error, Notes> & { allowEmpty?: boolean }
		) => {
			const { allowEmpty, ...mutateOptions } = options ?? {}
			const previousNotes = queryClient.getQueryData<Notes>(fullQueryKey) ?? defaultNotes

			if (!allowEmpty && previousNotes.trim() !== '' && updatedNotes.trim() === '') {
				toast.warning(t('notes.empty_notes_warning'), {
					action: {
						label: t('notes.empty_notes_confirm_btn'),
						onClick: () => rawUpdateNotes(updatedNotes, mutateOptions),
					},
				})
				return
			}

			rawUpdateNotes(updatedNotes, mutateOptions)
		},
		[queryClient, fullQueryKey, rawUpdateNotes, t]
	)

	return {
		notes,
		isLoading,
		updateNotes,
		isSaving,
	}
}
