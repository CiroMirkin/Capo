import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { IntroDialog } from '@/shared/ui/molecules/IntroDialog'
import PageContainer from '../../_components/PageContainer'
import { UsageHistory } from '@/features/usage-history'
import { useTranslation } from 'react-i18next'
import { useSyncBoardIdFromRoute } from '@/features/auth'

export function TimeTracking() {
	const { t } = useTranslation()
	useSyncBoardIdFromRoute()
	return (
		<PageContainer
			title={t('usage_history.title')}
			whereUserIs={USER_IS_IN.TIME}
			className='px-6 md:px-11 pb-6 pt-4'
		>
			<UsageHistory />
			<IntroDialog storageKey='capo-usage-history-intro' title={t('usage_history.title')}>
				<p>{t('intro_dialog.usage_history')}</p>
				<IntroDialog.Footer>
					<IntroDialog.CloseDialog>{t('intro_dialog.got_it')}</IntroDialog.CloseDialog>
				</IntroDialog.Footer>
			</IntroDialog>
		</PageContainer>
	)
}
