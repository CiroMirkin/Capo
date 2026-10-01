import { describe, it, expect, vi } from 'vitest'
import type { SnapshotSource } from './dataSource'
import { Repository, SnapshotRepository } from './repository'

/** Prueba que el repositorio no depende de localStorage ni del server. */
const inMemorySource = <T, O = void>(initial: Record<string, T> = {}) => {
	const data = { ...initial }
	return {
		data,
		read: vi.fn(async (boardId: string) => data[boardId] ?? null),
		write: vi.fn(async (boardId: string, value: T) => {
			data[boardId] = value
		}),
	} satisfies SnapshotSource<T, O> & { data: Record<string, T> }
}

describe('Repository', () => {
	it('devuelve lo que tiene la fuente para ese board', async () => {
		const repository = new Repository(inMemorySource({ b1: 'hola' }), () => 'vacío')
		expect(await repository.getAll('b1')).toBe('hola')
	})

	it('devuelve el fallback si la fuente no tiene nada', async () => {
		const repository = new Repository(inMemorySource<string>(), () => 'vacío')
		expect(await repository.getAll('b1')).toBe('vacío')
	})
})

describe('SnapshotRepository', () => {
	it('save escribe en la fuente inyectada y getAll lo lee de vuelta', async () => {
		const source = inMemorySource<string[]>()
		const repository = new SnapshotRepository(source, () => [])

		await repository.save(['a', 'b'], 'b1')

		expect(source.data.b1).toEqual(['a', 'b'])
		expect(await repository.getAll('b1')).toEqual(['a', 'b'])
		expect(await repository.getAll('b2')).toEqual([])
	})

	it('pasa las opciones de la llamada a la fuente', async () => {
		const source = inMemorySource<string, { allowEmpty?: boolean }>()
		const repository = new SnapshotRepository<string, { allowEmpty?: boolean }>(
			source,
			() => ''
		)

		await repository.save('', 'b1', { allowEmpty: true })

		expect(source.write).toHaveBeenCalledWith('b1', '', { allowEmpty: true })
	})
})
