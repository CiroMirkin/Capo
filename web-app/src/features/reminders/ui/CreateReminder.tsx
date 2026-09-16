'use client'

import { useState, ChangeEvent, useEffect } from 'react'
import { Button } from '@/shared/ui/atoms/button'
import { Input } from '@/shared/ui/atoms/input'
import { Label } from '@/shared/ui/atoms/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/ui/atoms/select'
import { Reminder as reminder } from '../model/reminder'
import { toast } from 'sonner'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { useTranslation } from 'react-i18next'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { useReminderQuery } from '../hooks/useReminderQuery'
import { useTheme } from '@/shared/hooks/useTheme'

interface ReminderColumn {
	name: string
	position: string
	id: string
}

function CreateReminder({ columnList }: { columnList: ReminderColumn[] }) {
	const { t } = useTranslation()
	const color = useTheme()
	const { reminder, updateReminder } = useReminderQuery()
	const [reminderText, setReminderText] = useState(reminder?.text as string)
	const [reminderColumnPosition, setReminderColumnPosition] = useState(
		reminder?.columnPosition as string
	)

	useEffect(() => {
		if (reminder) {
			setReminderText(reminder.text)
			setReminderColumnPosition(reminder.columnPosition)
		}
	}, [reminder])

	const handleClick = () => {
		const newReminder: reminder = {
			text: reminderText,
			columnPosition: reminderColumnPosition,
		}

		try {
			updateReminder(newReminder)
			toast.success(t('settings.reminder.created_toast'))
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newReminderText = e.target.value
		setReminderText(newReminderText)
	}

	return (
		<div>
			<SettingSection.Title>{t('settings.reminder.section_title')}</SettingSection.Title>
			<SettingSection.Description>
				{t('settings.reminder.section_description')}
			</SettingSection.Description>
			<SettingSection.Content className={` grid gap-3`}>
				<div className={`grid mr-2 w-full items-center gap-1.5`}>
					<Label className={color.taskText || 'text-black'}>
						{t('settings.reminder.select_column_label')}
					</Label>
					<Select
						value={reminderColumnPosition}
						onValueChange={(value) => setReminderColumnPosition(value)}
					>
						<SelectTrigger className='w-full'>
							<SelectValue
								placeholder={t('settings.reminder.select_column_default_option')}
							/>
						</SelectTrigger>
						<SelectContent>
							{columnList.map((column) => (
								<SelectItem value={column.position} key={column.id}>
									{column.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='grid mr-2 w-full items-center gap-1.5'>
					<Label htmlFor='reminder-text' className={color.taskText || 'text-black'}>
						{t('settings.reminder.reminder_description_input_label')}
					</Label>
					<Input
						type='text'
						id='reminder-text'
						value={reminderText}
						onChange={handleChange}
						placeholder={t('settings.reminder.reminder_description_input_placeholder')}
					/>
				</div>

				<Button onClick={handleClick} variant='ghost'>
					{t('settings.reminder.create_reminder_btn')}
				</Button>
			</SettingSection.Content>
		</div>
	)
}

export default CreateReminder
