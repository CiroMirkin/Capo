import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/repository'
import { Archive } from '../../model/archive'

const local = () => new LocalStorageDataSource<Archive>({ key: 'tasks-archive' })

const server = () =>
	new ServerActionDataSource<Archive>({
		read: async (boardId) => (await import('../actions/getArchive')).getArchive({ boardId }),
		write: async (boardId, archive) => {
			const { saveArchive } = await import('../actions/saveArchive')
			await saveArchive({ boardId, taskList: archive })
		},
	})

const getArchivedTasksRepository = (session: SessionType) =>
	new SnapshotRepository(bySession(session, { server, local }), (): Archive => [])

export const fetchArchivedTasks = async (session: SessionType, boardId: string): Promise<Archive> =>
	getArchivedTasksRepository(session).getAll(boardId)

export const saveArchivedTasks = async ({
	session,
	archivedTasks,
	boardId,
}: {
	session: SessionType
	archivedTasks: Archive
	boardId: string
}): Promise<void> => {
	await getArchivedTasksRepository(session).save(archivedTasks, boardId)
}
