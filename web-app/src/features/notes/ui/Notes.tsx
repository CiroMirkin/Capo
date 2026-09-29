import { useRef } from 'react'
import { Button } from '@/shared/ui/atoms/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/molecules/sheet'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { NoteInput, type NoteInputHandle } from './NoteInput'

interface NotesProps {
	/** Color del botón; por defecto el `text` del tema. */
	textColor?: string
}

export default function Notes({ textColor: textColorProp }: NotesProps) {
	const { t } = useTranslation()
	const { column, text } = useTheme()
	const textColor = textColorProp ?? text
	const noteInputRef = useRef<NoteInputHandle>(null)

	return (
		<Sheet onOpenChange={(open) => !open && noteInputRef.current?.flush()}>
			<SheetTrigger asChild>
				<Button
					variant='link'
					className={`text-base ${textColor}`}
					data-tour='board-notes-button'
				>
					{t('notes.action_title')}
				</Button>
			</SheetTrigger>
			<SheetContent className={`${column} p-0`} aria-describedby={undefined}>
				<SheetTitle className='sr-only'>{t('notes.section_title')}</SheetTitle>
				<NoteInput ref={noteInputRef} />
			</SheetContent>
		</Sheet>
	)
}
