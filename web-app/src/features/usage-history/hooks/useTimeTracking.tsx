import { useState, useEffect, useCallback, useRef } from 'react'
import { UsageDuration } from '../model/usageHistory'
import {
	getUserSessionTracking,
	saveUserSessionTracking,
	resetUserSessionTracking,
} from './userSessionTracking'

interface UseTimeTrackingReturn {
	getTotalTime: () => UsageDuration
	resetTimeTracking: () => void
}

export interface UserSessionTracking {
	sessionStartTime: number
	totalAccumulatedTime: UsageDuration
	lastSaveTime: number
	isActive: boolean
}

const SAVE_INTERVAL = 60000

const createInitialTracking = (): UserSessionTracking => {
	const now = Date.now()
	return {
		sessionStartTime: now,
		totalAccumulatedTime: 0,
		lastSaveTime: now,
		isActive: true,
	}
}

interface UseTimeTrackingOptions {
	/**
	 * Controla si el contador de tiempo se pausa cuando la pestaña no está visible.
	 * - true (por defecto): Pausa el contador cuando el usuario cambia de pestaña o minimiza la ventana.
	 * - false: El contador continúa corriendo incluso cuando la pestaña está en segundo plano.
	 * @default true
	 */
	pauseOnTabHidden?: boolean
	/**
	 * Intervalo en milisegundos para guardar automáticamente el progreso en localStorage.
	 * Nota: El guardado también ocurre inmediatamente en eventos críticos (cambio de
	 * visibilidad de pestaña y cierre de ventana), independientemente de este intervalo.
	 * @default 60000 (1 minuto)
	 */
	saveInterval?: number
}

/**
 * Hook para rastrear el tiempo total de uso activo en la aplicación.
 
 * @description
 * - Acumula el tiempo de sesión del usuario y lo persiste en localStorage
 * - Guarda automáticamente el progreso a intervalos regulares (por defecto cada 60s)
 * - Opcionalmente pausa el contador cuando la pestaña está oculta
 * - Maneja correctamente el cierre de la ventana para no perder datos
 * - Recupera el tiempo acumulado de sesiones anteriores al iniciar
 
 * @example
 * const { getTotalTime } = useTimeTracking()
 * 
 * @example
 * const { getTotalTime } = useTimeTracking({ 
 *   pauseOnTabHidden: false,
 *   saveInterval: 30000 
 * })
 */
export const useTimeTracking = (options: UseTimeTrackingOptions = {}): UseTimeTrackingReturn => {
	const { pauseOnTabHidden = true, saveInterval = SAVE_INTERVAL } = options

	const [tracking, setTracking] = useState<UserSessionTracking>(() => {
		try {
			const saved = getUserSessionTracking()
			if (saved) {
				const parsed = JSON.parse(saved)
				return {
					...parsed,
					sessionStartTime: Date.now(),
					isActive: true,
					lastSaveTime: Date.now(),
				}
			}
		} catch (error) {
			console.error('Error loading time tracking:', error)
		}
		const initial = createInitialTracking()
		saveUserSessionTracking(initial)
		return initial
	})

	const trackingRef = useRef(tracking)

	useEffect(() => {
		trackingRef.current = tracking
	}, [tracking])

	useEffect(() => {
		const intervalId = setInterval(() => {
			const current = trackingRef.current

			if (!current.isActive) {
				return
			}

			const now = Date.now()
			const updated: UserSessionTracking = {
				...current,
				totalAccumulatedTime:
					current.totalAccumulatedTime + (now - current.sessionStartTime),
				sessionStartTime: now,
				lastSaveTime: now,
			}

			setTracking((prev) => (prev.isActive ? updated : prev))

			try {
				saveUserSessionTracking(updated)
			} catch (error) {
				console.error('Error saving time tracking:', error)
			}
		}, saveInterval)

		return () => clearInterval(intervalId)
	}, [saveInterval])

	const getTotalTime = useCallback((): UsageDuration => {
		const now = Date.now()
		const current = trackingRef.current
		if (current.isActive) {
			return current.totalAccumulatedTime + (now - current.sessionStartTime)
		}
		return current.totalAccumulatedTime
	}, [])

	useEffect(() => {
		if (!pauseOnTabHidden) return

		const handleVisibilityChange = () => {
			const now = Date.now()

			if (document.visibilityState === 'hidden') {
				const current = trackingRef.current
				const updated: UserSessionTracking = {
					...current,
					totalAccumulatedTime:
						current.totalAccumulatedTime + (now - current.sessionStartTime),
					isActive: false,
					lastSaveTime: now,
				}

				setTracking(updated)

				try {
					saveUserSessionTracking(updated)
				} catch (error) {
					console.error('Error saving time tracking:', error)
				}
			} else {
				setTracking((prev) => ({
					...prev,
					sessionStartTime: now,
					isActive: true,
					lastSaveTime: now,
				}))
			}
		}

		const handleBeforeUnload = () => {
			const now = Date.now()
			const current = trackingRef.current

			if (current.isActive) {
				const finalTracking = {
					...current,
					totalAccumulatedTime:
						current.totalAccumulatedTime + (now - current.sessionStartTime),
					isActive: false,
					lastSaveTime: now,
				}

				try {
					saveUserSessionTracking(finalTracking)
				} catch (error) {
					console.error('Error saving time tracking:', error)
				}
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [pauseOnTabHidden])

	const resetTimeTracking = useCallback(() => {
		const newInitialTracking = createInitialTracking()
		resetUserSessionTracking()
		setTracking(newInitialTracking)
		saveUserSessionTracking(newInitialTracking)
		trackingRef.current = newInitialTracking
	}, [])

	return {
		getTotalTime,
		resetTimeTracking,
	}
}
