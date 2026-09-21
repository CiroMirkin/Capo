'use client'

import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { useDocumentTitle } from '@uidotdev/usehooks'
import { Button } from '@/shared/ui/atoms/button'
import { TransitionLink } from '@/shared/ui/atoms/TransitionLink'
import { DescriptionOfCapo } from '@/shared/ui/atoms/DescriptionOfCapo'

export function Home() {
	useDocumentTitle('Capo')
	const { t } = useTranslation()
	const { bg, text } = useTheme()

	return (
		<div className={`${bg} ${text} min-h-screen flex items-center justify-center px-4`}>
			<div className='max-w-md w-full flex flex-col items-center gap-6 text-center'>
				<h1 className='text-4xl font-bold'>Capo</h1>
				<DescriptionOfCapo />
				<div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
					<Button asChild size='lg'>
						<TransitionLink to='/guest'>{t('home.try_as_guest')}</TransitionLink>
					</Button>
					<Button asChild variant='outline' size='lg'>
						<TransitionLink to='/auth'>{t('home.create_account')}</TransitionLink>
					</Button>
				</div>
			</div>
		</div>
	)
}
