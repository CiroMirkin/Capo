'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBoardId, useSession } from '@/features/auth'
import { whiteboardRepositoryFactory } from '../api/repository/whiteboardRepositoryFactory'
import { isValidScene, WhiteboardScene } from '../model/whiteboard'

const SAVE_DEBOUNCE_MS = 1000

/**
 * Carga la pizarra del tablero y la guarda con debounce (~1s tras el último cambio), más un flush al salir (beforeunload / unmount).
 * Sin polling ya que al refrescar desde el server pisaría lo que se está dibujando.
 */
export const useWhiteboard = () => {
	const { session, isLoading: isSessionLoading } = useSession()
	const boardId = useBoardId((state) => state.board_id)
	const queryClient = useQueryClient()
	const { t } = useTranslation()

	const queryKey = useMemo(
		() => ['whiteboard', session?.user.id, boardId],
		[session?.user.id, boardId]
	)

	const { data: scene, isLoading } = useQuery({
		queryKey,
		queryFn: () => whiteboardRepositoryFactory(session).get(boardId),
		// Se espera a la sesión para que un usuario logueado no vea la pizarra del localStorage
		enabled: !!boardId && !isSessionLoading,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	})

	const pendingRef = useRef<WhiteboardScene | null>(null)
	const lastSavedRef = useRef<string | null>(null)
	const timerRef = useRef<ReturnType<typeof setTimeout>>()

	const flush = useCallback(() => {
		clearTimeout(timerRef.current)
		const next = pendingRef.current
		pendingRef.current = null
		if (!next) return

		const serialized = JSON.stringify(next)
		if (serialized === lastSavedRef.current) return
		if (!isValidScene(next)) {
			toast.error(t('whiteboard.too_large_toast'))
			return
		}

		lastSavedRef.current = serialized
		queryClient.setQueryData(queryKey, next)
		whiteboardRepositoryFactory(session)
			.save(next, boardId)
			.catch(() => {
				lastSavedRef.current = null
				toast.error(t('whiteboard.save_error_toast'))
			})
	}, [queryClient, queryKey, session, boardId, t])

	const saveScene = useCallback(
		(next: WhiteboardScene) => {
			pendingRef.current = next
			clearTimeout(timerRef.current)
			timerRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS)
		},
		[flush]
	)

	useEffect(() => {
		window.addEventListener('beforeunload', flush)
		return () => {
			window.removeEventListener('beforeunload', flush)
			flush()
		}
	}, [flush])

	return { scene, isLoading: isLoading || isSessionLoading, saveScene }
}
