import { Limbo } from '../../model/limbo'
import { LimboRepository } from './limboRepository'

export default class NextjsLimboRepository implements LimboRepository {
	async save(tasks: Limbo, boardId: string): Promise<void> {
		const { saveLimbo } = await import('../actions/saveLimbo')
		await saveLimbo({ boardId, tasks })
	}

	async getAll(boardId: string): Promise<Limbo> {
		const { getLimbo } = await import('../actions/getLimbo')
		const limbo = await getLimbo({ boardId })
		return limbo ?? []
	}
}
