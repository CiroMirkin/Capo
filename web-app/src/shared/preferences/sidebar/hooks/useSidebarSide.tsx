import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import {
	defaultSidebarSide,
	isValidSidebarSide,
	SidebarSide,
	sidebarSideLocalStorageKey,
} from '../model/sidebarSide'

export const useSidebarSide = (): [SidebarSide, (side: SidebarSide) => void] => {
	const [side, setSide] = useLocalStorage<SidebarSide>(
		sidebarSideLocalStorageKey,
		defaultSidebarSide
	)
	return [isValidSidebarSide(side) ? side : defaultSidebarSide, setSide]
}
