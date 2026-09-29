import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/lib/repository'
import { Limbo } from '../../model/limbo'

const local = () => new LocalStorageDataSource<Limbo>({ key: (boardId) => `limbo-${boardId}` })

const server = () =>
	new ServerActionDataSource<Limbo>({
		read: async (boardId) => (await import('../actions/getLimbo')).getLimbo({ boardId }),
		write: async (boardId, tasks) => {
			const { saveLimbo } = await import('../actions/saveLimbo')
			await saveLimbo({ boardId, tasks })
		},
	})

const getLimboRepository = (session: SessionType) =>
	new SnapshotRepository(bySession(session, { server, local }), (): Limbo => [])

export const fetchLimbo = async (session: SessionType, boardId: string): Promise<Limbo> =>
	getLimboRepository(session).getAll(boardId)

export const saveLimboTasks = async ({
	session,
	tasks,
	boardId,
}: {
	session: SessionType
	tasks: Limbo
	boardId: string
}): Promise<void> => {
	await getLimboRepository(session).save(tasks, boardId)
}
