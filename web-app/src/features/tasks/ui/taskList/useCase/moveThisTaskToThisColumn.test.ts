import { moveThisTaskToThisColumn } from './moveThisTaskToThisColumn'
describe('Mover una tarea determinada a una columna determinada.', () => {
	test('Mover una tarea desde la segunda columna hacia la tercer columna.', () => {
		const taskListInEachColumnDataInput = [
			[],
			[{ id: 'f4ec6bb9', descriptionText: 'cafe' }],
			[{ id: 'fbc5df48', descriptionText: 'cafe iwi' }],
		]
		const taskData = taskListInEachColumnDataInput[1][0]
		const taskListInEachColumnDataOutput = [
			[],
			[],
			[
				{ id: 'f4ec6bb9', descriptionText: 'cafe' },
				{ id: 'fbc5df48', descriptionText: 'cafe iwi' },
			],
		]

		expect(
			moveThisTaskToThisColumn({
				taskListOfColumns: taskListInEachColumnDataInput,
				task: taskData,
				newColumnPosition: '3',
			})
		).toEqual(taskListInEachColumnDataOutput)
	})

	test('Mover una tarea hacia una columna vacia.', () => {
		const taskListInEachColumnDataInput = [
			[{ id: 'f4ec6bb9', descriptionText: 'cafe' }],
			[],
			[],
		]
		const taskData = taskListInEachColumnDataInput[0][0]
		const taskListInEachColumnDataOutput = [
			[],
			[],
			[{ id: 'f4ec6bb9', descriptionText: 'cafe' }],
		]

		expect(
			moveThisTaskToThisColumn({
				taskListOfColumns: taskListInEachColumnDataInput,
				task: taskData,
				newColumnPosition: '3',
			})
		).toEqual(taskListInEachColumnDataOutput)
	})

	test('Mover una tarea multiples veces.', () => {
		const taskListInEachColumnDataInput = [
			[{ id: 'f4ec6bb9', descriptionText: 'cafe' }],
			[{ id: 'fbc5df48', descriptionText: 'cafe iwi' }],
			[],
		]
		const taskData = taskListInEachColumnDataInput[0][0]
		const taskListInEachColumnDataOutput = [
			[],
			[{ id: 'fbc5df48', descriptionText: 'cafe iwi' }],
			[{ id: 'f4ec6bb9', descriptionText: 'cafe' }],
		]

		const newInputData = moveThisTaskToThisColumn({
			taskListOfColumns: taskListInEachColumnDataInput,
			task: taskData,
			newColumnPosition: '2',
		})

		const newTaskData = newInputData[1][0]

		expect(
			moveThisTaskToThisColumn({
				taskListOfColumns: newInputData,
				task: newTaskData,
				newColumnPosition: '3',
			})
		).toEqual(taskListInEachColumnDataOutput)
	})

	// Bug: mover un padre a otra columna (ej. la última) lo sacaba de su
	// columna reusando `deleteThisTask`, que en cascada también borraba a sus
	// hijas — desaparecían del tablero en vez de quedarse donde estaban.
	test('Mover una tarea padre a otra columna no debería afectar a sus hijas.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const child = { id: 'c1', descriptionText: 'hija', parentId: 'p1' }
		const other = { id: 'o1', descriptionText: 'otra tarea' }
		const taskListInEachColumnDataInput = [[child], [parent], [other]]

		const result = moveThisTaskToThisColumn({
			taskListOfColumns: taskListInEachColumnDataInput,
			task: parent,
			newColumnPosition: '3',
		})

		expect(result).toEqual([[child], [], [parent, other]])
	})
})
