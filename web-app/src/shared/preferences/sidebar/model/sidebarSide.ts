export const sidebarSideLocalStorageKey = 'sidebar-side'

export type SidebarSide = 'left' | 'right'

export const defaultSidebarSide: SidebarSide = 'left'

export const isValidSidebarSide = (value: string | SidebarSide): value is SidebarSide => {
	return value === 'left' || value === 'right'
}
