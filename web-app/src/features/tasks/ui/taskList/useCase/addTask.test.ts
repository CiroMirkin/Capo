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
