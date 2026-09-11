import { Limbo } from '../../model/limbo'
import { LimboRepository } from './limboRepository'

const keyFor = (boardId: string) => `limbo-${boardId}`

export default class LocalStorageLimboRepository implements LimboRepository {
	async save(tasks: Limbo, boardId: string): Promise<void> {
		localStorage.setItem(keyFor(boardId), JSON.stringify(tasks))
	}

	async getAll(boardId: string): Promise<Limbo> {
		const raw = localStorage.getItem(keyFor(boardId))
		return raw ? JSON.parse(raw) : []
	}
}
