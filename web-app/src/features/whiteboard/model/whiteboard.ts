export interface StoredAppState {
	gridModeEnabled?: boolean
}

export interface WhiteboardScene {
	elements: readonly unknown[]
	appState?: StoredAppState
}

export const defaultScene: WhiteboardScene = { elements: [] }
export const MAX_SCENE_BYTES = 1_000_000

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

/** @returns True si tiene forma `{ elements: unknown[], appState?: object }` y pesa hasta 1 MB serializada. */
export const isValidScene = (scene: unknown): scene is WhiteboardScene => {
	if (!isPlainObject(scene) || !Array.isArray(scene.elements)) {
		return false
	}
	if (scene.appState !== undefined && !isPlainObject(scene.appState)) {
		return false
	}
	return new TextEncoder().encode(JSON.stringify(scene)).length <= MAX_SCENE_BYTES
}

/** Arma lo que se guarda desde lo que entrega Excalidraw en onChange. */
export const toStoredScene = <T extends { isDeleted?: boolean }>(
	elements: readonly T[],
	appState: StoredAppState
): WhiteboardScene => ({
	// Excalidraw conserva los borrados (isDeleted) para undo y no los guardamos porque engordaria la escena.
	elements: elements.filter((element) => !element.isDeleted),
	appState: {
		gridModeEnabled: appState.gridModeEnabled,
	},
})
