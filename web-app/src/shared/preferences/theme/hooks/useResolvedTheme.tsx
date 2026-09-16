'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from '@/features/auth'
import { useBoardQuery } from '@/features/boards/hooks/useBoardQuery'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { darkTheme, lightTheme, type Theme } from '../model/themesList'
import { resolveTheme } from '../model/resolveTheme'
import type { ChangeTheme } from '../state/ThemeContext'
import { useThemesQuery } from './useThemesQuery'
import { useDashboardTheme } from './useDashboardTheme'

// /board|settings|archive|limbo/<id> muestran el tema de ese tablero
// el resto de rutas muestran el tema del dashboard
const BOARD_ROUTE = /^\/(?:board|settings|archive|limbo)\/([^/]+)/

/**
 * Resuelve el tema activo según la ruta y la sesión.
 * Invitado: `localStorage` (comportamiento actual).
 * Logueado: tema del tablero o del dashboard.
 */
export const useResolvedTheme = (): { theme: Theme; changeTheme: ChangeTheme } => {
	const { session } = useSession()
	const pathname = usePathname()

	const [guestTheme, setGuestTheme] = useLocalStorage<Theme>('capo-theme', lightTheme)
	useEffect(() => {
		try {
			if (window.localStorage.getItem('capo-theme') !== null) return
		} catch {
			return
		}
		if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setGuestTheme(darkTheme)
	}, [setGuestTheme])

	const { themes } = useThemesQuery()
	const { themeId: dashboardThemeId } = useDashboardTheme()

	const boardId = pathname?.match(BOARD_ROUTE)?.[1] ?? ''
	const { board } = useBoardQuery(boardId)

	if (!session) return { theme: guestTheme, changeTheme: setGuestTheme }

	const activeId = boardId ? board?.themeId : dashboardThemeId
	return { theme: resolveTheme(activeId, themes), changeTheme: () => {} }
}
