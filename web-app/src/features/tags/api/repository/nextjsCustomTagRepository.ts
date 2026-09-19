import { Tag } from '../../model/tags'
import { CustomTagRepository } from './customTagRepository'

export default class NextjsCustomTagRepository implements CustomTagRepository {
	async save(boardId: string, tags: Tag[]): Promise<void> {
		const { saveCustomTagGroup } = await import('../actions/saveCustomTagGroup')
		await saveCustomTagGroup({ boardId, tags })
	}

	async get(boardId: string): Promise<Tag[]> {
		const { getCustomTagGroup } = await import('../actions/getCustomTagGroup')
		const result = await getCustomTagGroup({ boardId })
		return result?.tags ?? []
	}
}
