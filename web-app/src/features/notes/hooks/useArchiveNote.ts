import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

import { defaultNotes } from '../model/notes'
import { maxArchivedNotes } from '../model/libraryOfArchivedNotes'
import { ArchivedNote } from '../model/archivedNote'
import { useNotesQuery } from './useNotesQuery'
import { useLibraryOfArchivedNotesQuery } from './useLibraryOfArchivedNotesQuery'

/**
 * Archiva la nota activa del tablero: la mueve al archivo (FIFO, tope
 * `maxArchivedNotes`) y deja la nota en blanco. Con el archivo lleno pide
 * confirmación (toast) antes de descartar la más antigua; si no se confirma,
 * no archiva. `onArchived` sincroniza el estado local del editor.
 */
export function useArchiveNote(onArchived: (text: string) => void) {
	const { notes, updateNotes } = useNotesQuery()
	const { archivedNotes, updateArchivedNotes } = useLibraryOfArchivedNotesQuery()
	const { t } = useTranslation()

	return () => {
		if (!notes || notes === '' || notes === '<br>' || !archivedNotes) return

		const archive = () => {
			const newArchivedNote: ArchivedNote = {
				id: crypto.randomUUID(),
				note: notes,
				date: new Date(),
			}
			const newLibrary = {
				...archivedNotes,
				archive: [newArchivedNote, ...archivedNotes.archive].slice(0, maxArchivedNotes),
			}
			updateNotes(defaultNotes, {
				onSuccess: () => {
					updateArchivedNotes(newLibrary)
					onArchived(defaultNotes)
					toast.success(t('archived_note.archive_successful_toast'))
				},
			})
		}

		if (archivedNotes.archive.length >= maxArchivedNotes) {
			toast.warning(t('archived_note.archive_full_warning', { max: maxArchivedNotes }), {
				action: {
					label: t('archived_note.archive_full_btn'),
					onClick: archive,
				},
			})
			return
		}

		archive()
	}
}
