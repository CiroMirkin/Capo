import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTagsQuery } from './useTagsQuery'
import { fetchTags, saveTags } from '../api/repository/tagRepositoryFactory'
import { useBoardId } from '@/features/auth/state/store'
import type { TagRepositoryGetReturn } from '../api/repository/tagRepository'

vi.mock('../api/repository/tagRepositoryFactory', () => ({
	fetchTags: vi.fn(),
	saveTags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useTagsQuery — carrera contra la carga inicial', () => {
	beforeEach(() => {
		vi.mocked(fetchTags).mockClear()
		vi.mocked(saveTags).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe pisar los tags reales si se togglea un grupo antes de que termine la carga inicial', async () => {
		const realTags: TagRepositoryGetReturn = {
			actualTagGroup: { id: 'real-group', tags: [{ id: 't1', name: 'Real' }] },
			tags: [{ id: 'real-group', tags: [{ id: 't1', name: 'Real' }] }],
		}

		let resolveFetch: (v: TagRepositoryGetReturn) => void = () => {}
		vi.mocked(fetchTags).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useTagsQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-tags')
		})

		// El fetch real todavía no resolvió.
		expect(result.current.tags).toBeUndefined()

		await act(async () => {
			result.current.updateTags({
				tags: [],
				actualTagGroup: { id: 'other-group', tags: [] },
			})
			await Promise.resolve()
			await Promise.resolve()
		})

		expect(saveTags).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch(realTags)
		})
	})
})
