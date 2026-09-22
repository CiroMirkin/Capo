'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSession } from '@/features/auth'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import * as actions from '../api/actions/manageShares'

/** Links compartidos de un tablero (solo el dueño, logueado). */
export const useBoardShares = (boardId: string) => {
	const { session } = useSession()
	const queryClient = useQueryClient()
	const queryKey = ['board-shares', boardId]

	const { data: shares = [], isLoading } = useQuery({
		queryKey,
		queryFn: () => actions.getBoardShares({ boardId }),
		enabled: !!session && !!boardId,
	})

	const { mutate: run, isPending } = useMutation({
		mutationFn: (action: () => Promise<unknown>) => action(),
		onError: (e) => toast.error(getErrorMessageForTheUser(e)),
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	})

	return {
		shares,
		isLoading,
		isPending,
		addEmailShare: (email: string) => run(() => actions.addEmailShare({ boardId, email })),
		enablePublicShare: () => run(() => actions.enablePublicShare({ boardId })),
		setShareActive: (shareId: string, active: boolean) =>
			run(() => actions.setShareActive({ boardId, shareId, active })),
		regenerateShareToken: (shareId: string) =>
			run(() => actions.regenerateShareToken({ boardId, shareId })),
		deleteShare: (shareId: string) => run(() => actions.deleteShare({ boardId, shareId })),
	}
}
