import BusinessError from '@/shared/errors/businessError'
import { isValidDueDate, taskModel } from '@/features/tasks/model/task'
import { TaskListInEachColumn } from '../models/taskListInEachColumn'

interface SetDueDateOfThisTaskParams {
	taskToUpdate: taskModel
	dueDate: string
	listOfTaskInColumns: TaskListInEachColumn
}

/**
 * Agrega la fecha límite a una tarea que **no la tiene**. Misma validación que
 * al crear (`isValidDueDate`, la que usa `getNewTask`). No edita una fecha ya
 * seteada: si la tarea ya tiene `dueDate`, la deja intacta.
 */
export const setDueDateOfThisTask = ({
	taskToUpdate,
	dueDate,
	listOfTaskInColumns,
}: SetDueDateOfThisTaskParams): TaskListInEachColumn => {
	if (!isValidDueDate(dueDate)) throw new BusinessError('La fecha límite no es válida.')

	return listOfTaskInColumns.map((taskList) =>
		taskList.map((task) =>
			task.id === taskToUpdate.id && !task.dueDate ? { ...task, dueDate } : task
		)
	)
}
