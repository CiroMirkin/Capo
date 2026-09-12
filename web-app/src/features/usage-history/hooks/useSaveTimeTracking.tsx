import { useEffect, useRef } from 'react'
import { useTimeTracking } from './useTimeTracking'
import { useUsageHistoryQuery } from './useUsageHistoryQuery'
import { updateDailyUsageRecord } from '../useCase/updateDailyUsageRecord'
import { useSession, useBoardId } from '@/features/auth'

const LOGGED_IN_SAVE_INTERVAL = 1_200_000 // 20 min
const GUEST_SAVE_INTERVAL = 60_500 // ~60,5 s
// No se guarda nada hasta acumular esto de uso: evita que una visita de
// "entré a mirar algo" de 1-2 min ensucie el usage-history con una entrada.
const MIN_DURATION_BEFORE_FIRST_SAVE = 600_000 // 10 min

/** Evento para pedir un guardado inmediato desde afuera (menú abierto / contador visible). */
export const USAGE_FLUSH_EVENT = 'capo:usage-flush'

export const requestUsageHistoryFlush = () => {
	if (typeof window !== 'undefined') window.dispatchEvent(new Event(USAGE_FLUSH_EVENT))
}

export const useSaveTimeTracking = () => {
	const { getTotalTime, resetTimeTracking } = useTimeTracking({ pauseOnTabHidden: false })
	const lastSavedTimeRef = useRef(0)
	const pendingSaveTargetRef = useRef(0)
	const { updateUsageHistory, usageHistory, isSaving } = useUsageHistoryQuery({
		// Solo avanzamos el punto de referencia cuando el guardado confirmó;
		// si falla, el próximo intento reenvía el incremento completo.
		onSuccess: () => {
			lastSavedTimeRef.current = pendingSaveTargetRef.current
		},
	})
	const { session } = useSession()
	const isLoggedIn = !!session
	const boardId = useBoardId((state) => state.board_id)
	const boardIdRef = useRef(boardId)
	const isSavingRef = useRef(isSaving)

	useEffect(() => {
		isSavingRef.current = isSaving
	}, [isSaving])

	useEffect(() => {
		const outsideBoard = !boardId
		if (outsideBoard) return

		const save = () => {
			try {
				if (isSavingRef.current) {
					return
				}

				const totalTime = getTotalTime()
				const isFirstSave = lastSavedTimeRef.current === 0
				if (isFirstSave && totalTime < MIN_DURATION_BEFORE_FIRST_SAVE) {
					return
				}

				const incrementalDuration = totalTime - lastSavedTimeRef.current
				if (incrementalDuration > 0) {
					const newUsageHistory = updateDailyUsageRecord({
						duration: incrementalDuration,
						usageHistory,
					})
					pendingSaveTargetRef.current = totalTime
					updateUsageHistory(newUsageHistory)
				}
			} catch (e) {
				console.error('Error saving time tracking:', e)
			}
		}

		const intervalId = setInterval(
			save,
			isLoggedIn ? LOGGED_IN_SAVE_INTERVAL : GUEST_SAVE_INTERVAL
		)
		window.addEventListener(USAGE_FLUSH_EVENT, save)

		return () => {
			clearInterval(intervalId)
			window.removeEventListener(USAGE_FLUSH_EVENT, save)
		}
	}, [getTotalTime, updateUsageHistory, usageHistory, boardId, isLoggedIn])

	const sessionRef = useRef(Boolean(session))

	useEffect(() => {
		const sessionChanged = Boolean(session) !== sessionRef.current
		const boardChanged = boardIdRef.current !== boardId
		if (sessionChanged || boardChanged) {
			sessionRef.current = Boolean(session)
			boardIdRef.current = boardId
			lastSavedTimeRef.current = 0
			pendingSaveTargetRef.current = 0
			resetTimeTracking()
		}
	}, [session, boardId, resetTimeTracking])
}
