import type { TFunction } from 'i18next'
import {
	ArchiveIcon,
	CircleHelpIcon,
	ColumnsIcon,
	GithubIcon,
	HomeIcon,
	HourglassIcon,
	IconProps,
	LanguagesIcon,
	LogInIcon,
	LogOutIcon,
	SettingsIcon,
	SquareIcon,
} from '@/shared/ui/atoms/icons'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { ComponentType } from 'react'

export interface LinkItem {
	key: string
	icon: ComponentType<IconProps>
	label: string
	to?: string
	external?: boolean
	onClick?: () => void
	/** true cuando el usuario ya está en esa sección */
	current?: boolean
	/** separa grupos: agrega aire arriba */
	group?: boolean
	/** tooltip nativo, para vistas que lo usan (p. ej. el dropdown de HeaderNav) */
	title?: string
}

export const APP_NAME = 'Capo'

interface CoreNavLinksParams {
	t: TFunction
	boardId: string
	whereUserIs?: USER_IS_IN
	duration: string
}

/**
 * Única fuente de los links "core".
 * 
 * HeaderNav y NavRail arman su lista a partir de esto.
 * 
 * HeaderNav y NavRail agregan por su cuenta los links que quedan fuera de esta lista (login/logout, idioma, etc).
 */
export function getCoreNavLinks({ t, boardId, whereUserIs, duration }: CoreNavLinksParams): LinkItem[] {
	return [
		{
			key: 'board',
			icon: ColumnsIcon,
			label: t('menu.board'),
			to: `/board/${boardId}`,
			current: whereUserIs === USER_IS_IN.BOARD,
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
			title: t('usage_history.title'),
		},
		{
			key: 'board-settings',
			icon: SettingsIcon,
			label: t('menu.configs'),
			to: `/settings/${boardId}`,
			current: whereUserIs === USER_IS_IN.CONFIG,
		},
	]
}

export function getHomeLink(t: TFunction): LinkItem {
	return { key: 'home', icon: HomeIcon, label: t('menu.home'), to: '/' }
}

export function getSettingsLink(t: TFunction, whereUserIs?: USER_IS_IN): LinkItem {
	return {
		key: 'settings',
		icon: SettingsIcon,
		label: t('menu.configs'),
		to: '/settings',
		current: whereUserIs === USER_IS_IN.CONFIG,
	}
}

export function getGithubLink(): LinkItem {
	return {
		key: 'github',
		icon: GithubIcon,
		label: 'GitHub',
		to: 'https://github.com/CiroMirkin/Capo',
		external: true,
	}
}

export function getHelpLink(t: TFunction, whereUserIs?: USER_IS_IN): LinkItem {
	return {
		key: 'help',
		icon: CircleHelpIcon,
		label: t('menu.help'),
		to: '/help',
		current: whereUserIs === USER_IS_IN.HELP,
		group: true,
	}
}

interface LoginLinkParams {
	t: TFunction
	boardId: string
	whereUserIs?: USER_IS_IN
}

/** `group` lo decide quien arma la lista: distintas vistas cortan sección en distinto lugar. */
export function getLoginLink({ t, boardId, whereUserIs }: LoginLinkParams): LinkItem {
	return {
		key: 'login',
		icon: LogInIcon,
		label: t('sing_in'),
		to: `/auth/${boardId}`,
		current: whereUserIs === USER_IS_IN.AUTH,
	}
}

export function getLogoutLink(t: TFunction, onClick: () => void): LinkItem {
	return { key: 'logout', icon: LogOutIcon, label: t('log_out'), onClick }
}

/** Sin `to`: es una acción (toggle), no una ruta. */
export function getLanguageLink(t: TFunction, onClick: () => void): LinkItem {
	return { key: 'language', icon: LanguagesIcon, label: t('menu.language'), onClick }
}
