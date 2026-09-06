'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/molecules/dialog'
import { Button } from '@/shared/ui/atoms/button'
import { DescriptionOfCapo } from '@/shared/ui/atoms/DescriptionOfCapo'

const STORAGE_KEY = 'capo-welcome-dialog'

export function WelcomeDialog() {
	const { t } = useTranslation()
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (localStorage.getItem(STORAGE_KEY)) return
		localStorage.setItem(STORAGE_KEY, 'true')
		setOpen(true)
	}, [])

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>{t('welcome_dialog.title')}</DialogTitle>
				</DialogHeader>
				<DescriptionOfCapo />
				<DialogFooter className='sm:justify-start'>
					<DialogClose asChild>
						<Button type='button' variant='default'>
							{t('welcome_dialog.start')}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
