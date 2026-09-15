import { addTagInThisTask } from './addTagInThisTask'
import { taskModel } from '@/features/tasks/model/task'
import { TaskListInEachColumn } from '../models/taskListInEachColumn'
import type { Tag } from '@/features/tags'

const urgentTag: Tag = { id: 'urgent', name: 'Urgente' }

describe('Agregar/quitar tags de una tarea existente.', () => {
	it('agrega tags a la tarea indicada', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1' }
		const list: TaskListInEachColumn = [[task], [], []]

		const updated = addTagInThisTask({ taskListByColumns: list, task, tags: [urgentTag] })

		expect(updated[0][0].tags).toEqual([urgentTag])
	})

	it('quita todos los tags cuando se pasa una lista vacía', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1', tags: [urgentTag] }
		const list: TaskListInEachColumn = [[task], [], []]

		const updated = addTagInThisTask({ taskListByColumns: list, task, tags: [] })

		expect(updated[0][0].tags).toEqual([])
	})

	it('no toca otras tareas de la lista', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1' }
		const other: taskModel = { id: '2', descriptionText: 'Task 2' }
		const list: TaskListInEachColumn = [[task, other], [], []]

		const updated = addTagInThisTask({ taskListByColumns: list, task, tags: [urgentTag] })

		expect(updated[0][1].tags).toBeUndefined()
	})
})
