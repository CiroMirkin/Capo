import { taskModel } from '@/features/tasks/model/task'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useColumnList } from '@/features/tasks/ui/Columns/hooks/useColumnList'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { findTaskColumnIndex, moveThisTaskToTheNextColumn } from '../useCase/moveTask'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { useTaskListInEachColumn } from './useTaskListInEachColumn'

/** Avanza una tarea a la columna siguiente (reutilizado por los botones y el click derecho). */
export function useMoveTaskToNextColumn(): (data: taskModel) => void {
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const columnList = useColumnList()

	return (data: taskModel) => {
		const currentColumnIndex = findTaskColumnIndex(listOfTaskInColumns || [], data.id)
		const nextColumnName = columnList[currentColumnIndex + 1]?.name

		const task = {
			...data,
			timelineHistory: nextColumnName
				? addChangeToTaskTimelineHistory({ task: data, columnName: nextColumnName })
				: data.timelineHistory,
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
