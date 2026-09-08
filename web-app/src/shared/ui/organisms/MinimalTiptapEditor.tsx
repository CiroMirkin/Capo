import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { Button } from '@/shared/ui/atoms/button'
import { Separator } from '@/shared/ui/atoms/separator'
import { Toggle } from '@/shared/ui/atoms/toggle'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui/atoms/select'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/shared/ui/molecules/dropdown-menu'
import {
	Bold as BoldIcon,
	Italic as ItalicIcon,
	Underline as UnderlineIcon,
	List,
	ListOrdered,
	ListChecks,
	Quote,
	Code,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	Undo,
	Redo,
	MoreHorizontal,
	Archive,
	HighlighterIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { getTiptapExtensions, EDITOR_CONTENT_CLASS } from './tiptapExtensions'
import { LinkPopover } from './LinkPopover'

interface MinimalTiptapProps {
	value: string
	onChange: (value: string) => void
	onBlur?: () => void
	className?: string
	editable?: boolean
	placeholder?: string
	editorContentClassName?: string
	rows?: number
	maxRows?: number
	/** El editor ocupa todo el alto de su contenedor en vez de usar rows/maxRows. */
	fill?: boolean
	/** Si se pasa, aparece "Archivar nota" en el menú "Más opciones". */
	onArchive?: () => void
	/** Guardado manual (Ctrl/Cmd+S). El guardado normal es automático en los padres. */
	onSave: () => void
}

const alignments = [
	['left', AlignLeft, 'Izquierda'],
	['center', AlignCenter, 'Centro'],
	['right', AlignRight, 'Derecha'],
	['justify', AlignJustify, 'Justificado'],
] as const

const MinimalTiptapEditor = ({
	value = '',
	onChange = () => {},
	onBlur,
	className,
	editable = true,
	placeholder = 'Type something...',
	editorContentClassName,
	rows = 3,
	maxRows = 10,
	fill = false,
	onArchive,
	onSave = () => {},
}: MinimalTiptapProps) => {
	const [isFocused, setIsFocused] = React.useState(false)

	// Los callbacks llegan inline desde los padres (identidad nueva cada render).
	// Guardamos la última versión en refs para que las closures de `useEditor`
	// —que se congelan en el primer render— siempre llamen a la actual.
	const onChangeRef = React.useRef(onChange)
	const onSaveRef = React.useRef(onSave)
	React.useEffect(() => {
		onChangeRef.current = onChange
		onSaveRef.current = onSave
	})

	const editor = useEditor({
		immediatelyRender: false,
		extensions: getTiptapExtensions({ placeholder }),
		content: value,
		editable,
		onUpdate: ({ editor }) => {
			onChangeRef.current(editor.getHTML())
		},
		editorProps: {
			attributes: {
				role: 'textbox',
				class: 'focus:outline-none',
				spellcheck: 'false',
				autocorrect: 'off',
				autocapitalize: 'off',
			},
			handleKeyDown: (_view, event) => {
				if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
					event.preventDefault()
					onSaveRef.current()
					return true
				}
				return false
			},
		},
		onFocus: () => setIsFocused(true),
		onBlur: () => {
			setIsFocused(false)
			onBlur?.()
		},
	})

	// Parece una linea redundante, pero permite actualizar el valor de "editor" cuando "value" cambia externamente
	React.useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false })
		}
	}, [editor, value])

	if (!editor) return null

	// Approximate line height and padding (adjust as needed)
	const lineHeight = 20 // px
	const paddingVertical = 32 // 2 * 16px for p-4

	const editorStyle = {
		...(fill
			? {}
			: {
					minHeight: `${rows * lineHeight + paddingVertical}px`,
					maxHeight: `${maxRows * lineHeight + paddingVertical}px`,
				}),
		wordBreak: 'break-word' as const,
		overflowWrap: 'break-word' as const,
	}

	const headingValue = editor.isActive('heading', { level: 1 })
		? '1'
		: editor.isActive('heading', { level: 2 })
			? '2'
			: editor.isActive('heading', { level: 3 })
				? '3'
				: 'p'

	const onHeadingChange = (v: string) => {
		if (v === 'p') editor.chain().focus().setParagraph().run()
		else
			editor
				.chain()
				.focus()
				.toggleHeading({ level: Number(v) as 1 | 2 | 3 })
				.run()
	}

	const menuItemClass = (active: boolean) => cn('gap-2 px-2 py-1.5', active && 'bg-accent')

	return (
		<div
			className={cn(
				'w-full mx-auto border rounded-lg bg-background',
				'border-black dark:border-gray-700 transition-colors',
				isFocused && 'border-foreground/60 ring-3 ring-foreground/10',
				fill && 'flex flex-col',
				className
			)}
		>
			{editable && (
				<div
					className={cn(
						'flex flex-wrap items-center gap-1 p-1 border-b border-black bg-muted/50',
						// deja lugar arriba a la derecha para el botón de cerrar del panel
						fill && 'pr-12'
					)}
				>
					<Select value={headingValue} onValueChange={onHeadingChange}>
						<SelectTrigger className='h-9 w-[120px]' aria-label='Estilo de texto'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='p'>Normal</SelectItem>
							<SelectItem value='1'>Título 1</SelectItem>
							<SelectItem value='2'>Título 2</SelectItem>
							<SelectItem value='3'>Título 3</SelectItem>
						</SelectContent>
					</Select>

					<Separator orientation='vertical' className='mx-2 h-6' />

					<Toggle
						pressed={editor.isActive('bold')}
						onPressedChange={() => editor.chain().focus().toggleBold().run()}
						aria-label='Negrita'
					>
						<BoldIcon size={16} />
					</Toggle>
					<Toggle
						pressed={editor.isActive('italic')}
						onPressedChange={() => editor.chain().focus().toggleItalic().run()}
						aria-label='Itálica'
					>
						<ItalicIcon size={16} />
					</Toggle>
					<Toggle
						pressed={editor.isActive('underline')}
						onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
						aria-label='Subrayado'
					>
						<UnderlineIcon size={16} />
					</Toggle>

					<Toggle
						pressed={editor.isActive('highlight', { color: '#ffc078' })}
						onPressedChange={() =>
							editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()
						}
						aria-label='Resaltado'
					>
						<HighlighterIcon size={16} />
					</Toggle>

					<LinkPopover editor={editor} />

					<Separator orientation='vertical' className='mx-2 h-6' />

					<Toggle
						pressed={editor.isActive('bulletList')}
						onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
						aria-label='Lista desordenada'
					>
						<List size={16} />
					</Toggle>
					<Toggle
						pressed={editor.isActive('orderedList')}
						onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
						aria-label='Lista ordenada'
					>
						<ListOrdered size={16} />
					</Toggle>
					<Toggle
						pressed={editor.isActive('taskList')}
						onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
						aria-label='Lista de tareas'
					>
						<ListChecks size={16} />
					</Toggle>

					<Separator orientation='vertical' className='mx-2 h-6' />

					<Button
						variant='ghost'
						size='icon'
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().undo()}
						aria-label='Deshacer'
					>
						<Undo size={16} />
					</Button>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().redo()}
						aria-label='Rehacer'
					>
						<Redo size={16} />
					</Button>

					<Separator orientation='vertical' className='mx-2 h-6' />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' aria-label='Más opciones'>
								<MoreHorizontal size={16} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuLabel>Alineación</DropdownMenuLabel>
							{alignments.map(([alignValue, Icon, label]) => (
								<DropdownMenuItem
									key={alignValue}
									aria-label={label}
									className={menuItemClass(
										editor.isActive({ textAlign: alignValue })
									)}
									onSelect={(e) => {
										e.preventDefault()
										editor.chain().focus().setTextAlign(alignValue).run()
									}}
								>
									<Icon size={16} />
									{label}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								aria-label='Cita'
								className={menuItemClass(editor.isActive('blockquote'))}
								onSelect={(e) => {
									e.preventDefault()
									editor.chain().focus().toggleBlockquote().run()
								}}
							>
								<Quote size={16} />
								Cita
							</DropdownMenuItem>
							<DropdownMenuItem
								aria-label='Bloque de código'
								className={menuItemClass(editor.isActive('codeBlock'))}
								onSelect={(e) => {
									e.preventDefault()
									editor.chain().focus().toggleCodeBlock().run()
								}}
							>
								<Code size={16} />
								Bloque de código
							</DropdownMenuItem>
							{onArchive && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										aria-label='Archivar nota'
										className='gap-2 px-2 py-1.5'
										onSelect={() => onArchive()}
									>
										<Archive size={16} />
										Archivar nota
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
			<EditorContent
				editor={editor}
				className={cn(
					EDITOR_CONTENT_CLASS,
					fill && 'flex-1 min-h-0',
					editorContentClassName
				)}
				style={editorStyle}
			/>
		</div>
	)
}

export { MinimalTiptapEditor }
