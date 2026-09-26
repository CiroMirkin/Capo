'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
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
	/** botón extra que también cierra el modal; su onClick corre cuando terminó de cerrarse */
	secondaryButton?: { label: string; onClick: () => void }
}

const noopSubscribe = () => () => {}

/** Modal que se muestra una solo la primera vez que se entra a una sección. */
export function IntroDialog({
	storageKey,
	title,
	buttonLabel,
	children,
	className,
	secondaryButton,
}: Props) {
	// Radix bloquea pointer-events y atrapa el foco hasta terminar de cerrar: la acción espera a onCloseAutoFocus
	const pendingAction = useRef<(() => void) | null>(null)
	// en el server se asume visto, así el modal no aparece en el HTML inicial
	const seen = useSyncExternalStore(
		noopSubscribe,
		() => !!localStorage.getItem(storageKey),
		() => true
	)
	const [dismissed, setDismissed] = useState(false)
	const open = !seen && !dismissed

	const handleOpenChange = (next: boolean) => {
		if (next) return
		localStorage.setItem(storageKey, 'true')
		setDismissed(true)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn('sm:max-w-md', className)}
				onCloseAutoFocus={(e) => {
					if (!pendingAction.current) return
					e.preventDefault()
					pendingAction.current()
					pendingAction.current = null
				}}
			>
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
					{secondaryButton && (
						<DialogClose asChild>
							<Button
								type='button'
								variant='outline'
								onClick={() => (pendingAction.current = secondaryButton.onClick)}
							>
								{secondaryButton.label}
							</Button>
						</DialogClose>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
