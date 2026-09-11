'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import {
	Archive,
	Square,
	Columns3,
	Github,
	Home,
	Hourglass,
	Languages,
	LogIn,
	Settings,
} from 'lucide-react'
import { useTheme } from '@/shared/hooks/useTheme'
import { useVisibilityChange } from '@/shared/hooks/useVisibilityChange'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'
import { LANGUAGE_LOCALSTORAGE_KEY } from '@/shared/preferences/language'
import { useSidebarSide } from '@/shared/preferences/sidebar'
import { useLastDurationPeriod, requestUsageHistoryFlush } from '@/features/usage-history'
import { useSession, useBoardId } from '@/features/auth'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { cn } from '@/shared/lib/utils'

interface NavRailProps {
	whereUserIs?: USER_IS_IN
}

interface RailItem {
	key: string
	icon: ComponentType<{ size?: number | string }>
	label: string
	to?: string
	external?: boolean
	onClick?: () => void
	/** true cuando el usuario ya está en esa sección */
	current?: boolean
	/** separa grupos: agrega aire arriba */
	group?: boolean
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
			icon: Columns3,
			label: t('menu.board'),
			to: `/board/${boardId}`,
			current: whereUserIs === USER_IS_IN.BOARD,
			group: true,
		},
		{
			key: 'limbo',
			icon: Square,
			label: t('menu.limbo'),
			to: `/limbo/${boardId}`,
			current: whereUserIs === USER_IS_IN.LIMBO,
		},
		{
			key: 'archive',
			icon: Archive,
			label: t('menu.archive'),
			to: `/archive/${boardId}`,
			current: whereUserIs === USER_IS_IN.ARCHIVE,
		},
		{
			key: 'time',
			icon: Hourglass,
			label: duration,
			to: `/time/${boardId}`,
			current: whereUserIs === USER_IS_IN.TIME,
		},
		{
			key: 'board-settings',
			icon: Settings,
			label: t('menu.configs'),
			to: `/settings/${boardId}`,
			current: whereUserIs === USER_IS_IN.CONFIG,
		},
	]

	if (session) {
		items.unshift({
			key: 'home',
			icon: Home,
			label: t('menu.home'),
			to: '/',
		})
	} else {
		// Modo invitado
		items.push({
			key: 'language',
			icon: Languages,
			label: t('menu.language'),
			onClick: toggleLanguage,
		})
		items.push({
			key: 'login',
			icon: LogIn,
			label: t('sing_in'),
			to: `/auth/${boardId}`,
			current: whereUserIs === USER_IS_IN.AUTH,
			group: true,
		},{
			key: 'github',
			icon: Github,
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
					near || active ? 'scale-100' : 'scale-[0.55]',
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
					{items.map((item) => {
						const Icon = item.icon
						const body = (
							<>
								<Icon size={20} />
								<span
									className={cn(
										'overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity] duration-150 motion-reduce:transition-none',
										active
											? 'max-w-[15rem] opacity-100 delay-200'
											: 'max-w-0 opacity-0 delay-0'
									)}
								>
									{item.label}
								</span>
							</>
						)
						
						const shared =
							'flex items-center gap-3 rounded-sm px-2 py-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground'

						let control
						if (item.current) {
							control = (
								<span
									aria-current='page'
									className={cn(shared, 'pointer-events-none opacity-40')}
								>
									{body}
								</span>
							)
						} else if (item.onClick) {
							control = (
								<button type='button' onClick={item.onClick} className={shared}>
									{body}
								</button>
							)
						} else if (item.external) {
							control = (
								<a href={item.to} target='_blank' rel='noreferrer' className={shared}>
									{body}
								</a>
							)
						} else {
							control = (
								<TransitionLink to={item.to as string} className={shared}>
									{body}
								</TransitionLink>
							)
						}

						return (
							<div key={item.key} className='contents'>
								{item.group && (
									// divisor que solo aparece con el rail desplegado
									<hr
										className={cn(
											'my-2 h-px border-0 transition-colors duration-150',
											active ? 'bg-muted' : 'bg-transparent'
										)}
									/>
								)}
								{control}
							</div>
						)
					})}
				</div>
			</nav>
		</div>
	)
}
