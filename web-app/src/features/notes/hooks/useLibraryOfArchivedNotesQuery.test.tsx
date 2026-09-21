import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useLibraryOfArchivedNotesQuery } from './useLibraryOfArchivedNotesQuery'
import {
	fetchLibraryOfArchivedNotes,
	saveLibraryOfArchivedNotes,
} from '../api/repository/libraryOfArchivedNotesRepositoryFactory'
import { useBoardId } from '@/features/auth/state/store'
import type { LibraryOfArchivedNotes } from '../model/libraryOfArchivedNotes'

vi.mock('../api/repository/libraryOfArchivedNotesRepositoryFactory', () => ({
	fetchLibraryOfArchivedNotes: vi.fn(),
	saveLibraryOfArchivedNotes: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useLibraryOfArchivedNotesQuery — carrera contra la carga inicial', () => {
	beforeEach(() => {
		vi.mocked(fetchLibraryOfArchivedNotes).mockClear()
		vi.mocked(saveLibraryOfArchivedNotes).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe pisar la librería real si se archiva una nota antes de que termine la carga inicial', async () => {
		const realLibrary: LibraryOfArchivedNotes = {
			archive: [{ id: 'old-1', note: 'Nota vieja', date: new Date() }],
		}

		let resolveFetch: (v: LibraryOfArchivedNotes) => void = () => {}
		vi.mocked(fetchLibraryOfArchivedNotes).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useLibraryOfArchivedNotesQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-library')
		})

		// El fetch real todavía no resolvió.
		expect(result.current.archivedNotes).toBeUndefined()

		const newLibrary: LibraryOfArchivedNotes = {
			archive: [{ id: 'new-1', note: 'Nota nueva', date: new Date() }],
		}
		await act(async () => {
			result.current.updateArchivedNotes(newLibrary)
			await Promise.resolve()
			await Promise.resolve()
		})

		expect(saveLibraryOfArchivedNotes).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch(realLibrary)
		})
	})
})
