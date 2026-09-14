import { getArchivedChildren, Archive } from './archive'
import { expect } from 'vitest'

describe('getArchivedChildren', () => {
	test('Encuentra las hijas de un padre archivadas en cualquier día.', () => {
		const parent = { id: 'p1', descriptionText: 'padre' }
		const child1 = { id: 'c1', descriptionText: 'hija 1', parentId: 'p1' }
		const child2 = { id: 'c2', descriptionText: 'hija 2', parentId: 'p1' }
		const other = { id: 'o1', descriptionText: 'otra tarea' }

		const archive: Archive = [
			{ date: 'hoy', tasklist: [parent, child1] },
			{ date: 'ayer', tasklist: [child2, other] },
		]

		expect(getArchivedChildren(archive, 'p1')).toStrictEqual([
			{ task: child1, date: 'hoy' },
			{ task: child2, date: 'ayer' },
		])
	})

	test('Devuelve vacío si el padre no tiene hijas archivadas.', () => {
		const archive: Archive = [{ date: 'hoy', tasklist: [{ id: 'o1', descriptionText: 'x' }] }]
		expect(getArchivedChildren(archive, 'p1')).toStrictEqual([])
	})
})
