'use client'

import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/molecules/dialog'
import { Button } from '@/shared/ui/atoms/button'
import { cn } from '@/shared/lib/utils'

interface Props {
	/** clave de localStorage que marca que el usuario ya lo cerró */
	storageKey: string
	title: string
	buttonLabel: string
	children: React.ReactNode
	className?: string
}

/** Modal que se muestra una solo la primera vez que se entra a una sección. */
export function IntroDialog({ storageKey, title, buttonLabel, children, className }: Props) {
	const [open, setOpen] = useState(false)

	useEffect(() => {
		if (!localStorage.getItem(storageKey)) setOpen(true)
	}, [storageKey])

	const handleOpenChange = (next: boolean) => {
		if (!next) localStorage.setItem(storageKey, 'true')
		setOpen(next)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className={cn('sm:max-w-md', className)}>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				{children}
				<DialogFooter className='sm:justify-start'>
					<DialogClose asChild>
						<Button type='button' variant='default'>
							{buttonLabel}
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
