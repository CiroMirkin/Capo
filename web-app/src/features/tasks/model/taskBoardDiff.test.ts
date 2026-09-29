import { describe, it, expect } from 'vitest'
import { diffTaskBoard, type TaskBoardChange } from './taskBoardDiff'
import { emptyTaskBoard, type TaskBoard } from './taskBoard'
import type { taskModel } from './task'

const task = (id: string, extra: Partial<taskModel> = {}): taskModel => ({
	id,
	descriptionText: `Tarea ${id}`,
	...extra,
})

const board = (): TaskBoard => [
	{ id: 'c1', status: 'To do', tasks: [task('a'), task('b')] },
	{ id: 'c2', status: 'Doing', tasks: [task('c')] },
	{ id: 'c3', status: 'Done', tasks: [] },
]

const types = (changes: TaskBoardChange[]) => changes.map((c) => c.type)
const upsertedTaskIds = (changes: TaskBoardChange[]) =>
	changes.flatMap((c) => (c.type === 'upsertTask' ? [c.task.id] : []))

describe('diffTaskBoard', () => {
	it('tableros iguales → []', () => {
		expect(diffTaskBoard(board(), board())).toEqual([])
	})

	it('tarea nueva al principio de la columna → upsert de la nueva y de las que se corrieron', () => {
		const next = board()
		next[0].tasks.unshift(task('n'))

		const changes = diffTaskBoard(board(), next)

		expect(types(changes)).toEqual(['upsertTask', 'upsertTask', 'upsertTask'])
		expect(changes[0]).toEqual({
			type: 'upsertTask',
			task: task('n'),
			columnId: 'c1',
			order: 0,
		})
		expect(upsertedTaskIds(changes).sort()).toEqual(['a', 'b', 'n'])
	})

	it.each([
		['notesAndComments', { notesAndComments: 'nota' }],
		['tags', { tags: [{ id: 'x', name: 'urgente' }] as never }],
		['dueDate', { dueDate: '2030-01-01' }],
		['descriptionText', { descriptionText: 'otra' }],
	])('editar solo %s → 1 upsertTask con la tarea completa', (_field, extra) => {
		const next = board()
		next[1].tasks[0] = { ...next[1].tasks[0], ...extra }

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertTask', task: next[1].tasks[0], columnId: 'c2', order: 0 },
		])
	})

	it('borrar tarea → deleteTask (y reordena las que se corrieron)', () => {
		const next = board()
		next[0].tasks.shift()

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'deleteTask', taskId: 'a' },
			{ type: 'upsertTask', task: task('b'), columnId: 'c1', order: 0 },
		])
	})

	it('borrar padre con hijas → un deleteTask por cada una', () => {
		const prev = board()
		prev[1].tasks.push(task('h1', { parentId: 'c' }), task('h2', { parentId: 'c' }))
		const next = board()
		next[1].tasks = []

		expect(diffTaskBoard(prev, next)).toEqual([
			{ type: 'deleteTask', taskId: 'c' },
			{ type: 'deleteTask', taskId: 'h1' },
			{ type: 'deleteTask', taskId: 'h2' },
		])
	})

	it('mover tarea a otra columna → upsertTask con columnId nuevo, sin deleteTask', () => {
		const next = board()
		const [b] = next[0].tasks.splice(1, 1)
		next[2].tasks.push(b)

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertTask', task: task('b'), columnId: 'c3', order: 0 },
		])
	})

	it('reordenar dentro de una columna → solo las tareas cuyo índice cambió', () => {
		const prev = board()
		prev[0].tasks.push(task('z'))
		const next = board()
		next[0].tasks = [task('b'), task('a'), task('z')]

		const changes = diffTaskBoard(prev, next)

		expect(upsertedTaskIds(changes).sort()).toEqual(['a', 'b'])
	})

	it('columna nueva → upsertColumn con su order', () => {
		const next = board()
		next.push({ id: 'c4', status: 'Review', tasks: [] })

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertColumn', column: { id: 'c4', name: 'Review', order: 3 } },
		])
	})

	it('columna renombrada → upsertColumn', () => {
		const next = board()
		next[1].status = 'En curso'

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertColumn', column: { id: 'c2', name: 'En curso', order: 1 } },
		])
	})

	it('columnas reordenadas → upsertColumn solo de las que cambiaron de índice (las tareas no)', () => {
		const prev = board()
		const next = [prev[1], prev[0], prev[2]].map((c) => ({ ...c }))

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertColumn', column: { id: 'c2', name: 'Doing', order: 0 } },
			{ type: 'upsertColumn', column: { id: 'c1', name: 'To do', order: 1 } },
		])
	})

	it('columna borrada → deleteTask de sus tareas y deleteColumn al final', () => {
		const next = board().filter((c) => c.id !== 'c2')

		expect(diffTaskBoard(board(), next)).toEqual([
			{ type: 'upsertColumn', column: { id: 'c3', name: 'Done', order: 1 } },
			{ type: 'deleteTask', taskId: 'c' },
			{ type: 'deleteColumn', columnId: 'c2' },
		])
	})

	it('mover tareas fuera de una columna que se borra → los upserts van antes del deleteColumn', () => {
		const next = board().filter((c) => c.id !== 'c1')
		next[1].tasks = [task('a'), task('b')]

		const changes = diffTaskBoard(board(), next)

		expect(changes.at(-1)).toEqual({ type: 'deleteColumn', columnId: 'c1' })
		expect(upsertedTaskIds(changes).sort()).toEqual(['a', 'b'])
		expect(types(changes)).not.toContain('deleteTask')
	})

	it('columna nueva con tareas → upsertColumn antes que los upsertTask', () => {
		const next = board()
		next.push({ id: 'c4', status: 'Review', tasks: [task('a')] })
		next[0].tasks = [task('b')]

		const changes = diffTaskBoard(board(), next)

		expect(changes[0].type).toBe('upsertColumn')
	})

	it('padre e hija nuevos en el mismo batch, padre en una columna posterior → padre antes que hija', () => {
		const next = board()
		next[0].tasks.push(task('hija', { parentId: 'padre' }))
		next[2].tasks.push(task('padre'))

		const ids = upsertedTaskIds(diffTaskBoard(board(), next))

		expect(ids.indexOf('padre')).toBeLessThan(ids.indexOf('hija'))
	})

	it('tablero con ids placeholder → cambios con esos ids tal cual', () => {
		const next: TaskBoard = emptyTaskBoard.map((c) => ({ ...c, tasks: [] }))
		next[0] = { ...next[0], status: 'Por hacer', tasks: [task('a')] }

		expect(diffTaskBoard(emptyTaskBoard, next)).toEqual([
			{ type: 'upsertColumn', column: { id: 'todo', name: 'Por hacer', order: 0 } },
			{ type: 'upsertTask', task: task('a'), columnId: 'todo', order: 0 },
		])
	})
})
