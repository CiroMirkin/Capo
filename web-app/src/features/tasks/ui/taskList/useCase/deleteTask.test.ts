import { deleteThisTask } from './deleteTask'
import { expect } from 'vitest'

describe('Eliminar una tarea.', () => {
	test('Se debería eliminar la tarea elegida de su columna.', () => {
		const task = {
			id: '',
			descriptionText: '',
			columnPosition: '1',
		}
		const taskListInEachColumn = [[{ ...task }], [], []]
		expect(deleteThisTask({ taskListInEachColumn, task })).toStrictEqual([[], [], []])
	})
})

describe('Eliminar un padre borra en cascada sus hijas.', () => {
	test('Se deberían eliminar el padre y sus hijas, aunque estén en otras columnas.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const child1 = { id: 'c1', descriptionText: 'hija 1', parentId: 'p1' }
		const child2 = { id: 'c2', descriptionText: 'hija 2', parentId: 'p1' }
		const other = { id: 'o1', descriptionText: 'otra tarea' }
		const taskListInEachColumn = [[child1, child2], [parent], [other]]

		expect(deleteThisTask({ taskListInEachColumn, task: parent })).toStrictEqual([
			[],
			[],
			[other],
		])
	})

	test('Eliminar una hija sola no afecta al padre ni a las demás hijas.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const child1 = { id: 'c1', descriptionText: 'hija 1', parentId: 'p1' }
		const child2 = { id: 'c2', descriptionText: 'hija 2', parentId: 'p1' }
		const taskListInEachColumn = [[child1, child2], [parent]]

		expect(deleteThisTask({ taskListInEachColumn, task: child1 })).toStrictEqual([
			[child2],
			[parent],
		])
	})
})
