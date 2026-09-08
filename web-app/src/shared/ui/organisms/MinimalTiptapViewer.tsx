'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import { cn } from '@/shared/lib/utils'
import { getTiptapExtensions, EDITOR_CONTENT_CLASS } from './tiptapExtensions'

interface MinimalTiptapViewerProps {
	value?: string
	className?: string
	editorContentClassName?: string
	maxRows?: number
	/** Sin borde/fondo propio: el contenido fluye dentro del contenedor padre. */
	unstyled?: boolean
}

const MinimalTiptapViewer = ({
	value,
	className,
	editorContentClassName,
	maxRows = 50,
	unstyled = false,
}: MinimalTiptapViewerProps) => {
	const editor = useEditor({
		immediatelyRender: false,
		extensions: getTiptapExtensions({ linkOpenOnClick: true }),
		content: value,
		editable: false,
		editorProps: {
			attributes: {
				class: 'focus:outline-none',
			},
		},
	})

	if (!editor) return null

	const lineHeight = 20 // px
	const paddingVertical = 22 // px

	const editorStyle = {
		minHeight: `40px`,
		maxHeight: `${maxRows * lineHeight + paddingVertical}px`,
		wordBreak: 'break-word' as const,
		overflowWrap: 'break-word' as const,
	}

	return (
		<div
			className={cn(
				'w-full! mx-auto',
				!unstyled && [
					'border rounded-lg bg-background',
					'border-gray-300 dark:border-gray-700 transition-colors',
				],
				className
			)}
		>
			<EditorContent
				editor={editor}
				className={cn(EDITOR_CONTENT_CLASS, editorContentClassName)}
				style={editorStyle}
			/>
		</div>
	)
}

export { MinimalTiptapViewer }
