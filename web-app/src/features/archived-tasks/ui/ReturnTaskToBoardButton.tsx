import { useContext } from 'react'
import { TaskContext } from '@/features/tasks'
import { Button } from '@/shared/ui/atoms/button'
import { ArchiveRestoreIcon } from '@/shared/ui/atoms/icons'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useTaskBoardQuery } from '@/features/tasks'
import { addTaskInTheLastColumn } from '@/features/tasks'
import { sortListOfTasksInColumnsByPriority } from '@/features/tasks'
import { useArchivedTasksQuery } from '../hooks/useArchivedTasksQuery'
import { deleteThisArchivedTask } from '../useCase/deleteArchivedTask'
import { addChangeToTaskTimelineHistory } from '@/features/tasks'
import { useTaskListInEachColumn } from '@/features/tasks'

export function ReturnTaskToBoardButton() {
	const { t } = useTranslation()
	const task = useContext(TaskContext)
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const { archivedTasks, updateArchivedTasks } = useArchivedTasksQuery()

	const returnTaskToLastColumnAction = () => {
		const timelineHistory = addChangeToTaskTimelineHistory({
			task,
			columnName: t('archive.unarchived'),
		})
		const updatedListOfTaskInColumns = sortListOfTasksInColumnsByPriority(
			addTaskInTheLastColumn({
				taskListInEachColumn: listOfTaskInColumns,
				task: { ...task, timelineHistory },
			})
		)
		updateTaskBoard(updatedListOfTaskInColumns)

		const updatedArchivedTasks = deleteThisArchivedTask({
			task,
			archive: archivedTasks,
		})
		updateArchivedTasks(updatedArchivedTasks)

		toast.info(t('archive.return_task_to_board_toast'))
	}

	return (
		<Button
			size='sm'
			onClick={returnTaskToLastColumnAction}
			variant='ghost'
			className='w-full'
			data-testid='BotonParaDevolverUnaTareaArchivadaAlTablero'
		>
			<ArchiveRestoreIcon className='mr-2' /> {t('archive.return_task_to_board_btn')}
		</Button>
	)
}
