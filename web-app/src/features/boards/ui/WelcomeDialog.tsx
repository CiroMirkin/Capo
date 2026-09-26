'use client'

import { useTranslation } from 'react-i18next'
import { IntroDialog } from '@/shared/ui/molecules/IntroDialog'
import { DescriptionOfCapo } from '@/shared/ui/atoms/DescriptionOfCapo'
import { Button } from '@/shared/ui/atoms/button'
import { LanguagesIcon } from '@/shared/ui/atoms/icons'
import { useLanguageToggle } from '@/shared/preferences/language'
import { startBoardTour } from './boardTour'

export function WelcomeDialog() {
	const { t } = useTranslation()
	const toggleLanguage = useLanguageToggle()
	return (
		<IntroDialog storageKey='capo-welcome-dialog' title={t('welcome_dialog.title')}>
			<DescriptionOfCapo />

			<IntroDialog.Footer className='w-full flex-row justify-between sm:justify-between'>
				<div className='flex gap-2'>
					<IntroDialog.CloseDialog>{t('welcome_dialog.start')}</IntroDialog.CloseDialog>
					<IntroDialog.CloseDialog variant='outline' onClosed={() => startBoardTour(t)}>
						{t('welcome_dialog.tour')}
					</IntroDialog.CloseDialog>
				</div>
				<Button
					type='button'
					variant='ghost'
					onClick={toggleLanguage}
					title={t('menu.language')}
					aria-label={t('menu.language')}
					className='opacity-90'
				>
					<LanguagesIcon className='h-4 w-4' />
				</Button>
			</IntroDialog.Footer>
		</IntroDialog>
	)
}
