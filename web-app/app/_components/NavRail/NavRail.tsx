'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useLanguageToggle } from '@/shared/preferences/language'
import { useSidebarSide } from '@/shared/preferences/sidebar'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'
import { useSession, useBoardId } from '@/features/auth'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { cn } from '@/shared/lib/utils'
import { NavRailItem } from './NavRailItem'
import { getNavRailItems } from './getNavRailItems'
import { useNearEdge } from './useNearEdge'
import { APP_NAME } from '../navLinks'

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
export function NavRail({ whereUserIs }: NavRailProps) {
	const { t } = useTranslation()
	const { text, column, columnText } = useTheme()
	const { session } = useSession()
	const [side] = useSidebarSide()
	const boardId = useBoardId((state) => state.board_id)
	const isLargeScreen = useMediaQuery('(min-width: 1024px)')

	const near = useNearEdge(side)
	// `active`: el cursor/foco está sobre el rail → etiquetas + respaldo, con delay (paso 3).
	const [active, setActive] = useState(false)
	const documentVisible = useVisibilityChange()
	const counterVisible = active && documentVisible
	const duration = useLastDurationPeriod({ isVisible: counterVisible })

	useEffect(() => {
		if (counterVisible) requestUsageHistoryFlush()
	}, [counterVisible])

	const toggleLanguage = useLanguageToggle()

	const items = getNavRailItems({ t, boardId, whereUserIs, duration, session: !!session, toggleLanguage })

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

				{!session && (
					<span
						className={cn(
							'relative z-10 overflow-hidden whitespace-nowrap px-2 pb-1 text-sm font-medium transition-[max-width,opacity] duration-150 motion-reduce:transition-none',
							active ? 'max-w-[15rem] opacity-100 delay-200' : 'max-w-0 opacity-0 delay-0'
						)}
					>
						{APP_NAME}
					</span>
				)}
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
