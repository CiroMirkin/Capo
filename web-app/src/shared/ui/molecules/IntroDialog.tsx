'use client'

import { createContext, useContext, useRef, useState, useSyncExternalStore } from 'react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/shared/ui/molecules/dialog'
import { Button, type ButtonProps } from '@/shared/ui/atoms/button'
import { cn } from '@/shared/lib/utils'

interface Props {
	/** clave de localStorage que marca que el usuario ya lo cerró */
	storageKey: string
	title: string
	children: React.ReactNode
	className?: string
}

const noopSubscribe = () => () => {}

/** Radix bloquea pointer-events y atrapa el foco hasta terminar de cerrar: la acción espera a onCloseAutoFocus */
type PendingAction = React.MutableRefObject<(() => void) | null>
const PendingActionContext = createContext<PendingAction | null>(null)

/** Modal que se muestra una solo la primera vez que se entra a una sección. */
export function IntroDialog({ storageKey, title, children, className }: Props) {
	const pendingAction = useRef<(() => void) | null>(null)
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
		<PendingActionContext.Provider value={pendingAction}>
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
				</DialogContent>
			</Dialog>
		</PendingActionContext.Provider>
	)
}

/** Botonera del modal. */
function Footer({ children, className }: { children: React.ReactNode; className?: string }) {
	return <DialogFooter className={cn('sm:justify-start', className)}>{children}</DialogFooter>
}

interface CloseDialogProps {
	/** texto del botón */
	children: React.ReactNode
	variant?: ButtonProps['variant']
	className?: string
	/** corre cuando el modal terminó de cerrarse */
	onClosed?: () => void
}

/** Botón que cierra el modal (y marca el flag). */
function CloseDialog({ children, variant = 'default', className, onClosed }: CloseDialogProps) {
	const pendingAction = useContext(PendingActionContext)
	return (
		<DialogClose asChild>
			<Button
				type='button'
				variant={variant}
				className={className}
				onClick={() => {
					if (onClosed && pendingAction) pendingAction.current = onClosed
				}}
			>
				{children}
			</Button>
		</DialogClose>
	)
}

IntroDialog.Footer = Footer
IntroDialog.CloseDialog = CloseDialog
