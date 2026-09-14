import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTaskBoardQuery } from './useTaskBoardQuery'
import { fetchTaskBoard } from '@/features/tasks/api/repository'
import { useBoardId } from '@/features/auth/state/store'

vi.mock('@/features/tasks/api/repository', () => ({
	fetchTaskBoard: vi.fn().mockResolvedValue([]),
	saveTaskBoard: vi.fn(),
}))

// Mock liviano de la barrel: evita arrastrar AuthCard real (que pega a Better
// Auth) solo para leer useSession/useBoardId en este hook.
vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

// El componente de tablero monta `useBoardQuery(boardId)` (que sincroniza el store en
// un efecto) y `useTaskBoardQuery()` (que lee ese store) en el mismo render: al entrar
// a un tablero por primera vez en la sesión, el store todavía tiene el `board_id`
// default ('') en ese primer render, antes de que el efecto lo actualice.
describe('useTaskBoardQuery', () => {
	beforeEach(() => {
		vi.mocked(fetchTaskBoard).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no pega al servidor mientras el boardId del store todavía es el default', async () => {
		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		renderHook(() => useTaskBoardQuery(), { wrapper })

		// Nada debería dispararse todavía: no hay boardId real.
		expect(fetchTaskBoard).not.toHaveBeenCalled()

		// El efecto de useBoardQuery corrige el store un instante después.
		act(() => {
			useBoardId.getState().setBoardId('real-board-id')
		})

		await waitFor(() =>
			expect(fetchTaskBoard).toHaveBeenCalledWith(expect.anything(), 'real-board-id')
		)
		expect(fetchTaskBoard).not.toHaveBeenCalledWith(expect.anything(), '')
	})
})
