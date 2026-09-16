import { Button } from '@/shared/ui/atoms/button'
import { TrashIcon } from '@/shared/ui/atoms/icons'
import { blankReminder } from '../model/reminder'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTheme } from '@/shared/hooks/useTheme'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import { SettingSection } from '@/shared/ui/organisms/SettingSection'
import { useReminderQuery } from '../hooks/useReminderQuery'

export function ReminderList() {
	const { t } = useTranslation()
	return (
		<div>
			<SettingSection.Title>
				{t('settings.reminder.reminder_list_section_title')}
			</SettingSection.Title>
			<SettingSection.Content className='py-0 px-0 bg-transparent'>
				<ReminderListContainer />
			</SettingSection.Content>
		</div>
	)
}

const ReminderListContainer = () => {
	const t = useTranslation().t
	const { reminder, updateReminder } = useReminderQuery()

	const deleteReminder = () => {
		updateReminder(blankReminder)
	}

	const askForConfirmationToDeleteTheReminder = () => {
		toast.warning(t('settings.reminder.delete_reminder_warning_toast'), {
			action: {
				label: t('settings.reminder.delete_reminder_btn'),
				onClick: deleteReminder,
			},
		})
	}

	const { task, taskText } = useTheme()
	const reminderList = reminder ? (
		<li
			className={`w-full py-1 px-3 flex flex-col gap-2 content-stretch rounded-md ${task}  ${taskText || 'text-black'}`}
		>
			<div className='w-full flex justify-between items-center gap-2'>
				<p className='text-lg'>{reminder.text}</p>
				<Button
					variant='destructiveGhost'
					title={t('settings.reminder.delete_reminder_btn')}
					onClick={askForConfirmationToDeleteTheReminder}
				>
					<TrashIcon />
				</Button>
			</div>
		</li>
	) : null

	const blankReminderList = (
		<EmptySpaceText className={`py-2 px-3 rounded-md ${task}`} textSize='lg'>
			{t('settings.reminder.blank_reminder_list')}
		</EmptySpaceText>
	)

	return !reminder?.text ? blankReminderList : reminderList
}
