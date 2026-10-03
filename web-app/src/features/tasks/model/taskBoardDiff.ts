import type { TaskBoard } from './taskBoard'
import type { taskModel } from './task'

export type TaskBoardChange =
	| { type: 'upsertColumn'; column: { id: string; name: string; order: number } }
	| { type: 'deleteColumn'; columnId: string }
	| { type: 'upsertTask'; task: taskModel; columnId: string; order: number }
	| { type: 'deleteTask'; taskId: string }

type UpsertTask = Extract<TaskBoardChange, { type: 'upsertTask' }>
type Placed = { task: taskModel; columnId: string; order: number }

const placeTasks = (board: TaskBoard): Map<string, Placed> =>
	new Map(
		board.flatMap((column) =>
			column.tasks.map(
				(task, order) => [task.id, { task, columnId: column.id, order }] as const
			)
		)
	)

// Campos persistidos
// JSON.stringify alcanza entonces los datos planos armados siempre por el mismo código
const taskFingerprint = ({ task, columnId, order }: Placed) =>
	JSON.stringify([
		columnId,
		order,
		task.descriptionText,
		task.dueDate,
		task.tags,
		task.notesAndComments,
		task.timelineHistory,
		task.parentId,
	])

/** Padres antes que hijas cuando ambos están en el batch (no asume un solo nivel). */
const sortByParent = (upserts: UpsertTask[]): UpsertTask[] => {
	const byId = new Map(upserts.map((u) => [u.task.id, u]))
	const sorted: UpsertTask[] = []
	const visited = new Set<string>()
	const visit = (u: UpsertTask) => {
		if (visited.has(u.task.id)) return
		visited.add(u.task.id)
		const parent = u.task.parentId && byId.get(u.task.parentId)
		if (parent) visit(parent)
		sorted.push(u)
	}
	upserts.forEach(visit)
	return sorted
}

/** Cambios mínimos para pasar de `prev` a `next`, en orden de aplicación. */
export const diffTaskBoard = (prev: TaskBoard, next: TaskBoard): TaskBoardChange[] => {
	const prevColumns = new Map(prev.map((column, order) => [column.id, { column, order }]))
	const nextColumnIds = new Set(next.map((column) => column.id))

	const upsertColumns: TaskBoardChange[] = next.flatMap((column, order) => {
		const before = prevColumns.get(column.id)
		if (before && before.order === order && before.column.status === column.status) return []
		return [{ type: 'upsertColumn', column: { id: column.id, name: column.status, order } }]
	})

	const deleteColumns: TaskBoardChange[] = prev
		.filter((column) => !nextColumnIds.has(column.id))
		.map((column) => ({ type: 'deleteColumn', columnId: column.id }))

	const prevTasks = placeTasks(prev)
	const nextTasks = placeTasks(next)

	const deleteTasks: TaskBoardChange[] = [...prevTasks.keys()]
		.filter((id) => !nextTasks.has(id))
		.map((taskId) => ({ type: 'deleteTask', taskId }))

	const upsertTasks: UpsertTask[] = [...nextTasks.values()]
		.filter((placed) => {
			const before = prevTasks.get(placed.task.id)
			return !before || taskFingerprint(before) !== taskFingerprint(placed)
		})
		.map((placed) => ({ type: 'upsertTask', ...placed }))

	return [...upsertColumns, ...deleteTasks, ...sortByParent(upsertTasks), ...deleteColumns]
}
