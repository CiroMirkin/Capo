import { Notes } from '../../model/notes'

export interface NotesRepository {
	save(notes: Notes, boardId: string, allowEmpty?: boolean): Promise<void>
	getAll(boardId: string): Promise<Notes>
}
