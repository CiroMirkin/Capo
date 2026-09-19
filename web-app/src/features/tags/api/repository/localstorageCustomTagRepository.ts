import {
	defaultAvialableTags,
	emptyTagGroup,
	GUEST_CUSTOM_TAG_GROUP_ID,
	Tag,
} from '../../model/tags'
import { CustomTagRepository } from './customTagRepository'
import { TagRepositoryGetReturn } from './tagRepository'

const TAGS_KEY = 'tags-capo'

export default class LocalStorageCustomTagRepository implements CustomTagRepository {
	key

	constructor() {
		this.key = 'custom-tags-capo'
	}

	async save(_boardId: string, tags: Tag[]): Promise<void> {
		localStorage.setItem(this.key, JSON.stringify(tags))

		// Igual que en Nextjs: crear/editar un tag propio activa ese grupo solo.
		const customGroup = { id: GUEST_CUSTOM_TAG_GROUP_ID, tags, custom: true }
		const rawTags = localStorage.getItem(TAGS_KEY)
		const current: TagRepositoryGetReturn = rawTags
			? JSON.parse(rawTags)
			: { tags: defaultAvialableTags, actualTagGroup: emptyTagGroup }
		const otherGroups = current.tags.filter((group) => group.id !== GUEST_CUSTOM_TAG_GROUP_ID)

		localStorage.setItem(
			TAGS_KEY,
			JSON.stringify({
				tags: [customGroup, ...otherGroups],
				actualTagGroup: customGroup,
			})
		)
	}

	async get(): Promise<Tag[]> {
		const raw = localStorage.getItem(this.key)
		return raw ? JSON.parse(raw) : []
	}
}
