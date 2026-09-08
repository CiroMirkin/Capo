import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { cn } from '@/shared/lib/utils'

// Lista única de extensiones compartida entre MinimalTiptapEditor y MinimalTiptapViewer
// para que el contenido escrito en el editor se renderice igual en el viewer.
// StarterKit (v3) ya incluye Heading, Blockquote, CodeBlock, HorizontalRule, Link,
// Underline, Strike, listas y UndoRedo.
export function getTiptapExtensions({
	placeholder = '',
	linkOpenOnClick = false,
}: { placeholder?: string; linkOpenOnClick?: boolean } = {}) {
	return [
		StarterKit.configure({
			heading: { levels: [1, 2, 3] },
			link: {
				openOnClick: linkOpenOnClick,
				HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
			},
		}),
		Highlight.configure({ multicolor: true }),
		Placeholder.configure({ placeholder }),
		TextAlign.configure({ types: ['heading', 'paragraph'] }),
		TaskList,
		TaskItem.configure({ nested: true }),
	]
}

// Clases del <EditorContent>, compartidas por editor y viewer.
export const EDITOR_CONTENT_CLASS = cn(
	'p-4 prose prose-sm max-w-none custom-scrollbar text-base overflow-y-auto',
	'[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6',
	'[&_li]:marker:text-current',
	'[&_a]:underline [&_a]:cursor-pointer',
	'[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic',
	'[&_pre]:bg-muted [&_pre]:rounded [&_pre]:p-3 [&_pre]:text-sm [&_pre]:overflow-x-auto [&_pre]:font-mono',
	'[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 [&_ul[data-type=taskList]]:ml-0',
	'[&_li[data-type=taskItem]]:flex [&_li[data-type=taskItem]]:gap-2 [&_li[data-type=taskItem]]:items-start',
	'[&_li[data-type=taskItem]>label]:mt-1 [&_li[data-type=taskItem]>label]:shrink-0',
	'[&_li[data-type=taskItem]>div]:flex-1'
)
