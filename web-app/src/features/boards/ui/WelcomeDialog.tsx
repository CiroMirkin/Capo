'use client'

import { useTranslation } from 'react-i18next'
import { IntroDialog } from '@/shared/ui/molecules/IntroDialog'
import { DescriptionOfCapo } from '@/shared/ui/atoms/DescriptionOfCapo'

export function WelcomeDialog() {
	const { t } = useTranslation()
	return (
		<IntroDialog storageKey='capo-welcome-dialog' title={t('welcome_dialog.title')}>
			<DescriptionOfCapo />
			<IntroDialog.Footer>
				<IntroDialog.CloseDialog>{t('welcome_dialog.start')}</IntroDialog.CloseDialog>
			</IntroDialog.Footer>
		</IntroDialog>
	)
}
