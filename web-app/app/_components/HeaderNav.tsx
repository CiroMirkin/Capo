'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useTheme } from '@/shared/hooks/useTheme'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/molecules/dropdown-menu'
import {
	ArchiveIcon,
	SquareIcon,
	CircleHelpIcon,
	ColumnsIcon,
	GithubIcon,
	HourglassIcon,
	MenuIcon,
	SettingsIcon,
} from '@/shared/ui/atoms/icons'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { LanguageToggle } from '@/shared/preferences/language'
import { LogInAndLogOutMenuItem, useSession, useBoardId } from '@/features/auth'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { cn } from '@/shared/lib/utils'

interface HeaderNavProps {
	whereUserIs?: USER_IS_IN
	showBoardLinks: boolean
}

export function HeaderNav({ whereUserIs, showBoardLinks }: HeaderNavProps) {
	const { t } = useTranslation()
	const { session } = useSession()
	const { text } = useTheme()
	const boardId = useBoardId((state) => state.board_id)

	const URLs = {
		board: `/board/${boardId}`,
		limbo: `/limbo/${boardId}`,
		archive: `/archive/${boardId}`,
		boardSettings: `/settings/${boardId}`,
		settings: '/settings',
		time: `/time/${boardId}`,
	}

	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const documentVisible = useVisibilityChange()

	const isVisible = isDropdownOpen && documentVisible
	const duration = useLastDurationPeriod({ isVisible })

	useEffect(() => {
		if (isVisible) requestUsageHistoryFlush()
	}, [isVisible])

	const showDashboardLink = session && whereUserIs !== USER_IS_IN.DASHBOARD

	return (
		<DropdownMenu onOpenChange={setIsDropdownOpen}>
			{/* En escritorio, dentro del tablero, la navegación vive en el NavRail. */}
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
				<DropdownMenuLabel className={cn(showDashboardLink && 'rounded-sm hover:bg-accent')}>
					{showDashboardLink && (
						<TransitionLink to='/' className='block w-full hover:underline'>
							Inicio
						</TransitionLink>
					)}
					{!showDashboardLink && 'Capo'}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{!showBoardLinks && (
					<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.CONFIG}>
						<TransitionLink to={URLs.settings} className='px-2 py-1.5 flex items-center'>
							<SettingsIcon className='mr-2' /> {t('menu.configs')}
						</TransitionLink>
					</DropdownMenuItem>
				)}
				{showBoardLinks && (
					<>
						<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.BOARD}>
							<TransitionLink to={URLs.board} className='px-2 py-1.5 flex items-center'>
								<ColumnsIcon className='mr-2' /> {t('menu.board')}
							</TransitionLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.LIMBO}>
							<TransitionLink to={URLs.limbo} className='px-2 py-1.5 flex items-center'>
								<SquareIcon className='mr-2' /> {t('menu.limbo')}
							</TransitionLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.ARCHIVE}>
							<TransitionLink to={URLs.archive} className='px-2 py-1.5 flex items-center'>
								<ArchiveIcon className='mr-2' /> {t('menu.archive')}
							</TransitionLink>
						</DropdownMenuItem>
						<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.CONFIG}>
							<TransitionLink
								to={URLs.boardSettings}
								className='px-2 py-1.5 flex items-center'
							>
								<SettingsIcon className='mr-2' /> {t('menu.configs')}
							</TransitionLink>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}
				<LanguageToggle />
				<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.HELP}>
					<TransitionLink to='/help' className='px-2 py-1.5 flex items-center'>
						<CircleHelpIcon className='mr-2' /> {t('menu.help')}
					</TransitionLink>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<a href='https://github.com/CiroMirkin/Capo' className='px-2 py-1.5 flex items-center'>
						<GithubIcon className='mr-2' /> GitHub
					</a>
				</DropdownMenuItem>
				{showBoardLinks && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild disabled={whereUserIs === USER_IS_IN.TIME}>
							<TransitionLink
								title={t('usage_history.title')}
								to={URLs.time}
								className='px-2 py-1.5 flex items-center'
							>
								<HourglassIcon className='mr-2' /> {duration}
							</TransitionLink>
						</DropdownMenuItem>
					</>
				)}
				<DropdownMenuSeparator />
				<LogInAndLogOutMenuItem whereUserIs={whereUserIs} session={session} />
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
