'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { Editor } from '@tiptap/react'
import { Link as LinkIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/atoms/button'
import { Input } from '@/shared/ui/atoms/input'
import { cn } from '@/shared/lib/utils'

// Popover propio (sin portal) para editar enlaces: al vivir dentro del Sheet/Dialog
// del editor evita la pelea de focus entre traps anidados que deja el input inutilizable.
const LinkPopover = ({ editor }: { editor: Editor }) => {
	const [open, setOpen] = React.useState(false)
	const [url, setUrl] = React.useState('')
	const inputRef = React.useRef<HTMLInputElement>(null)

	const currentHref: string = editor.getAttributes('link').href ?? ''
	const isActive = editor.isActive('link')

	const handleOpenChange = (next: boolean) => {
		if (next) setUrl(currentHref)
		setOpen(next)
	}

	const apply = () => {
		const chain = editor.chain().focus().extendMarkRange('link')
		if (url.trim() === '') chain.unsetLink().run()
		else chain.setLink({ href: url.trim() }).run()
		setOpen(false)
	}

	const remove = () => {
		editor.chain().focus().extendMarkRange('link').unsetLink().run()
		setOpen(false)
	}

	return (
		<PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
			<PopoverPrimitive.Trigger asChild>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					aria-label='Enlace'
					className={cn('h-9 w-9 cursor-pointer', isActive && 'bg-accent')}
				>
					<LinkIcon size={16} />
				</Button>
			</PopoverPrimitive.Trigger>
			<PopoverPrimitive.Content
				align='start'
				sideOffset={4}
				onOpenAutoFocus={(e) => {
					e.preventDefault()
					inputRef.current?.focus()
				}}
				className='bg-popover text-popover-foreground z-50 w-72 space-y-2 rounded-md border p-4 shadow-md outline-none'
			>
				<Input
					ref={inputRef}
					type='url'
					placeholder='https://…'
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							apply()
						}
					}}
				/>
				<div className='flex items-center justify-between gap-2'>
					<Button type='button' size='sm' className='cursor-pointer' onClick={apply}>
						Aplicar
					</Button>
					<div className='flex items-center gap-1'>
						{currentHref && (
							<Button
								asChild
								type='button'
								size='sm'
								variant='ghost'
								className='cursor-pointer'
							>
								<a href={currentHref} target='_blank' rel='noopener noreferrer'>
									<ExternalLink size={14} className='mr-1' />
									Abrir
								</a>
							</Button>
						)}
						<Button
							type='button'
							size='sm'
							variant='ghost'
							className='cursor-pointer'
							onClick={remove}
							disabled={!isActive}
						>
							Quitar
						</Button>
					</div>
				</div>
			</PopoverPrimitive.Content>
		</PopoverPrimitive.Root>
	)
}

export { LinkPopover }
