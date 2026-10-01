import { describe, it, expect, beforeEach } from 'vitest'
import { LocalStorageDataSource } from './localStorageDataSource'

describe('LocalStorageDataSource', () => {
	beforeEach(() => localStorage.clear())

	it('devuelve null si no hay nada guardado', async () => {
		expect(await new LocalStorageDataSource({ key: 'k' }).read('b1')).toBeNull()
	})

	it('devuelve null si lo guardado está corrupto', async () => {
		localStorage.setItem('k', '{no es json')
		expect(await new LocalStorageDataSource({ key: 'k' }).read('b1')).toBeNull()
	})

	it('con key fija ignora el board', async () => {
		const source = new LocalStorageDataSource<number[]>({ key: 'k' })

		await source.write('b1', [1, 2])

		expect(localStorage.getItem('k')).toBe('[1,2]')
		expect(await source.read('b2')).toEqual([1, 2])
	})

	it('con key por board guarda uno por board', async () => {
		const source = new LocalStorageDataSource<number[]>({ key: (boardId) => `x-${boardId}` })

		await source.write('b1', [1])

		expect(localStorage.getItem('x-b1')).toBe('[1]')
		expect(await source.read('b2')).toBeNull()
	})

	it('serialize y parse envuelven y validan lo guardado', async () => {
		const source = new LocalStorageDataSource<string>({
			key: 'k',
			serialize: (notes) => ({ notes }),
			parse: (raw) =>
				typeof (raw as { notes?: unknown })?.notes === 'string'
					? (raw as { notes: string }).notes
					: null,
		})

		await source.write('b1', 'hola')
		expect(localStorage.getItem('k')).toBe('{"notes":"hola"}')
		expect(await source.read('b1')).toBe('hola')

		localStorage.setItem('k', '{"notes":3}')
		expect(await source.read('b1')).toBeNull()
	})
})
