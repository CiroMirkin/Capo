import type { SessionType } from '@/features/auth'
import { LimboRepository } from './limboRepository'
import NextjsLimboRepository from './nextjsLimboRepository'
import LocalStorageLimboRepository from './localStorageLimbo'
import { Limbo } from '../../model/limbo'

const getLimboRepository = (session: SessionType): LimboRepository =>
	session ? new NextjsLimboRepository() : new LocalStorageLimboRepository()

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
