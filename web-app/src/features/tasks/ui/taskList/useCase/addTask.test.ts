import { TaskListInEachColumn } from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import { TaskList } from '@/features/tasks/model/TaskList'
import { addTaskInFirstColumn, addTaskInTheLastColumn } from './addTask'
import { expect } from 'vitest'

describe('Crear una tarea.', () => {
	test('Se debería agregar la tarea recibida a la primer columna del tablero.', () => {
		const task = {
			id: '',
			descriptionText: '',
			columnPosition: '1',
		}
		const taskListInEachColumn: TaskList[] = [[], [], []]
		expect(addTaskInFirstColumn({ taskListInEachColumn, task })).toStrictEqual([
			[
				{
					id: '',
					descriptionText: '',
					columnPosition: '1',
				},
			],
			[],
			[],
		])
	})
})

describe('Agregar una tarea a la última columna.', () => {
	test('Se debería agregar la tarea indicada a la última columna.', () => {
		const task = {
			id: '23hlvi514vli',
			descriptionText: '',
			columnPosition: '2',
		}
		const taskListInEachColumn: TaskList[] = [[], []]
		expect(addTaskInTheLastColumn({ taskListInEachColumn, task })).toStrictEqual([
			[],
			[
				{
					id: '23hlvi514vli',
					descriptionText: '',
					columnPosition: '2',
				},
			],
		])
	})
})

describe('Se respeta el limite de 20 hijas por padre.', () => {
	// Las hijas existentes se reparten entre columnas (podrían haberse movido)
	// para no chocar con el límite de 15 tareas por columna al armar el caso.
	const makeChildren = (count: number) =>
		Array.from({ length: count }, (_, i) => ({
			id: `c${i}`,
			descriptionText: 'hija',
			parentId: 'p1',
		}))

	test('Se debería poder crear la vigésima hija.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const children = makeChildren(19)
		const taskListInEachColumn = [[children[0]], [parent, ...children.slice(1)], []]
		const newChild = { id: 'c19', descriptionText: 'hija 20', parentId: 'p1' }

		const result = addTaskInFirstColumn({ taskListInEachColumn, task: newChild })
		expect(result[0]).toStrictEqual([children[0], newChild])
	})

	test('No se debería poder crear una vigésimo primera hija.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const children = makeChildren(20)
		const taskListInEachColumn = [[children[0]], [parent, ...children.slice(1)], []]
		const newChild = { id: 'c20', descriptionText: 'hija 21', parentId: 'p1' }

		expect(() => addTaskInFirstColumn({ taskListInEachColumn, task: newChild })).toThrow(
			'Esta tarea ya tiene el máximo de subtareas.'
		)
	})
})

describe('Se respetan los limites de una lista de tareas', () => {
	test('No se debería poder crear una tarea en la primer columna si esta llena. PRUEBA POCO CONFIABLE, REVISAR.', () => {
		const task = {
			id: '',
			descriptionText: 'tarea',
			columnPosition: '1',
		}
		const taskListInEachColumn: TaskListInEachColumn = [[], [], []]
		const secondColumnContent = new Array(15).fill(task)
		taskListInEachColumn[0] = secondColumnContent

		expect(() => {
			return addTaskInFirstColumn({ taskListInEachColumn, task })
		}).toThrow('La columna esta llena.')
	})
})
