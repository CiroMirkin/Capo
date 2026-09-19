import { createRef } from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NoteInput, type NoteInputHandle } from './NoteInput'
import { fetchNotes, saveNotes } from '../api/repository/notesRepositoryFactory'
import { useBoardId } from '@/features/auth/state/store'

vi.mock('../api/repository/notesRepositoryFactory', () => ({
	fetchNotes: vi.fn(),
	saveNotes: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('sonner', () => ({
	toast: { warning: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

vi.mock('../hooks/useArchiveNote', () => ({
	useArchiveNote: () => vi.fn(),
}))

vi.mock('@/shared/ui/organisms/TextEditor', () => ({
	TextEditor: () => null,
}))

describe('NoteInput — cierre antes de cargar', () => {
	beforeEach(() => {
		vi.mocked(saveNotes).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe vaciar notas reales si se hace flush antes de que termine la carga inicial', async () => {
		let resolveFetch: (v: string) => void = () => {}
		vi.mocked(fetchNotes).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const ref = createRef<NoteInputHandle>()

		render(
			<QueryClientProvider client={queryClient}>
				<NoteInput ref={ref} />
			</QueryClientProvider>
		)

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-notes')
		})

		await act(async () => {
			ref.current?.flush()
		})

		expect(saveNotes).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch('notas reales que no se deben perder')
		})
	})
})
