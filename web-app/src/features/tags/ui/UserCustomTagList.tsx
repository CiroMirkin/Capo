'use client'

import { Badge } from '@/shared/ui/atoms/badge'
import { Button } from '@/shared/ui/atoms/button'
import { TrashIcon } from '@/shared/ui/atoms/icons'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { useTheme } from '@/shared/hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCustomTagsQuery } from '../hooks/useCustomTagsQuery'

export function UserCustomTagList() {
	const { t } = useTranslation()
	return (
		<div>
			<SettingSection.Title>
				{t('settings.custom_tags.list_section_title')}
			</SettingSection.Title>
			<SettingSection.Content className='py-0 px-0 bg-transparent flex flex-wrap gap-2'>
				<UserCustomTagListContainer />
			</SettingSection.Content>
		</div>
	)
}

const UserCustomTagListContainer = () => {
	const { t } = useTranslation()
	const { task } = useTheme()
	const { customTags, updateCustomTags } = useCustomTagsQuery()

	const askForConfirmationToDeleteTag = (tagId: string) => {
		toast.warning(t('settings.custom_tags.delete_warning_toast'), {
			action: {
				label: t('settings.custom_tags.delete_btn'),
				onClick: () => updateCustomTags(customTags.filter((tag) => tag.id !== tagId)),
			},
		})
	}

	if (customTags.length === 0) {
		return (
			<EmptySpaceText className={`py-2 px-3 rounded-md ${task}`} textSize='lg'>
				{t('settings.custom_tags.blank_list')}
			</EmptySpaceText>
		)
	}

	return [...customTags]
		.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity))
		.map((tag) => (
			<div key={tag.id} className='flex items-center gap-1'>
				<Badge variant={tag.variant || 'inverted'} size='sm'>
					{tag.name}
					{tag.priority && (
						<span className='opacity-50 !text-xs'> (P{tag.priority})</span>
					)}
				</Badge>
				<Button
					size='sm'
					variant='destructiveGhost'
					title={t('settings.custom_tags.delete_btn')}
					onClick={() => askForConfirmationToDeleteTag(tag.id)}
					className='h-7 px-2'
				>
					<TrashIcon size='xs' />
				</Button>
			</div>
		))
}
