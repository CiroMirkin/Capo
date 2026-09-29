import { useCallback } from 'react'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import {
	defaultPageSurface,
	isValidPageSurface,
	PageId,
	PageSurface,
	pageSurfaceLocalStorageKey,
} from '../model/pageSurface'

/**
 * Cada tablero y cada página guardan su propio valor.
 *
 * @param pageId `{ boardId, whereUserIs }`
 * @returns un toggle que alterna entre 'board' y 'column'.
 */
export const usePageSurface = (pageId: PageId): [PageSurface, () => void] => {
	const [surface, setSurface] = useLocalStorage<PageSurface>(
		pageSurfaceLocalStorageKey(pageId),
		defaultPageSurface
	)

	const toggleSurface = useCallback(
		() => setSurface((prev) => (prev === 'column' ? 'board' : 'column')),
		[setSurface]
	)

	return [isValidPageSurface(surface) ? surface : defaultPageSurface, toggleSurface]
}
