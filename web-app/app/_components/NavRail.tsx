'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import {
	ArchiveIcon,
	SquareIcon,
	ColumnsIcon,
	GithubIcon,
	HomeIcon,
	HourglassIcon,
	LanguagesIcon,
	LogInIcon,
	SettingsIcon,
} from '@/shared/ui/atoms/icons'
import { useTheme } from '@/shared/hooks/useTheme'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { LANGUAGE_LOCALSTORAGE_KEY } from '@/shared/preferences/language'
import { useSidebarSide } from '@/shared/preferences/sidebar'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'
import { useSession, useBoardId } from '@/features/auth'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { cn } from '@/shared/lib/utils'
import { NavRailItem, type RailItem } from './NavRailItem'

interface NavRailProps {
	whereUserIs?: USER_IS_IN
}

/**
 * Rail de navegación vertical, solo escritorio.
 * 
 * Tres estados:
 * 1. reposo (iconos al 55%, sin fondo — glifos sueltos sobre el tablero),
 * 2. "cerca" (el cursor entra en los ~140px del borde → los iconos escalan al 100%),
 * 3. hover/foco (aparecen las etiquetas y el respaldo con el `column` del tema, ~200ms después).
 */
export default function NavRail({ whereUserIs }: NavRailProps) {
	const { t } = useTranslation()
	const { text, column, columnText } = useTheme()
	const { session } = useSession()
	const [side] = useSidebarSide()
	const boardId = useBoardId((state) => state.board_id)
	const isLargeScreen = useMediaQuery('(min-width: 1024px)')

	// `near`: el cursor está en los ~140px del borde → los iconos escalan (paso 2).
	// `active`: el cursor/foco está sobre el rail → etiquetas + respaldo, con delay (paso 3).
	const [near, setNear] = useState(false)
	const [active, setActive] = useState(false)
	const documentVisible = useVisibilityChange()
	const counterVisible = active && documentVisible
	const duration = useLastDurationPeriod({ isVisible: counterVisible })

	useEffect(() => {
		if (counterVisible) requestUsageHistoryFlush()
	}, [counterVisible])

	useEffect(() => {
		const onMove = (event: PointerEvent) => {
			const edge = side === 'right' ? window.innerWidth - event.clientX : event.clientX
			setNear(edge <= 140)
		}
		window.addEventListener('pointermove', onMove, { passive: true })
		return () => window.removeEventListener('pointermove', onMove)
	}, [side])

	const [, setLanguage] = useLocalStorage(LANGUAGE_LOCALSTORAGE_KEY, 'es')
	const toggleLanguage = () => {
		const next = (i18next.language || 'es').startsWith('en') ? 'es' : 'en'
		setLanguage(next)
		i18next.changeLanguage(next)
		document.body.dir = i18next.dir()
	}

	const items: RailItem[] = [
		{
			key: 'board',
			icon: ColumnsIcon,
			label: t('menu.board'),
			to: `/board/${boardId}`,
			current: whereUserIs === USER_IS_IN.BOARD,
			group: true,
		},
		{
			key: 'limbo',
			icon: SquareIcon,
			label: t('menu.limbo'),
			to: `/limbo/${boardId}`,
			current: whereUserIs === USER_IS_IN.LIMBO,
		},
		{
			key: 'archive',
			icon: ArchiveIcon,
			label: t('menu.archive'),
			to: `/archive/${boardId}`,
			current: whereUserIs === USER_IS_IN.ARCHIVE,
		},
		{
			key: 'time',
			icon: HourglassIcon,
			label: duration,
			to: `/time/${boardId}`,
			current: whereUserIs === USER_IS_IN.TIME,
		},
		{
			key: 'board-settings',
			icon: SettingsIcon,
			label: t('menu.configs'),
			to: `/settings/${boardId}`,
			current: whereUserIs === USER_IS_IN.CONFIG,
		},
	]

	if (session) {
		items.unshift({
			key: 'home',
			icon: HomeIcon,
			label: t('menu.home'),
			to: '/',
		})
	} else {
		// Modo invitado
		items.push({
			key: 'language',
			icon: LanguagesIcon,
			label: t('menu.language'),
			onClick: toggleLanguage,
		})
		items.push({
			key: 'login',
			icon: LogInIcon,
			label: t('sing_in'),
			to: `/auth/${boardId}`,
			current: whereUserIs === USER_IS_IN.AUTH,
			group: true,
		},{
			key: 'github',
			icon: GithubIcon,
			label: 'GitHub',
			to: 'https://github.com/CiroMirkin/Capo',
			external: true,
		})
	}

	const isRight = side === 'right'

	return (
		<div
			className={cn(
				'pointer-events-none fixed inset-y-0 z-40 hidden items-center md:flex',
				isRight ? 'right-0 justify-end' : 'left-0 justify-start'
			)}
		>
			<nav
				aria-label={t('nav.rail_label', { defaultValue: 'Navegación' })}
				onMouseEnter={() => setActive(true)}
				onMouseLeave={() => setActive(false)}
				onFocus={() => setActive(true)}
				onBlur={() => setActive(false)}
				className={cn(
					'pointer-events-auto relative flex flex-col gap-1 p-2 transition-[transform,padding] duration-150 ease-out motion-reduce:transition-none',
					// etapa 3 (activo)
					active ? columnText : text,
					near || active ? 'scale-100' : 'scale-[0.55] lg:scale-[0.7]',
					// etapa 2 (zoom)
					near && !active && (isRight ? 'pr-0' : 'pl-1'),
					// etapa 1 (reposo)
					!near && !active && 'pl-5 opacity-80',
					isRight ? 'origin-right' : 'origin-left'
				)}
			>
				{/* Respaldo temporal: entra ~200ms después de que aparece la escala (paso 2 → 3). */}
				<span
					aria-hidden
					className={cn(
						'pointer-events-none absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none shadow-sm',
						column,
						isRight ? 'rounded-l-lg' : 'rounded-r-lg',
						active ? 'opacity-100 delay-200' : 'opacity-0 delay-0'
					)}
				/>

				<div className='relative z-10 flex flex-col gap-1'>
					{items.map((item) => (
						<NavRailItem
							key={item.key}
							item={item}
							active={active}
							isLargeScreen={isLargeScreen}
						/>
					))}
				</div>
			</nav>
		</div>
	)
}
