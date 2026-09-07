import { emptyTask } from '@/features/tasks/model/task'
import { addChangeToEachTaskInList } from './addChangeToEachTaskInList'
import { describe, test, expect } from 'vitest'

describe('Agrega un cambio de columna al historial de cada tarea en la lista especificada', () => {
	test('Se actualizan todas las tareas de la lista especificada.', () => {
		const taskList = Array(10)
			.fill(null)
			.map(() => ({ ...emptyTask }))
		const listOfTasksInColumns = [[], [...taskList]]

		const result = addChangeToEachTaskInList({
			listOfTasksInColumns,
			taskListIndex: 1,
			columnName: 'Procesando',
		})

		expect(result).toBeDefined()
		expect(result[1]).toHaveLength(10)

		// Verificar que cada tarea tiene el cambio de columna agregado
		result[1].forEach((task) => {
			expect(task.timelineHistory).toBeDefined()
			expect(task.timelineHistory?.length).toBeGreaterThan(0)

			const lastChange = task.timelineHistory?.[task.timelineHistory.length - 1]
			expect(lastChange?.columnName).toBe('Procesando')
			expect(lastChange?.date).toBeInstanceOf(Date)
		})

		expect(result[0]).toHaveLength(0)
	})

	test('Se retorna la lista sin cambios si el taskListIndex especificado es un numero negativo.', () => {
		const taskList = Array(5)
			.fill(null)
			.map(() => ({ ...emptyTask }))
		const listOfTasksInColumns = [[], [...taskList]]

		const result = addChangeToEachTaskInList({
			listOfTasksInColumns,
			taskListIndex: -1,
			columnName: 'Procesando',
		})

		expect(result).toEqual(listOfTasksInColumns)
	})

	test('Se retorna la lista sin cambios si la lista de tareas especificada esta vacia.', () => {
		const listOfTasksInColumns = [[], []]

		const result = addChangeToEachTaskInList({
			listOfTasksInColumns,
			taskListIndex: 1,
			columnName: 'Procesando',
		})

		expect(result).toEqual(listOfTasksInColumns)
		expect(result[1]).toHaveLength(0)
	})

	test('No modifica la lista de tareas original (hay inmutabilidad).', () => {
		const taskList = Array(5)
			.fill(null)
			.map(() => ({ ...emptyTask }))
		const listOfTasksInColumns = [[], [...taskList]]

		const originalList = structuredClone(listOfTasksInColumns)

		const result = addChangeToEachTaskInList({
			listOfTasksInColumns,
			taskListIndex: 1,
			columnName: 'Procesando',
		})

		expect(result).not.toBe(listOfTasksInColumns)
		expect(listOfTasksInColumns).toEqual(originalList)
		expect(result[1]).not.toBe(listOfTasksInColumns[1])
	})
})
