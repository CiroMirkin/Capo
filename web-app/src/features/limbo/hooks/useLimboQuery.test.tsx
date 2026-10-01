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

describe('useLimboQuery — refetch durante un guardado', () => {
	it('montar otro observer mientras se guarda no trae el limbo viejo del server (parpadeo)', async () => {
		const oldLimbo: Limbo = []
		vi.mocked(fetchLimbo).mockClear().mockResolvedValue(oldLimbo)
		let resolveSave: () => void = () => {}
		vi.mocked(saveLimboTasks).mockReturnValue(new Promise((r) => (resolveSave = r)))
		useBoardId.setState({ board_id: 'b1' })

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)
		const { result } = renderHook(() => useLimboQuery(), { wrapper })
		await vi.waitFor(() => expect(fetchLimbo).toHaveBeenCalledTimes(1))
		await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

		const task = { id: 'new-1', descriptionText: 'nueva' } as taskModel
		act(() => {
			result.current.updateLimbo(addTaskToLimbo({ limbo: [], task, x: 0, y: 0 }))
		})
		await vi.waitFor(() => expect(result.current.limbo).toHaveLength(1))

		// La card nueva se monta y usa el mismo hook (como LimboTask).
		renderHook(() => useLimboQuery(), { wrapper })
		await act(async () => {
			await new Promise((r) => setTimeout(r, 10))
		})

		expect(fetchLimbo).toHaveBeenCalledTimes(1)
		expect(result.current.limbo).toHaveLength(1)

		await act(async () => resolveSave())
	})
})
