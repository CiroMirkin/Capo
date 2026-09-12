'use client'

import { MinimalTiptapEditor } from '@/shared/ui/organisms/MinimalTiptapEditor'
import { maxLengthOfNotes } from '../model/notes'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useNotesQuery } from '../hooks/useNotesQuery'
import { useArchiveNote } from '../hooks/useArchiveNote'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import { useTheme } from '@/shared/hooks/useTheme'
import { SaveStatus, type SaveState } from '@/shared/ui/atoms/SaveStatus'
import { cn } from '@/shared/lib/utils'

export interface NoteInputHandle {
	/** Guarda ya, sin esperar el debounce (usado al cerrar el sheet). */
	flush: () => void
}

export const NoteInput = forwardRef<NoteInputHandle>(function NoteInput(_props, ref) {
	const { t } = useTranslation()
	const { text: textColor, column, columnText } = useTheme()

	const { notes, updateNotes, isLoading, isSaving } = useNotesQuery()
	const [notesValue, setNotesValue] = useState(notes ?? '')
	const archiveNote = useArchiveNote(setNotesValue)

	const saveNotes = useCallback(() => {
		if (notesValue === notes) return // nada que guardar

		if (notesValue.trim().length <= maxLengthOfNotes) {
			updateNotes(notesValue)
			return
		}

		toast.error(t('notes.warning_length_toast'))
	}, [notesValue, notes, t, updateNotes])

	useImperativeHandle(ref, () => ({ flush: saveNotes }), [saveNotes])

	useEffect(() => {
		if (notes !== null && notesValue !== notes) {
			const timeoutId = setTimeout(saveNotes, 800)
			return () => clearTimeout(timeoutId)
		}
	}, [notesValue, notes, saveNotes])

	useEffect(() => {
		if (notes !== null) {
			setNotesValue(notes)
		}
	}, [notes])

	if (isLoading || notes === null) {
		return (
			<div className='w-full flex items-center justify-center py-8'>
				<Spinner size={30} />
			</div>
		)
	}

	const saveState: SaveState = isSaving ? 'saving' : notesValue !== notes ? 'unsaved' : 'saved'

	return (
		<div className='flex h-full flex-col'>
			<MinimalTiptapEditor
				fill
				className={cn(column, columnText, 'flex-1 min-h-0 rounded-none border-0')}
				value={notesValue}
				onChange={setNotesValue}
				placeholder={t('notes.input_placeholder')}
				onArchive={archiveNote}
				onSave={() => {
					saveNotes()
					toast.success(t('notes.successful_toast'))
				}}
			/>
			<div className={cn(textColor, 'flex justify-end px-3 py-1.5')}>
				<SaveStatus state={saveState} />
			</div>
		</div>
	)
})
