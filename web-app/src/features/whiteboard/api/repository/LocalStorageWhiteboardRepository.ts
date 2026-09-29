import { defaultScene, isValidScene, WhiteboardScene } from '../../model/whiteboard'
import { WhiteboardRepository } from './whiteboardRepository'

export default class LocalStorageWhiteboardRepository implements WhiteboardRepository {
	key
	constructor() {
		this.key = 'capo-whiteboard'
	}
	async save(scene: WhiteboardScene): Promise<void> {
		localStorage.setItem(this.key, JSON.stringify(scene))
	}
	async get(): Promise<WhiteboardScene> {
		const raw = localStorage.getItem(this.key)
		if (!raw) return defaultScene
		try {
			const parsed = JSON.parse(raw)
			return isValidScene(parsed) ? parsed : defaultScene
		} catch {
			return defaultScene
		}
	}
}
