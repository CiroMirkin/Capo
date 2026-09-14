import BusinessError from '@/shared/errors/businessError'
import { TaskBoard } from '@/features/tasks/model/taskBoard'
import { TaskList } from '@/features/tasks/model/TaskList'
import { taskModel } from '@/features/tasks/model/task'

export type TaskListInEachColumn = TaskList[]
export const emptyTaskListInEachColumn: TaskListInEachColumn = [[], [], []]

export const isThisArrayOfTypeTaskListInEachColumn = (a: TaskListInEachColumn | TaskBoard) =>
	Array.isArray(a[0])

const TASK_LIST_LIMIT = 15

export const isThisTaskListWithinTheLimit = ({
	taskList,
}: {
	taskList: TaskList
}): true | BusinessError => {
	if (taskList.length > TASK_LIST_LIMIT) throw new BusinessError('La columna esta llena.')
	return true
}

// --- Sub-tareas -------------------------------------------------------------
// Un solo nivel: las hijas viven mezcladas en las columnas como cualquier
// tarea (mismo columnId/order/límite de 15). Estos helpers las ubican por
// `parentId` en todo el tablero (no solo en la columna del padre).

const CHILDREN_LIMIT = 20

export const getChildrenOfTaskInBoard = (
	taskListInEachColumn: TaskListInEachColumn,
	parentId: string
): TaskList => taskListInEachColumn.flat().filter((task) => task.parentId === parentId)

export const isThisParentWithinTheChildrenLimit = ({
	taskListInEachColumn,
	parentId,
}: {
	taskListInEachColumn: TaskListInEachColumn
	parentId: string
}): true | BusinessError => {
	if (getChildrenOfTaskInBoard(taskListInEachColumn, parentId).length >= CHILDREN_LIMIT)
		throw new BusinessError('Esta tarea ya tiene el máximo de subtareas.')
	return true
}

/** Una hija se archiva libre; un padre recién cuando ninguna hija suya sigue en el tablero. */
export const isTaskReadyToArchiveIndividually = (
	taskListInEachColumn: TaskListInEachColumn,
	task: taskModel
): boolean =>
	!!task.parentId || getChildrenOfTaskInBoard(taskListInEachColumn, task.id).length === 0

/**
 * Separa la última columna en listas para archivar (`ready`) y para dejar
 * donde están (`notReady`: padres a los que todavía les falta archivar
 * alguna hija). Usado por `ArchiveTaskListButton` para no bloquear toda la
 * columna por un padre incompleto.
 */
export const splitLastColumnByArchiveReadiness = (
	taskListInEachColumn: TaskListInEachColumn,
	lastColumnIndex: number
): { ready: TaskList; notReady: TaskList } => {
	const lastColumnTasks = taskListInEachColumn[lastColumnIndex]
	const ready: TaskList = []
	const notReady: TaskList = []
	for (const task of lastColumnTasks) {
		;(isTaskReadyToArchiveIndividually(taskListInEachColumn, task) ? ready : notReady).push(
			task
		)
	}
	return { ready, notReady }
}
