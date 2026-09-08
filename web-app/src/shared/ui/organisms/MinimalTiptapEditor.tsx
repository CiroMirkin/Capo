import * as React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Paragraph from '@tiptap/extension-paragraph'
import Document from '@tiptap/extension-document'
import Highlight from '@tiptap/extension-highlight'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/shared/ui/atoms/button'
import { Separator } from '@/shared/ui/atoms/separator'
import { Toggle } from '@/shared/ui/atoms/toggle'
import {
	Bold as BoldIcon,
	Italic as ItalicIcon,
	Underline as UnderlineIcon,
	List,
	ListOrdered,
	Undo,
	Redo,
	Save,
	HighlighterIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

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
	onSave: () => void
}

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
		extensions: [
			Document,
			Paragraph,
			Text,
			Bold,
			Italic,
			UndoRedo,
			BulletList,
			OrderedList,
			ListItem,
			Underline,
			Placeholder.configure({
				placeholder,
			}),
			Highlight.configure({ multicolor: true }),
		],
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
		},
		onFocus: () => setIsFocused(true),
		onBlur: () => {
			setIsFocused(false)
			onBlur?.()
		},
		onPaste: () => {
			onSaveRef.current()
		},
	})

	// Parece una linea redundante, pero permite actualizar el valor de "editor" cuando "value" cambia externamente
	React.useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value, { emitUpdate: false })
		}
	}, [editor, value])

	const handleSave = React.useCallback(() => {
		if (!editor) return
		onSaveRef.current()
	}, [editor])

	if (!editor) return null

	// Approximate line height and padding (adjust as needed)
	const lineHeight = 20 // px
	const paddingVertical = 32 // 2 * 16px for p-4

	const editorStyle = {
		minHeight: `${rows * lineHeight + paddingVertical}px`,
		maxHeight: `${maxRows * lineHeight + paddingVertical}px`,
		wordBreak: 'break-word' as const,
		overflowWrap: 'break-word' as const,
	}

	return (
		<div
			className={cn(
				'w-full mx-auto border rounded-lg bg-background',
				'border-gray-300 dark:border-gray-700 transition-colors',
				isFocused && 'border-foreground/60 ring-3 ring-foreground/10',
				className
			)}
		>
			{editable && (
				<div className='flex flex-wrap items-center gap-1 p-1 border-b bg-muted/50'>
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

					<Button
						variant='ghost'
						size='icon'
						onClick={handleSave}
						aria-label='Guardar texto'
					>
						<Save size={16} />
					</Button>
				</div>
			)}
			<EditorContent
				editor={editor}
				className={cn(
					'p-4 prose prose-sm max-w-none custom-scrollbar text-base overflow-y-auto',
					'[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6',
					'[&_li]:marker:text-foreground',
					editorContentClassName
				)}
				style={editorStyle}
			/>
		</div>
	)
}

export { MinimalTiptapEditor }
