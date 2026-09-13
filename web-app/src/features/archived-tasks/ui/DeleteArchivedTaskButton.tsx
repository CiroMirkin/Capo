import { useContext } from 'react'
import { TaskContext } from '@/features/tasks'
import { Button } from '@/shared/ui/atoms/button'
import { TrashIcon } from '@/shared/ui/atoms/icons'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useArchivedTasksQuery } from '../hooks/useArchivedTasksQuery'
import { deleteThisArchivedTask } from '../useCase/deleteArchivedTask'

export function DeleteArchivedTaskButton() {
	const { t } = useTranslation()
	const task = useContext(TaskContext)
	const { archivedTasks, updateArchivedTasks } = useArchivedTasksQuery()

	const deleteTaskAction = () => {
		const updatedArchivedTasks = deleteThisArchivedTask({
			task,
			archive: archivedTasks,
		})
		updateArchivedTasks(updatedArchivedTasks)
	}

	const askForConfirmationToDeleteTheTask = () => {
		toast.warning(t('archive.delete_task_warning'), {
			action: {
				label: t('archive.delete_task_btn'),
				onClick: deleteTaskAction,
			},
		})
	}

	return (
		<Button
			size='sm'
			variant='destructiveGhost'
			onClick={askForConfirmationToDeleteTheTask}
			title={t('archive.delete_task_btn')}
		>
			<TrashIcon />
		</Button>
	)
}
