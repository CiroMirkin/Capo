import type { TFunction } from 'i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { getCoreNavLinks, getGithubLink, getHomeLink, getLanguageLink, getLoginLink, getPrivacyLink, type LinkItem } from '../navLinks'

interface NavRailItemsParams {
	t: TFunction
	boardId: string
	whereUserIs?: USER_IS_IN
	duration: string
	session: boolean
	toggleLanguage: () => void
}

/** Lista de items del NavRail, en orden de render. */
export function getNavRailItems({ t, boardId, whereUserIs, duration, session, toggleLanguage }: NavRailItemsParams): LinkItem[] {
	const [firstLink, ...restLinks] = getCoreNavLinks({ t, boardId, whereUserIs, duration })
	const items: LinkItem[] = [{ ...firstLink, group: true }, ...restLinks]

	if (session) {
		items.unshift(getHomeLink(t))
	} else {
		items.push(getLanguageLink(t, toggleLanguage))
		items.push({ ...getLoginLink({ t, boardId, whereUserIs }), group: true }, getGithubLink())
	}

	items.push(getPrivacyLink(t, whereUserIs))

	return items
}
