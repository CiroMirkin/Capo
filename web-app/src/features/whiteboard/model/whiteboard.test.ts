import { describe, it, expect } from 'vitest'
import { isValidScene, toStoredScene, MAX_SCENE_BYTES } from './whiteboard'

describe('isValidScene', () => {
	it('acepta { elements } con o sin appState', () => {
		expect(isValidScene({ elements: [] })).toBe(true)
		expect(isValidScene({ elements: [{ id: 'a' }], appState: { gridModeEnabled: true } })).toBe(
			true
		)
	})

	it('rechaza formas inválidas', () => {
		expect(isValidScene(null)).toBe(false)
		expect(isValidScene('scene')).toBe(false)
		expect(isValidScene({})).toBe(false)
		expect(isValidScene({ elements: 'x' })).toBe(false)
		expect(isValidScene({ elements: [], appState: 'x' })).toBe(false)
		expect(isValidScene({ elements: [], appState: [] })).toBe(false)
	})

	it('rechaza escenas de más de 1 MB serializadas', () => {
		const big = { elements: [{ text: 'x'.repeat(MAX_SCENE_BYTES) }] }
		expect(isValidScene(big)).toBe(false)
	})
})

describe('toStoredScene', () => {
	it('guarda solo el subconjunto de appState y descarta elementos borrados', () => {
		const appState = {
			viewBackgroundColor: '#fff',
			gridModeEnabled: true,
			zoom: { value: 2 },
			scrollX: 10,
		}
		const scene = toStoredScene(
			[
				{ id: 'a', isDeleted: false },
				{ id: 'b', isDeleted: true },
			],
			appState
		)
		expect(scene).toEqual({
			elements: [{ id: 'a', isDeleted: false }],
			// El fondo es el del tablero: viewBackgroundColor no se persiste.
			appState: { gridModeEnabled: true },
		})
	})
})
