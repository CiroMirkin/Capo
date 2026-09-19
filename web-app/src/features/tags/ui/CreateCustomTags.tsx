'use client'

import { useState } from 'react'
import { Badge, badgeVariants } from '@/shared/ui/atoms/badge'
import { Button } from '@/shared/ui/atoms/button'
import { Input } from '@/shared/ui/atoms/input'
import { Label } from '@/shared/ui/atoms/label'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { cn } from '@/shared/lib/utils'
import { useTheme } from '@/shared/hooks/useTheme'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { useCustomTagsQuery } from '../hooks/useCustomTagsQuery'
import {
	MAX_CUSTOM_TAGS,
	MAX_TAG_NAME_LENGTH,
	MAX_TAG_PRIORITY,
	MIN_TAG_PRIORITY,
	Tag,
} from '../model/tags'

type TagColor = NonNullable<Tag['variant']>

const colorOptions = Object.keys(badgeVariants).filter(
	(variant) => variant !== 'trial' && variant !== 'turbo'
) as TagColor[]

export function CreateCustomTags() {
	const { t } = useTranslation()
	const { taskText, task } = useTheme()
	const { customTags, updateCustomTags } = useCustomTagsQuery()

	const [name, setName] = useState('')
	const [priority, setPriority] = useState('')
	const [variant, setVariant] = useState<TagColor>(colorOptions[0])

	const limitReached = customTags.length >= MAX_CUSTOM_TAGS

	const handleAdd = () => {
		const trimmedName = name.trim()
		if (!trimmedName || trimmedName.length > MAX_TAG_NAME_LENGTH || limitReached) return

		const priorityNumber = priority ? Number(priority) : undefined
		if (
			priorityNumber !== undefined &&
			(priorityNumber < MIN_TAG_PRIORITY || priorityNumber > MAX_TAG_PRIORITY)
		) {
			return
		}

		const newTag: Tag = {
			id: crypto.randomUUID(),
			name: trimmedName,
			variant,
			priority: priorityNumber,
		}

		try {
			updateCustomTags([...customTags, newTag])
			toast.success(t('settings.custom_tags.created_toast'))
			setName('')
			setPriority('')
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<div>
			<SettingSection.Title>{t('settings.custom_tags.section_title')}</SettingSection.Title>
			<SettingSection.Description>
				{t('settings.custom_tags.section_description')}
			</SettingSection.Description>

			<SettingSection.Content className='grid gap-3'>
				<div className='grid mr-2 w-full items-center gap-1.5'>
					<Label htmlFor='custom-tag-name' className={taskText || 'text-black'}>
						{t('settings.custom_tags.name_input_label')}
					</Label>
					<Input
						type='text'
						id='custom-tag-name'
						value={name}
						onChange={(e) => setName(e.target.value)}
						disabled={limitReached}
						maxLength={MAX_TAG_NAME_LENGTH}
						placeholder={t('settings.custom_tags.name_input_placeholder')}
					/>
				</div>

				<div className='grid mr-2 w-full items-center gap-1.5'>
					<Label htmlFor='custom-tag-priority' className={taskText || 'text-black'}>
						{t('settings.custom_tags.priority_input_label')}
					</Label>
					<Input
						type='number'
						id='custom-tag-priority'
						value={priority}
						disabled={limitReached}
						onChange={(e) => setPriority(e.target.value)}
						min={MIN_TAG_PRIORITY}
						max={MAX_TAG_PRIORITY}
					/>
				</div>

				<div className='flex items-start gap-10'>
					<div className='grid mr-2 w-full items-center gap-1.5'>
						<Label className={taskText || 'text-black'}>
							{t('settings.custom_tags.color_label')}
						</Label>
						<div className='flex flex-wrap gap-2'>
							{colorOptions.map((option) => (
								<button
									key={option}
									type='button'
									aria-label={option}
									onClick={() => setVariant(option)}
									disabled={limitReached}
									className={cn(
										'w-6 h-6 rounded-full border-2',
										badgeVariants[option].split(' ')[0],
										variant === option && !limitReached
											? 'ring-2 ring-offset-1 ring-black'
											: 'border-transparent',
										limitReached && 'opacity-40 cursor-not-allowed'
									)}
								/>
							))}
						</div>
					</div>
					<div className={cn('rounded p-4 pl-6', task)}>
						{name && (
							<Badge variant={variant || 'inverted'} size='sm'>
								{name}
							</Badge>
						)}
					</div>
				</div>

				{!limitReached && (
					<Button onClick={handleAdd} variant='ghost' disabled={limitReached}>
						{t('settings.custom_tags.add_btn')}
					</Button>
				)}
				{limitReached && (
					<p className='w-full text-center text-sm opacity-70'>
						{t('settings.custom_tags.limit_reached', { max: MAX_CUSTOM_TAGS })}
					</p>
				)}
			</SettingSection.Content>
		</div>
	)
}
