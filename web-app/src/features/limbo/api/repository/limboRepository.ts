import { Limbo } from '../../model/limbo'

export interface LimboRepository {
	save(tasks: Limbo, boardId: string): Promise<void>
	getAll(boardId: string): Promise<Limbo>
}
