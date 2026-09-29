'use client'

import { useTranslation } from 'react-i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useSyncBoardIdFromRoute } from '@/features/auth'
import { Whiteboard } from '@/features/whiteboard'
import PageContainer from '../../_components/PageContainer'

export function WhiteboardPage() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	return (
		<PageContainer title={t('menu.whiteboard')} whereUserIs={USER_IS_IN.WHITEBOARD}>
			<Whiteboard />
		</PageContainer>
	)
}
