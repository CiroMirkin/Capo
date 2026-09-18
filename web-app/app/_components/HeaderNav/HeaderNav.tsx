'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useTheme } from '@/shared/hooks/useTheme'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/shared/ui/molecules/dropdown-menu'
import { MenuIcon } from '@/shared/ui/atoms/icons'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useLanguageToggle } from '@/shared/preferences/language'
import { useSession, useBoardId, useLogout } from '@/features/auth'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'
import { cn } from '@/shared/lib/utils'
import {
	APP_NAME,
	getCoreNavLinks,
	getGithubLink,
	getHelpLink,
	getHomeLink,
	getLanguageLink,
	getLoginLink,
	getLogoutLink,
	getSettingsLink,
	type LinkItem,
} from '../navLinks'
import { DropdownLink } from './DropdownLink'

interface HeaderNavItemsParams {
	t: TFunction
	boardId: string
	whereUserIs?: USER_IS_IN
	duration: string
	/** false = fuera de un tablero: sólo el link de ajustes globales */
	showBoardLinks: boolean
	session: boolean
	toggleLanguage: () => void
	onLogout: () => void
}

/** Lista completa de items del dropdown de HeaderNav, en orden de render. */
function getHeaderNavItems({
	t,
	boardId,
	whereUserIs,
	duration,
	showBoardLinks,
	session,
	toggleLanguage,
	onLogout,
}: HeaderNavItemsParams): LinkItem[] {
	const [firstLink, ...restLinks] = showBoardLinks
		? getCoreNavLinks({ t, boardId, whereUserIs, duration })
		: [getSettingsLink(t, whereUserIs)]
	const mainLinks = [{ ...firstLink, group: true }, ...restLinks]

	const authItem: LinkItem = session
		? getLogoutLink(t, onLogout)
		: getLoginLink({ t, boardId, whereUserIs })

	const items = [
		...mainLinks,
		{ ...getLanguageLink(t, toggleLanguage), group: true },
		authItem,
		getGithubLink(),
		getHelpLink(t, whereUserIs),
	]

	if (session && whereUserIs !== USER_IS_IN.DASHBOARD) {
		items.unshift(getHomeLink(t))
	}

	return items
}

interface HeaderNavProps {
	whereUserIs?: USER_IS_IN
	showBoardLinks: boolean
}

export function HeaderNav({ whereUserIs, showBoardLinks }: HeaderNavProps) {
	const { t } = useTranslation()
	const { session } = useSession()
	const { text } = useTheme()
	const boardId = useBoardId((state) => state.board_id)
	const logout = useLogout()

	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const documentVisible = useVisibilityChange()

	const isVisible = isDropdownOpen && documentVisible
	const duration = useLastDurationPeriod({ isVisible })

	useEffect(() => {
		if (isVisible) requestUsageHistoryFlush()
	}, [isVisible])

	const toggleLanguage = useLanguageToggle()

	const items = getHeaderNavItems({
		t,
		boardId,
		whereUserIs,
		duration,
		showBoardLinks,
		session: !!session,
		toggleLanguage,
		onLogout: logout,
	})

	return (
		<DropdownMenu onOpenChange={setIsDropdownOpen}>
			<DropdownMenuTrigger
				className={cn(
					'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10',
					text,
					showBoardLinks && 'md:hidden'
				)}
				data-testid='NavBtn'
			>
				<MenuIcon />
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>{APP_NAME}</DropdownMenuLabel>
				{items.map((item) => (
					<DropdownLink key={item.key} item={item} />
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
