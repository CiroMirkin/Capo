'use client'

import { useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { EllipsisVerticalIcon } from '@/shared/ui/atoms/icons'
import { cn } from '@/shared/lib/utils'

interface Props {
	children: React.ReactNode
	className?: string
	/** Título/aria-label del botón "..." (default: "Más opciones"). */
	label?: string
	/** `data-testid` del botón "..." (para pruebas E2E). */
	testId?: string
}

/**
 * Menú Kebab ("...")
 */
export function KebabMenu({ children, className, label, testId }: Props) {
	const { t } = useTranslation()
	const reduceMotion = useReducedMotion()
	const [open, setOpen] = useState(false)
	const menuLabel = label ?? t('task_buttons.more')

	return (
		<PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
			<PopoverPrimitive.Trigger asChild>
				<button
					type='button'
					title={menuLabel}
					aria-label={menuLabel}
					data-testid={testId}
					className={cn(
						'px-1 flex items-center justify-center rounded-md transition-opacity',
						className
					)}
				>
					<EllipsisVerticalIcon />
				</button>
			</PopoverPrimitive.Trigger>

			<AnimatePresence>
				{open && (
					<PopoverPrimitive.Portal forceMount>
						<PopoverPrimitive.Content
							forceMount
							side='bottom'
							align='start'
							sideOffset={6}
							className='z-50'
						>
							<LazyMotion features={domAnimation}>
								<m.div
									initial={{
										opacity: 0,
										scale: reduceMotion ? 1 : 0.9,
										filter: reduceMotion ? undefined : 'blur(4px)',
									}}
									animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
									exit={{
										opacity: 0,
										scale: reduceMotion ? 1 : 0.9,
										filter: reduceMotion ? undefined : 'blur(4px)',
									}}
									transition={{
										type: 'spring',
										bounce: 0.16,
										duration: reduceMotion ? 0.1 : 0.4,
									}}
									style={{ transformOrigin: 'top left' }}
									className='flex w-max flex-col gap-0.5 rounded-sm border border-border bg-popover p-1.5 text-popover-foreground shadow-lg'
								>
									{children}
								</m.div>
							</LazyMotion>
						</PopoverPrimitive.Content>
					</PopoverPrimitive.Portal>
				)}
			</AnimatePresence>
		</PopoverPrimitive.Root>
	)
}
