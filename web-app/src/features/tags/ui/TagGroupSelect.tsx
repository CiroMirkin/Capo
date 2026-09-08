'use client'

import { CheckboxBadge } from '@/shared/ui/molecules/CheckboxBadge'
import { useEffect, useState } from 'react'
import { useActualTagGroup } from '../hooks/useActualTagGroup'
import { useTagStore } from '../state/store'
import { Tag } from '../model/tags'
import { useUserSelectedTags } from '../hooks/useUserSelectedTags'
import { translateTagGroup } from '../model/translateTagGroup'
import { useTranslation } from 'react-i18next'

export default function TagGroupSelect() {
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const { actualTagGroup } = useActualTagGroup()
	const { t } = useTranslation()
	const translatedTagGroup = translateTagGroup(actualTagGroup, t)

	const getFullSelectedTags = (listOfTagIds: string[]): Tag[] => {
		const idSet = new Set(listOfTagIds)
		return translatedTagGroup.tags.filter((tag) => idSet.has(tag.id))
	}

	const setUserSelectedTags = useTagStore((state) => state.setUserSelectedTags)
	const handleCheckboxChange = (checked: boolean, id: string) => {
		const newSelectedTags = checked
			? [...selectedTags, id]
			: selectedTags.filter((item) => item !== id)

		const tags = getFullSelectedTags(newSelectedTags)

		setSelectedTags(newSelectedTags)
		setUserSelectedTags(tags)
	}

	const userSelectedTags = useUserSelectedTags()
	useEffect(() => {
		if (userSelectedTags.length == 0) {
			setSelectedTags([])
		}
	}, [userSelectedTags])

	return (
		<div className='flex flex-wrap gap-3'>
			{translatedTagGroup.tags.map((tag) => (
				<CheckboxBadge
					id={tag.id}
					key={tag.id}
					variant={tag.variant ? tag.variant : 'inverted'}
					checked={
						selectedTags.filter((selectedTag) => selectedTag == tag.id)[0]
							? true
							: false
					}
					onChange={handleCheckboxChange}
				>
					{tag.name}
				</CheckboxBadge>
			))}
		</div>
	)
}
