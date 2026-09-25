'use client'

import { useTranslation } from 'react-i18next'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useSyncBoardIdFromRoute } from '@/features/auth'
import { Limbo } from '@/features/limbo'
import { IntroDialog } from '@/shared/ui/molecules/IntroDialog'
import PageContainer from '../../_components/PageContainer'

export function LimboPage() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	return (
		<PageContainer title={t('menu.limbo')} whereUserIs={USER_IS_IN.LIMBO}>
			<Limbo />
			<IntroDialog
				storageKey='capo-limbo-intro'
				title={t('menu.limbo')}
				buttonLabel={t('intro_dialog.got_it')}
			>
				<p>{t('intro_dialog.limbo')}</p>
			</IntroDialog>
		</PageContainer>
	)
}
