'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { useLanguageToggle } from '@/shared/preferences/language'
import { useSidebarSide } from '@/shared/preferences/sidebar'
import { useSession, useBoardId } from '@/features/auth'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { cn } from '@/shared/lib/utils'
import { NavRailItem } from './NavRailItem'
import { NavRailBackdrop } from './NavRailBackdrop'
import { NavRailBrand } from './NavRailBrand'
import { getNavRailItems } from './getNavRailItems'
import { getNavRailStageClassName } from './navRailStageClassName'
import { useNearEdge } from './useNearEdge'
import { useNavRailDuration } from './useNavRailDuration'
import { ShareBoardDialog } from '@/features/board-share'

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
	const [active, setActive] = useState(false)
	const [isShareOpen, setIsShareOpen] = useState(false)
	const duration = useNavRailDuration(active)

	const toggleLanguage = useLanguageToggle()

	const items = getNavRailItems({ t, boardId, whereUserIs, duration, session: !!session, toggleLanguage, onShare: () => setIsShareOpen(true) })

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
				className={getNavRailStageClassName({ isRight, near, active, text, columnText })}
			>
				<NavRailBackdrop column={column} isRight={isRight} active={active} />
				<NavRailBrand session={!!session} active={active} />

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
			{session && (
				<ShareBoardDialog boardId={boardId} open={isShareOpen} onOpenChange={setIsShareOpen} />
			)}
		</div>
	)
}
