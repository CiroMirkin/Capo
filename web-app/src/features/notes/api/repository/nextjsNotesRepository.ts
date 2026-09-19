import { defaultNotes, Notes } from '../../model/notes'
import { NotesRepository } from './notesRepository'

export default class NextjsNotesRepository implements NotesRepository {
	async save(notes: Notes, boardId: string, allowEmpty = false): Promise<void> {
		const { saveNotes } = await import('../actions/saveNotes')
		await saveNotes({ boardId, notes, allowEmpty })
	}

	async getAll(boardId: string): Promise<Notes> {
		const { getNotes } = await import('../actions/getNotes')
		const notes = await getNotes({ boardId })
		return notes ?? defaultNotes
	}
}
