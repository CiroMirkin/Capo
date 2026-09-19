import { defaultAvialableTags, emptyTagGroup, mergeSeededTagGroups } from '../../model/tags'
import { TagRepository, TagRepositoryGetReturn, TagRepositorySaveParams } from './tagRepository'

export default class LocalStorageTagRepository implements TagRepository {
	key
	constructor() {
		this.key = 'tags-capo'
	}
	async save(allTagsInfo: TagRepositorySaveParams): Promise<void> {
		localStorage.setItem(this.key, JSON.stringify(allTagsInfo))
	}

	async get(): Promise<TagRepositoryGetReturn> {
		const raw = localStorage.getItem(this.key)
		if (!raw) {
			return { tags: defaultAvialableTags, actualTagGroup: emptyTagGroup }
		}
		const stored: TagRepositoryGetReturn = JSON.parse(raw)
		return { ...stored, tags: mergeSeededTagGroups(stored.tags) }
	}
}
