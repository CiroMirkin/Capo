import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { useNotesQuery } from './useNotesQuery'
import { fetchNotes, saveNotes } from '../api/repository/notesRepositoryFactory'
import { useBoardId } from '@/features/auth/state/store'

vi.mock('../api/repository/notesRepositoryFactory', () => ({
	fetchNotes: vi.fn().mockResolvedValue(''),
	saveNotes: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('sonner', () => ({
	toast: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useNotesQuery', () => {
	beforeEach(() => {
		vi.mocked(fetchNotes).mockClear()
		vi.mocked(saveNotes).mockClear()
		vi.mocked(toast.warning).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('pide confirmación por toast antes de vaciar notas que tenían contenido, y no las persiste hasta confirmar', async () => {
		vi.mocked(fetchNotes).mockResolvedValue('texto guardado')

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useNotesQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-notes')
		})

		await waitFor(() => expect(result.current.notes).toEqual('texto guardado'))

		act(() => {
			result.current.updateNotes('')
		})

		// El vaciado no se persiste solo: se pide confirmación primero.
		expect(saveNotes).not.toHaveBeenCalled()
		expect(toast.warning).toHaveBeenCalledTimes(1)

		const confirmAction = vi.mocked(toast.warning).mock.calls[0][1]?.action as
			| { onClick: () => void }
			| undefined

		act(() => {
			confirmAction?.onClick()
		})

		await waitFor(() => expect(saveNotes).toHaveBeenCalledTimes(1))
		expect(saveNotes).toHaveBeenCalledWith(expect.objectContaining({ notes: '' }))
	})

	it('con allowEmpty (vaciado intencional, ej. archivar) persiste sin pedir confirmación', async () => {
		vi.mocked(fetchNotes).mockResolvedValue('texto guardado')

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useNotesQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-notes-2')
		})

		await waitFor(() => expect(result.current.notes).toEqual('texto guardado'))

		act(() => {
			result.current.updateNotes('', { allowEmpty: true })
		})

		expect(toast.warning).not.toHaveBeenCalled()
		await waitFor(() => expect(saveNotes).toHaveBeenCalledTimes(1))
	})
})
