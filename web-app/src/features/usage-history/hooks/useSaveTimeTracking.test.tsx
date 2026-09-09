import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveTimeTracking } from './useSaveTimeTracking'
import { useBoardId } from '@/features/auth/state/store'

// Reloj activo controlado a mano (independiente de Date.now).
let fakeTotalTime = 0
const updateUsageHistory = vi.fn()
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
		mockSession = { user: { id: 'u1' } }
		useBoardId.setState({ board_id: 'b1' })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('logueado: no guarda al minuto, sí a los 20 min', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 61_000
			vi.advanceTimersByTime(61_000)
		})
		expect(updateUsageHistory).not.toHaveBeenCalled()

		act(() => {
			fakeTotalTime = 1_200_000
			vi.advanceTimersByTime(1_200_000 - 61_000)
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(1)
	})

	it('el evento capo:usage-flush fuerza un guardado inmediato', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 5_000
			window.dispatchEvent(new Event('capo:usage-flush'))
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(1)
	})

	it('si el guardado falla, el próximo intento reenvía el incremento completo', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 1_200_000
			vi.advanceTimersByTime(1_200_000)
		})
		act(() => queryOpts.onError?.(new Error('boom')))

		act(() => {
			fakeTotalTime = 1_260_000
			vi.advanceTimersByTime(1_200_000)
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(2)
		// no avanzó el punto de referencia: manda los 21 min completos, no 1 min
		expect(updateUsageHistory.mock.calls[1][0][0].periods[0].duration).toBe(1_260_000)
	})

	it('tras un guardado confirmado, el próximo intento solo manda el incremento nuevo', () => {
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 1_200_000
			vi.advanceTimersByTime(1_200_000)
		})
		act(() => queryOpts.onSuccess?.())

		act(() => {
			fakeTotalTime = 1_260_000
			vi.advanceTimersByTime(1_200_000)
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(2)
		expect(updateUsageHistory.mock.calls[1][0][0].periods[0].duration).toBe(60_000)
	})

	it('invitado: guarda a los ~60,5 s', () => {
		mockSession = null
		renderHook(() => useSaveTimeTracking())

		act(() => {
			fakeTotalTime = 61_000
			vi.advanceTimersByTime(61_000)
		})
		expect(updateUsageHistory).toHaveBeenCalledTimes(1)
	})
})
