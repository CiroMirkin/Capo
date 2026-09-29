import { describe, it, expect, beforeEach } from 'vitest'
import LocalStorageWhiteboardRepository from './LocalStorageWhiteboardRepository'
import { defaultScene } from '../../model/whiteboard'

describe('LocalStorageWhiteboardRepository', () => {
	beforeEach(() => localStorage.clear())

	it('devuelve la escena vacía si no hay nada guardado', async () => {
		expect(await new LocalStorageWhiteboardRepository().get()).toEqual(defaultScene)
	})

	it('devuelve la escena vacía si lo guardado está corrupto', async () => {
		localStorage.setItem('capo-whiteboard', '{no es json')
		expect(await new LocalStorageWhiteboardRepository().get()).toEqual(defaultScene)
	})

	it('lee lo que guardó, en la clave capo-whiteboard', async () => {
		const scene = {
			elements: [{ id: 'r1', type: 'rectangle' }],
			appState: { gridModeEnabled: true },
		}
		const repository = new LocalStorageWhiteboardRepository()

		await repository.save(scene)

		expect(localStorage.getItem('capo-whiteboard')).not.toBeNull()
		expect(await repository.get()).toEqual(scene)
	})
})
