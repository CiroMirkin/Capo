'use client'

import { useTranslation } from 'react-i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useBoardId, useSyncBoardIdFromRoute } from '@/features/auth'
import { Whiteboard } from '@/features/whiteboard'
import PageContainer from '../../_components/PageContainer'

export function WhiteboardPage() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	const boardId = useBoardId((state) => state.board_id)
	return (
		<PageContainer
			title={t('menu.whiteboard')}
			whereUserIs={USER_IS_IN.WHITEBOARD}
			allowSurface
			pageId={{
				boardId,
				whereUserIs: USER_IS_IN.WHITEBOARD,
			}}
		>
			<Whiteboard />
		</PageContainer>
	)
}
