import { Button } from '@/shared/ui/atoms/button'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useDataOfTheTask } from '@/features/tasks'
import { ArchiveIcon } from '@/shared/ui/atoms/icons'
import { useTaskBoardQuery } from '@/features/tasks'
import { deleteThisTask } from '@/features/tasks'
import { useArchivedTasksQuery } from '../hooks/useArchivedTasksQuery'
import { archiveThisTask } from '../useCase/archiveTask'
import { useCallback } from 'react'
import { addChangeToTaskTimelineHistory } from '@/features/tasks'
import { useTaskListInEachColumn } from '@/features/tasks'

interface ArchiveTaskButtonProps {
	handleClick: (action: () => void) => void
	className?: string
}

export function ArchiveTaskButton({ handleClick, className }: ArchiveTaskButtonProps) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const { updateArchivedTasks, archivedTasks } = useArchivedTasksQuery()

	const archiveTaskAction = useCallback(() => {
		const timelineHistory = addChangeToTaskTimelineHistory({
			task: data,
			columnName: t('archive.archived'),
		})
		const updatedArchive = archiveThisTask({
			task: { ...data, timelineHistory },
			archive: archivedTasks,
		})

		const updatedList = deleteThisTask({
			taskListInEachColumn: listOfTaskInColumns,
			task: data,
		})

		updateArchivedTasks(updatedArchive)
		updateTaskBoard(updatedList)

		toast.info(t('task_buttons.archive_toast'))
	}, [data, archivedTasks, listOfTaskInColumns, updateArchivedTasks, updateTaskBoard, t])

	return (
		<Button
			size='sm'
			variant='ghost'
			className={className}
			data-testid='BotonParaArchivarUnaTarea'
			onClick={() => handleClick(archiveTaskAction)}
			title={t('task_buttons.archive')}
		>
			<ArchiveIcon className='mr-2' /> {t('task_buttons.archive')}
		</Button>
	)
}
