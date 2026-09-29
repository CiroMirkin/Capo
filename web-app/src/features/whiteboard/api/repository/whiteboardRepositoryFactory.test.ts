import { describe, it, expect, beforeEach } from 'vitest'
import { whiteboardRepositoryFactory } from './whiteboardRepositoryFactory'
import { defaultScene } from '../../model/whiteboard'

// Sin sesión el factory usa la fuente de localStorage
const guestRepository = () => whiteboardRepositoryFactory(null)

describe('whiteboardRepositoryFactory (invitado)', () => {
	beforeEach(() => localStorage.clear())

	it('devuelve la escena vacía si no hay nada guardado', async () => {
		expect(await guestRepository().getAll('b1')).toEqual(defaultScene)
	})

	it('devuelve la escena vacía si lo guardado está corrupto', async () => {
		localStorage.setItem('capo-whiteboard', '{no es json')
		expect(await guestRepository().getAll('b1')).toEqual(defaultScene)
	})

	it('devuelve la escena vacía si lo guardado no es una escena válida', async () => {
		localStorage.setItem('capo-whiteboard', JSON.stringify({ elements: 'nope' }))
		expect(await guestRepository().getAll('b1')).toEqual(defaultScene)
	})

	it('lee lo que guardó, en la clave capo-whiteboard', async () => {
		const scene = {
			elements: [{ id: 'r1', type: 'rectangle' }],
			appState: { gridModeEnabled: true },
		}
		const repository = guestRepository()

		await repository.save(scene, 'b1')

		expect(localStorage.getItem('capo-whiteboard')).not.toBeNull()
		expect(await repository.getAll('b1')).toEqual(scene)
	})
})
