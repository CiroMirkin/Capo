import { Tag } from '../../model/tags'

export interface CustomTagRepository {
	save(boardId: string, tags: Tag[]): Promise<void>
	get(boardId: string): Promise<Tag[]>
}
