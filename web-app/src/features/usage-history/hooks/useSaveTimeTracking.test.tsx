import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveTimeTracking } from './useSaveTimeTracking'
import { useBoardId } from '@/features/auth/state/store'

// Reloj activo controlado a mano (independiente de Date.now).
let fakeTotalTime = 0
const updateUsageHistory = vi.fn()
const incrementUsageHistory = vi.fn()
// Opciones que el hook pasa a useUsageHistoryQuery; el test dispara
// onSuccess/onError a mano para simular que el guardado confirmó o falló.
const queryOpts: { onSuccess?: () => void; onError?: (e: Error) => void } = {}

vi.mock('./useTimeTracking', () => ({
	useTimeTracking: () => ({
		getTotalTime: () => fakeTotalTime,
		resetTimeTracking: vi.fn(),
	}),
}))

vi.mock('./useUsageHistoryQuery', () => ({
	useUsageHistoryQuery: (opts: { onSuccess?: () => void; onError?: (e: Error) => void } = {}) => {
		queryOpts.onSuccess = opts.onSuccess
		queryOpts.onError = opts.onError
		return {
			usageHistory: [],
			updateUsageHistory,
			incrementUsageHistory,
			isSaving: false,
		}
	},
}))

let mockSession: { user: { id: string } } | null = { user: { id: 'u1' } }
vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: mockSession, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useSaveTimeTracking', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		fakeTotalTime = 0
		updateUsageHistory.mockClear()
		incrementUsageHistory.mockClear()
		mockSession = { user: { id: 'u1' } }
		useBoardId.setState({ board_id: 'b1' })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('logueado: no guarda al minuto, sí a los 2 min (incremento atómico)', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 61_000
			vi.advanceTimersByTime(61_000)
		})
		expect(incrementUsageHistory).not.toHaveBeenCalled()

		act(() => {
			fakeTotalTime = 620_000 // > 10 min de umbral
			vi.advanceTimersByTime(120_000 - 61_000) // llega al primer tick de 2 min
		})
		expect(incrementUsageHistory).toHaveBeenCalledTimes(1)
		expect(updateUsageHistory).not.toHaveBeenCalled()
	})

	it('no guarda nada si la visita dura menos de los 10 min de umbral', () => {
		mockSession = null // el umbral de la primera vez aplica también a invitados
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 61_000
			vi.advanceTimersByTime(61_000)
		})
		expect(updateUsageHistory).not.toHaveBeenCalled()
	})

	it('el evento capo:usage-flush no salta el umbral de la primera vez', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 5_000
			window.dispatchEvent(new Event('capo:usage-flush'))
		})
		expect(incrementUsageHistory).not.toHaveBeenCalled()

		act(() => {
			fakeTotalTime = 600_000
			window.dispatchEvent(new Event('capo:usage-flush'))
		})
		expect(incrementUsageHistory).toHaveBeenCalledTimes(1)
	})

	it('si el guardado falla, el próximo intento reenvía el incremento completo', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 620_000
			vi.advanceTimersByTime(120_000) // primer tick de 2 min
		})
		act(() => queryOpts.onError?.(new Error('boom')))

		act(() => {
			fakeTotalTime = 680_000
			vi.advanceTimersByTime(120_000) // segundo tick de 2 min
		})
		expect(incrementUsageHistory).toHaveBeenCalledTimes(2)
		// no avanzó el punto de referencia: manda los 680 s completos, no solo el último tramo
		expect(incrementUsageHistory.mock.calls[1][0].incrementDuration).toBe(680_000)
	})

	it('tras un guardado confirmado, el próximo intento solo manda el incremento nuevo', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 620_000
			vi.advanceTimersByTime(120_000) // primer tick de 2 min
		})
		act(() => queryOpts.onSuccess?.())

		act(() => {
			fakeTotalTime = 680_000
			vi.advanceTimersByTime(120_000) // segundo tick de 2 min
		})
		expect(incrementUsageHistory).toHaveBeenCalledTimes(2)
		expect(incrementUsageHistory.mock.calls[1][0].incrementDuration).toBe(60_000)
	})

	it('invitado: no guarda antes del umbral aunque el intervalo sea ~60,5 s', () => {
		mockSession = null
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 61_000
			vi.advanceTimersByTime(61_000)
		})
		expect(updateUsageHistory).not.toHaveBeenCalled()

		act(() => {
			fakeTotalTime = 600_000
			vi.advanceTimersByTime(60_500) // un tick más de guest, ya por encima del umbral
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(1)
		expect(incrementUsageHistory).not.toHaveBeenCalled()
	})
})
