import type { TFunction } from 'i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { getCoreNavLinks, getHomeLink, getLanguageLink, getLoginLink, getShareLink, type LinkItem } from '../navLinks'

interface NavRailItemsParams {
	t: TFunction
	boardId: string
	whereUserIs?: USER_IS_IN
	duration: string
	session: boolean
	toggleLanguage: () => void
	onShare: () => void
}

/** Lista de items del NavRail, en orden de render. */
export function getNavRailItems({ t, boardId, whereUserIs, duration, session, toggleLanguage, onShare }: NavRailItemsParams): LinkItem[] {
	const [firstLink, ...restLinks] = getCoreNavLinks({ t, boardId, whereUserIs, duration })
	const items: LinkItem[] = [{ ...firstLink, group: true }, ...restLinks]

	if (session) {
		items.push(getShareLink(t, onShare))
		items.unshift(getHomeLink(t))
	} else {
		items.push(getLanguageLink(t, toggleLanguage))
		items.push({ ...getLoginLink({ t, boardId, whereUserIs }), group: true })
	}

	return items
}
