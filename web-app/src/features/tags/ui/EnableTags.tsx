import { useAvailableTags } from '../hooks/useAvailableTags'
import { Badge } from './Badge'
import { TagGroup } from '../model/tags'
import { toast } from 'sonner'
import { useTheme } from '@/shared/hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { useTagsQuery } from '../hooks/useTagsQuery'
import { useActualTagGroup } from '../hooks/useActualTagGroup'

export function EnableTags() {
	const { t } = useTranslation()
	const availableTags = useAvailableTags()
	const { updateTags } = useTagsQuery()
	const { tags, actualTagGroup } = useActualTagGroup()
	const { task } = useTheme()

	const handleClick = (tagGroup: TagGroup) => {
		if (actualTagGroup.id === tagGroup.id) {
			updateTags({
				tags,
				actualTagGroup: tagGroup,
			})
			toast.info(t('settings.tags.disble_tags_toast'))
			return
		}
		updateTags({
			tags: tags,
			actualTagGroup: tagGroup,
		})
		toast.success(t('settings.tags.enable_tags_toast'))
	}

	return (
		<SettingSection>
			<SettingSection.Title>
				{t('settings.tags.enable_tags_section_title')}
			</SettingSection.Title>
			<SettingSection.Description>
				{t('settings.tags.enable_tags_section_description')}
			</SettingSection.Description>
			<SettingSection.Content className='py-0 px-0 bg-transparent space-y-3'>
				{availableTags.map((availableTagGroup) => (
					<label
						key={availableTagGroup.id}
						className={`relative block overflow-hidden rounded-xl border cursor-pointer hover:shadow-lg p-4 ${task} ${
							actualTagGroup.id === availableTagGroup.id
								? 'border-black shadow-md'
								: 'border-transparent hover:border-gray-400'
						}`}
					>
						<div className='flex items-center gap-3'>
							<input
								type='checkbox'
								checked={actualTagGroup.id === availableTagGroup.id}
								onChange={() => handleClick(availableTagGroup)}
								className='w-4 h-4 accent-black bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
							/>
							<div className='flex flex-wrap gap-2'>
								{[...availableTagGroup.tags]
									.sort(
										(a, b) =>
											(a.priority ?? Infinity) - (b.priority ?? Infinity)
									)
									.map((tag) => (
										<Badge
											key={tag.id}
											variant={tag.variant || 'inverted'}
											size='sm'
										>
											{tag.name}
											{tag.priority && (
												<span className='opacity-50 !text-xs'>
													{' '}
													(P{tag.priority})
												</span>
											)}
										</Badge>
									))}
							</div>
						</div>
					</label>
				))}
			</SettingSection.Content>
		</SettingSection>
	)
}
