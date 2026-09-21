import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLimboQuery } from './useLimboQuery'
import { fetchLimbo, saveLimboTasks } from '../api/repository'
import { useBoardId } from '@/features/auth/state/store'
import { addTaskToLimbo } from '../model/limbo'
import type { Limbo } from '../model/limbo'
import type { taskModel } from '@/features/tasks'

vi.mock('../api/repository', () => ({
	fetchLimbo: vi.fn(),
	saveLimboTasks: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useLimboQuery — carrera contra la carga inicial', () => {
	beforeEach(() => {
		vi.mocked(fetchLimbo).mockClear()
		vi.mocked(saveLimboTasks).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe pisar el limbo real si se agrega una tarea antes de que termine la carga inicial', async () => {
		const realLimbo: Limbo = [
			{ id: 'old-1', descriptionText: 'Tarea vieja', x: 0, y: 0 } as taskModel & {
				x: number
				y: number
			},
		]

		let resolveFetch: (v: Limbo) => void = () => {}
		vi.mocked(fetchLimbo).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useLimboQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-limbo')
		})

		// El fetch real todavía no resolvió: `limbo` sigue siendo el placeholder `[]`.
		expect(result.current.limbo).toEqual([])

		const newTask = { id: 'new-1', descriptionText: 'Tarea nueva' } as taskModel
		await act(async () => {
			const updated = addTaskToLimbo({
				limbo: result.current.limbo,
				task: newTask,
				x: 1,
				y: 1,
			})
			result.current.updateLimbo(updated)
			await Promise.resolve()
			await Promise.resolve()
		})

		expect(saveLimboTasks).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch(realLimbo)
		})
	})
})
