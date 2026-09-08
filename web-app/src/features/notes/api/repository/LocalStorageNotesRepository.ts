import { defaultNotes, Notes } from '../../model/notes'
import { NotesRepository } from './notesRepository'

export default class LocalStorageNotesRepository implements NotesRepository {
	key
	constructor() {
		this.key = 'capo-notes'
	}
	async save(notes: Notes): Promise<void> {
		const notesForSave = { notes }
		localStorage.setItem(this.key, JSON.stringify(notesForSave))
	}
	async getAll(): Promise<Notes> {
		const raw = localStorage.getItem(this.key)
		if (!raw) return defaultNotes
		try {
			const parsed = JSON.parse(raw)
			return typeof parsed?.notes === 'string' ? parsed.notes : defaultNotes
		} catch {
			return defaultNotes
		}
	}
}
