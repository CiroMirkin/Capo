import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'

/** Identifica una página de un tablero: cada una guarda su propio fondo. */
export interface PageId {
	boardId: string
	whereUserIs: USER_IS_IN
}

export const pageSurfaceLocalStorageKey = ({ boardId, whereUserIs }: PageId) =>
	`page-surface:${boardId}-${whereUserIs}`

/** Fondo de la página: el del tablero (`bg`) o el de las columnas (`column`) del tema. */
export type PageSurface = 'board' | 'column'

export const defaultPageSurface: PageSurface = 'board'

export const isValidPageSurface = (value: string | PageSurface): value is PageSurface => {
	return value === 'board' || value === 'column'
}
