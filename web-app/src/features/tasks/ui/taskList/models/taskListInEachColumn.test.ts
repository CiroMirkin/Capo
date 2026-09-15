import {
	getChildrenOfTaskInBoard,
	isTaskReadyToArchiveIndividually,
	splitLastColumnByArchiveReadiness,
} from './taskListInEachColumn'
import { expect } from 'vitest'

const parent = { id: 'p1', descriptionText: 'padre' }
const child1 = { id: 'c1', descriptionText: 'hija 1', parentId: 'p1' }
const child2 = { id: 'c2', descriptionText: 'hija 2', parentId: 'p1' }
const other = { id: 'o1', descriptionText: 'otra tarea' }

describe('getChildrenOfTaskInBoard', () => {
	test('Encuentra las hijas de un padre en cualquier columna.', () => {
		const taskListInEachColumn = [[child1], [parent, other], [child2]]
		expect(getChildrenOfTaskInBoard(taskListInEachColumn, 'p1')).toStrictEqual([child1, child2])
	})

	test('Devuelve vacío si no hay hijas.', () => {
		expect(getChildrenOfTaskInBoard([[parent], [other]], 'p1')).toStrictEqual([])
	})
})

describe('isTaskReadyToArchiveIndividually', () => {
	test('Una hija siempre está lista.', () => {
		const taskListInEachColumn = [[child1], [parent]]
		expect(isTaskReadyToArchiveIndividually(taskListInEachColumn, child1)).toBe(true)
	})

	test('Un padre con hijas en el tablero no está listo.', () => {
		const taskListInEachColumn = [[child1], [parent]]
		expect(isTaskReadyToArchiveIndividually(taskListInEachColumn, parent)).toBe(false)
	})

	test('Un padre sin hijas en el tablero está listo.', () => {
		const taskListInEachColumn = [[other], [parent]]
		expect(isTaskReadyToArchiveIndividually(taskListInEachColumn, parent)).toBe(true)
	})
})

describe('splitLastColumnByArchiveReadiness', () => {
	test('Saltea a los padres incompletos y deja pasar al resto de la columna.', () => {
		const taskListInEachColumn = [[child1], [parent, other]]
		expect(splitLastColumnByArchiveReadiness(taskListInEachColumn, 1)).toStrictEqual({
			ready: [other],
			notReady: [parent],
		})
	})

	test('Si no hay padres incompletos, todo queda listo.', () => {
		const taskListInEachColumn = [[], [other, child1]]
		expect(splitLastColumnByArchiveReadiness(taskListInEachColumn, 1)).toStrictEqual({
			ready: [other, child1],
			notReady: [],
		})
	})
})
