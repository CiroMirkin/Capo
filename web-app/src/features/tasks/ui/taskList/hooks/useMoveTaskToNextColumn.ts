import { taskModel } from '@/features/tasks/model/task'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useGetColumnNameFromTask } from '@/features/tasks/ui/Columns/hooks/useGetColumnNameFromTask'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { moveThisTaskToTheNextColumn } from '../useCase/moveTask'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { useTaskListInEachColumn } from './useTaskListInEachColumn'

/** Avanza una tarea a la columna siguiente (reutilizado por los botones y el click derecho). */
export function useMoveTaskToNextColumn(): (data: taskModel) => void {
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const getColumnName = useGetColumnNameFromTask()

	return (data: taskModel) => {
		const task = {
			...data,
			timelineHistory: addChangeToTaskTimelineHistory({
				task: data,
				columnName: getColumnName(data),
			}),
		}
		const updatedList = sortListOfTasksInColumnsByPriority(
			moveThisTaskToTheNextColumn({
				taskListInEachColumn: listOfTaskInColumns || [],
				task,
			})
		)
		updateTaskBoard(updatedList)
	}
}
