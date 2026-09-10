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

	// Ancla virtual: posiciona el popover sobre el texto seleccionado (o el
	// enlace) en el editor en vez de sobre el botón de la barra.
	const anchorRef = React.useRef<{ getBoundingClientRect: () => DOMRect }>({
		getBoundingClientRect: () => {
			const { view, state } = editor
			const { from, to } = state.selection
			const start = view.coordsAtPos(from)
			const end = view.coordsAtPos(to, -1)
			const left = Math.min(start.left, end.left)
			const top = Math.min(start.top, end.top)
			const right = Math.max(start.right, end.right)
			const bottom = Math.max(start.bottom, end.bottom)
			return new DOMRect(left, top, right - left, bottom - top)
		},
	})

	// Abre el popover anclado a la selección actual. Si el cursor está sobre un
	// enlace, extiende la selección a todo el enlace para editarlo.
	const openOnSelection = React.useCallback(() => {
		if (editor.isActive('link')) editor.chain().extendMarkRange('link').run()
		setUrl(editor.getAttributes('link').href ?? '')
		setOpen(true)
	}, [editor])

	const handleOpenChange = (next: boolean) => {
		if (next) openOnSelection()
		else setOpen(false)
	}

	// Al clickear un enlace del editor (openOnClick está apagado) abrimos el
	// popover para editarlo, sin pasar por el botón de la barra.
	React.useEffect(() => {
		const dom = editor.view.dom
		const onClick = (e: MouseEvent) => {
			if ((e.target as HTMLElement).closest('a')) requestAnimationFrame(openOnSelection)
		}
		dom.addEventListener('click', onClick)
		return () => dom.removeEventListener('click', onClick)
	}, [editor, openOnSelection])

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
			<PopoverPrimitive.Anchor virtualRef={anchorRef} />
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
