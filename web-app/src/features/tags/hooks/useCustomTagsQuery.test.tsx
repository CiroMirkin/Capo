import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useCustomTagsQuery } from './useCustomTagsQuery'
import { fetchCustomTags, saveCustomTags } from '../api/repository/customTagRepositoryFactory'
import { useBoardId } from '@/features/auth/state/store'
import type { Tag } from '../model/tags'

vi.mock('../api/repository/customTagRepositoryFactory', () => ({
	fetchCustomTags: vi.fn(),
	saveCustomTags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/features/auth', async () => ({
	useSession: () => ({ session: { user: { id: 'u1' } }, isLoading: false }),
	useBoardId: (await import('@/features/auth/state/store')).useBoardId,
}))

describe('useCustomTagsQuery — carrera contra la carga inicial', () => {
	beforeEach(() => {
		vi.mocked(fetchCustomTags).mockClear()
		vi.mocked(saveCustomTags).mockClear()
		useBoardId.setState({ board_id: '' })
	})

	it('no debe pisar los tags reales si se crea uno antes de que termine la carga inicial', async () => {
		const realTags: Tag[] = [{ id: 'old-1', name: 'Viejo' }]

		let resolveFetch: (v: Tag[]) => void = () => {}
		vi.mocked(fetchCustomTags).mockReturnValue(
			new Promise((resolve) => {
				resolveFetch = resolve
			})
		)

		const queryClient = new QueryClient()
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		)

		const { result } = renderHook(() => useCustomTagsQuery(), { wrapper })

		act(() => {
			useBoardId.getState().setBoardId('board-with-real-tags')
		})

		// El fetch real todavía no resolvió: `customTags` sigue siendo el placeholder `[]`.
		expect(result.current.customTags).toEqual([])

		const newTag: Tag = { id: 'new-1', name: 'Nuevo' }
		await act(async () => {
			result.current.updateCustomTags([...result.current.customTags, newTag])
			await Promise.resolve()
			await Promise.resolve()
		})

		expect(saveCustomTags).not.toHaveBeenCalled()

		await act(async () => {
			resolveFetch(realTags)
		})
	})
})
