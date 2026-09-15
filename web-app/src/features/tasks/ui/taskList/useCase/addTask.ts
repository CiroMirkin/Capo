import {
	TaskListInEachColumn,
	isThisTaskListWithinTheLimit,
	isThisParentWithinTheChildrenLimit,
} from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import { taskUseCaseParams } from './actions'

export function addTaskInFirstColumn({
	taskListInEachColumn: taskList,
	task,
}: taskUseCaseParams): TaskListInEachColumn {
	const columnPosition = 0

	if (task.parentId)
		isThisParentWithinTheChildrenLimit({
			taskListInEachColumn: taskList,
			parentId: task.parentId,
		})

	const newTaskList: TaskListInEachColumn = taskList.map((column, index) => {
		if (index === columnPosition) {
			return [...column, task]
		}
		return column
	})

	isThisTaskListWithinTheLimit({ taskList: newTaskList[columnPosition] })

	return newTaskList
}

export function addTaskInTheLastColumn({
	taskListInEachColumn,
	task,
}: taskUseCaseParams): TaskListInEachColumn {
	const columnIndex = taskListInEachColumn.length - 1

	const newTaskList: TaskListInEachColumn = taskListInEachColumn.map((column, index) => {
		if (index === columnIndex) {
			return [...column, task]
		}
		return column
	})

	return newTaskList
}
