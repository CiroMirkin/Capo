import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useArchivedTasksQuery } from './useArchivedTasksQuery'
import { fetchArchivedTasks, saveArchivedTasks } from '../api/repository'
import { useBoardId } from '@/features/auth/state/store'
import { archiveThisTask } from '../useCase/archiveTask'
import type { Archive } from '../model/archive'
import type { taskModel } from '@/features/tasks'

vi.mock('../api/repository', () => ({
	fetchArchivedTasks: vi.fn(),
	saveArchivedTasks: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useArchivedTasksQuery — carrera contra la carga inicial', () => {
	beforeEach(() => {
		vi.mocked(fetchArchivedTasks).mockClear()
		vi.mocked(saveArchivedTasks).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe pisar el archivo real si se archiva algo antes de que termine la carga inicial', async () => {
		const realArchive: Archive = [
			{
				date: 'lunes',
				tasklist: [{ id: 'old-1', descriptionText: 'Tarea vieja' } as taskModel],
			},
		]

		let resolveFetch: (v: Archive) => void = () => {}
		vi.mocked(fetchArchivedTasks).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useArchivedTasksQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-archive')
		})

		// El fetch real todavía no resolvió: `archivedTasks` sigue siendo el placeholder `[]`.
		expect(result.current.archivedTasks).toEqual([])

		const newTask = { id: 'new-1', descriptionText: 'Tarea nueva' } as taskModel
		await act(async () => {
			const updated = archiveThisTask({
				task: newTask,
				archive: result.current.archivedTasks,
			})
			result.current.updateArchivedTasks(updated)
			await Promise.resolve()
			await Promise.resolve()
		})

		// No debe persistir un snapshot armado sobre el placeholder mientras la carga real está en vuelo.
		expect(saveArchivedTasks).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch(realArchive)
		})
	})
})
