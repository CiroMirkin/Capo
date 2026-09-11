'use client'

import { useTranslation } from 'react-i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useSyncBoardIdFromRoute } from '@/features/auth'
import { Limbo } from '@/features/limbo'
import PageContainer from '../../_components/PageContainer'

export function LimboPage() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	return (
		<PageContainer title={t('menu.limbo')} whereUserIs={USER_IS_IN.LIMBO}>
			<Limbo />
		</PageContainer>
	)
}
