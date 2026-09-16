import { devTagGroup, eisenhowerTagGroup } from './defaultTags'
import { tagVariantsList } from './tagVariants'

type TagVariants = (typeof tagVariantsList)[number]['id']

export interface Tag {
	id: string
	name: string
	variant?: TagVariants
	priority?: number
}

export interface TagGroup {
	id: string
	tags: Tag[]
}

export const emptyTagGroup = {
	id: 'none',
	tags: [],
}

export type AvailableTags = TagGroup[]

export const defaultAvialableTags: AvailableTags = [{ ...eisenhowerTagGroup }, { ...devTagGroup }]

export const getTagGroup = ({ tags }: { tags: Tag[] }): TagGroup => {
	return {
		id: crypto.randomUUID(),
		tags: [...tags],
	}
}
