import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { taskModel } from '@/features/tasks'
import { useTaskBoardQuery } from '@/features/tasks'
import { deleteThisTask } from '@/features/tasks'
import { addChangeToTaskTimelineHistory } from '@/features/tasks'
import { useTaskListInEachColumn } from '@/features/tasks'
import { useArchivedTasksQuery } from './useArchivedTasksQuery'
import { archiveThisTask } from '../useCase/archiveTask'

/** Archiva una tarea del tablero (reutilizado por `ArchiveTaskButton` y el click derecho en la última columna). */
export function useArchiveTask(): (task: taskModel) => void {
	const { t } = useTranslation()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const { updateArchivedTasks, archivedTasks } = useArchivedTasksQuery()

	return (data: taskModel) => {
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
	}
}
