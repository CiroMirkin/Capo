import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSaveTimeTracking } from './useSaveTimeTracking'
import { useBoardId } from '@/features/auth/state/store'

// Reloj activo controlado a mano (independiente de Date.now).
let fakeTotalTime = 0
const updateUsageHistory = vi.fn()

vi.mock('./useTimeTracking', () => ({
	useTimeTracking: () => ({
		getTotalTime: () => fakeTotalTime,
		resetTimeTracking: vi.fn(),
	}),
}))

vi.mock('./useUsageHistoryQuery', () => ({
	useUsageHistoryQuery: () => ({
		usageHistory: [],
		updateUsageHistory,
		isSaving: false,
	}),
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
