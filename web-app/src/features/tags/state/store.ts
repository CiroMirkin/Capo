import { create } from 'zustand'
import { Tag } from '../model/tags'

type TagStore = {
	userSelectedTags: Tag[]
	setUserSelectedTags: (tags: Tag[]) => void
}

export const useTagStore = create<TagStore>((set) => ({
	userSelectedTags: [],
	setUserSelectedTags: (tags: Tag[]) => {
		set(() => ({
			userSelectedTags: tags,
		}))
	},
}))
