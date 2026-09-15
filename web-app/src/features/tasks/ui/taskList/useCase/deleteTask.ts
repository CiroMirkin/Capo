import {
	TaskListInEachColumn,
	getChildrenOfTaskInBoard,
} from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import { TaskList } from '@/features/tasks/model/TaskList'
import { taskModel } from '@/features/tasks/model/task'

interface DeleteThisTaskParams {
	taskListInEachColumn: TaskListInEachColumn
	task: taskModel
}

export function removeThisTaskFromItsColumn({
	taskListInEachColumn,
	task,
}: DeleteThisTaskParams): TaskList[] {
	return taskListInEachColumn.map((taskList) => taskList.filter((t) => t.id !== task.id))
}

/**
 * Borra la tarea en cualquier columna en la que esté, y en cascada sus sub-tareas (si las tiene) sin importar en qué columna estén ellas.
 */
export function deleteThisTask({ taskListInEachColumn, task }: DeleteThisTaskParams): TaskList[] {
	const idsToDelete = new Set([
		task.id,
		...getChildrenOfTaskInBoard(taskListInEachColumn, task.id).map((child) => child.id),
	])

	return taskListInEachColumn.map((taskList) => taskList.filter((t) => !idsToDelete.has(t.id)))
}
