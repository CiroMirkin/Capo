import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/repository'
import { defaultNotes, Notes } from '../../model/notes'

type SaveNotesOptions = { allowEmpty?: boolean }

const local = () =>
	new LocalStorageDataSource<Notes>({
		key: 'capo-notes',
		serialize: (notes) => ({ notes }),
		parse: (raw) => {
			const notes = (raw as { notes?: unknown } | null)?.notes
			return typeof notes === 'string' ? notes : null
		},
	})

const server = () =>
	new ServerActionDataSource<Notes, SaveNotesOptions>({
		read: async (boardId) => (await import('../actions/getNotes')).getNotes({ boardId }),
		write: async (boardId, notes, options) => {
			const { saveNotes } = await import('../actions/saveNotes')
			await saveNotes({ boardId, notes, allowEmpty: options?.allowEmpty ?? false })
		},
	})

export const notesRepositoryFactory = (session: SessionType) =>
	new SnapshotRepository<Notes, SaveNotesOptions>(
		bySession(session, { server, local }),
		() => defaultNotes
	)

export const fetchNotes = async (session: SessionType, boardId: string): Promise<Notes> =>
	notesRepositoryFactory(session).getAll(boardId)

export const saveNotes = async ({
	notes,
	session,
	boardId,
	allowEmpty = false,
}: {
	notes: Notes
	session: SessionType
	boardId: string
	allowEmpty?: boolean
}): Promise<void> => {
	await notesRepositoryFactory(session).save(notes, boardId, { allowEmpty })
}
