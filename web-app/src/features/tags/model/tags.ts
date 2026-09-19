import { devTagGroup, eisenhowerTagGroup, kanoTagGroup, studyTagGroup } from './defaultTags'

type TagVariants =
	| 'gray'
	| 'gray-subtle'
	| 'blue'
	| 'blue-subtle'
	| 'purple'
	| 'purple-subtle'
	| 'amber'
	| 'amber-subtle'
	| 'red'
	| 'red-subtle'
	| 'pink'
	| 'pink-subtle'
	| 'green'
	| 'green-subtle'
	| 'teal'
	| 'teal-subtle'
	| 'inverted'
	| 'trial'
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
	/** Grupo propio del board (no sembrado). Se usa para excluirlo de `EnableTags`. */
	custom?: boolean
}

export const emptyTagGroup = {
	id: 'none',
	tags: [],
}

/** Id fijo del grupo de tags propios del usuario en modo invitado (localStorage). */
export const GUEST_CUSTOM_TAG_GROUP_ID = 'custom'

export const MAX_CUSTOM_TAGS = 6

export const MAX_TAG_NAME_LENGTH = 20
export const MIN_TAG_PRIORITY = 1
export const MAX_TAG_PRIORITY = 6

export type AvailableTags = TagGroup[]

export const defaultAvialableTags: AvailableTags = [
	{ ...eisenhowerTagGroup },
	{ ...devTagGroup },
	{ ...studyTagGroup },
	{ ...kanoTagGroup },
]

/**
 * Agrega al final los grupos sembrados (`defaultAvialableTags`) que falten en
 * `groups` por `id`. Sin esto, un grupo nuevo agregado en el código (p. ej.
 * Study/Kano) nunca aparece para quienes ya tienen datos guardados (DB o
 * localStorage), porque esos repositorios devuelven lo guardado tal cual.
 */
export const mergeSeededTagGroups = (groups: AvailableTags): AvailableTags => {
	const existingIds = new Set(groups.map((g) => g.id))
	const missingDefaults = defaultAvialableTags.filter((g) => !existingIds.has(g.id))
	return [...groups, ...missingDefaults]
}

export const getTagGroup = ({ tags }: { tags: Tag[] }): TagGroup => {
	return {
		id: crypto.randomUUID(),
		tags: [...tags],
	}
}
