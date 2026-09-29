import { WhiteboardScene } from '../../model/whiteboard'
import { WhiteboardRepository } from './whiteboardRepository'

export default class NextjsWhiteboardRepository implements WhiteboardRepository {
	async save(scene: WhiteboardScene, boardId: string): Promise<void> {
		const { saveWhiteboard } = await import('../actions/saveWhiteboard')
		await saveWhiteboard({ boardId, scene })
	}

	async get(boardId: string): Promise<WhiteboardScene> {
		const { getWhiteboard } = await import('../actions/getWhiteboard')
		return getWhiteboard({ boardId })
	}
}
