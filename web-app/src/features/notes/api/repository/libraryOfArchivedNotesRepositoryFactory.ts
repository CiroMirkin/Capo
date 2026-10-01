import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/repository'
import {
	defaultLibraryOfArchivedNotes,
	LibraryOfArchivedNotes,
} from '../../model/libraryOfArchivedNotes'

const local = () =>
	new LocalStorageDataSource<LibraryOfArchivedNotes>({ key: 'capo-archived-notes' })

const server = () =>
	new ServerActionDataSource<LibraryOfArchivedNotes>({
		read: async (boardId) =>
			(await import('../actions/getArchivedNotes')).getArchivedNotes({ boardId }),
		write: async (boardId, library) => {
			const { saveArchivedNotes } = await import('../actions/saveArchivedNotes')
			await saveArchivedNotes({ boardId, notes: library })
		},
	})

export const libraryOfArchivedNotesRepositoryFactory = (session: SessionType) =>
	new SnapshotRepository(
		bySession(session, { server, local }),
		() => defaultLibraryOfArchivedNotes
	)

export const fetchLibraryOfArchivedNotes = async (
	session: SessionType,
	boardId: string
): Promise<LibraryOfArchivedNotes> =>
	libraryOfArchivedNotesRepositoryFactory(session).getAll(boardId)

export const saveLibraryOfArchivedNotes = async ({
	notes,
	session,
	boardId,
}: {
	notes: LibraryOfArchivedNotes
	session: SessionType
	boardId: string
}): Promise<void> => {
	await libraryOfArchivedNotesRepositoryFactory(session).save(notes, boardId)
}
