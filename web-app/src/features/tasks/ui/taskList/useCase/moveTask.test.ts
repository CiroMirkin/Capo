import { TaskListInEachColumn } from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import { moveThisTask, moveThisTaskToTheNextColumn } from './moveTask'
import { expect } from 'vitest'

describe('Mover una tarea entre columnas', () => {
	test('Una tarea debería moverse a la columna siguiente', () => {
		const task = {
			id: '1',
			descriptionText: 'pipi',
		}
		const taskListInEachColumn = [[{ ...task }], []]

		expect(moveThisTask({ task, to: 'next-column', taskListInEachColumn })).toEqual([
			[],
			[
				{
					id: '1',
					descriptionText: 'pipi',
				},
			],
		])
	})

	test('Una tarea debería moverse a la columna anterior', () => {
		const task = {
			id: '1',
			descriptionText: 'pipi',
		}
		const taskListInEachColumn = [[], [{ ...task }]]

		expect(moveThisTask({ task, to: 'prev-column', taskListInEachColumn })).toEqual([
			[
				{
					id: '1',
					descriptionText: 'pipi',
				},
			],
			[],
		])
	})

	test('Al intentar mover una tarea en la primer columna a la columna anterior la tarea se quedara donde esta', () => {
		const task = {
			id: '1',
			descriptionText: 'pipi',
		}
		const taskListInEachColumn = [[{ ...task }], []]

		expect(moveThisTask({ task, to: 'prev-column', taskListInEachColumn })).toEqual([
			[
				{
					id: '1',
					descriptionText: 'pipi',
				},
			],
			[],
		])
	})
})

describe('Se respetan los limites de una lista de tareas (15 tareas).', () => {
	test('No se debería poder mover una tarea a una columna llena.', () => {
		const task = {
			id: '1',
			descriptionText: 'tarea',
		}

		// Crear una columna con la tarea que queremos mover
		const firstColumn = [{ ...task }]

		// Crear una segunda columna llena (al mover una más se supera el límite)
		const dummyTask = {
			id: '2',
			descriptionText: 'tarea dummy',
		}
		const secondColumnContent = new Array(15).fill(null).map((_, i) => ({
			...dummyTask,
			id: `dummy-${i}`,
		}))

		const taskListInEachColumn: TaskListInEachColumn = [firstColumn, secondColumnContent, []]

		expect(() => {
			moveThisTaskToTheNextColumn({ taskListInEachColumn, task })
		}).toThrow('La columna esta llena.')
	})
})
