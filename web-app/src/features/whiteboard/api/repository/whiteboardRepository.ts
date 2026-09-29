import { WhiteboardScene } from '../../model/whiteboard'

export interface WhiteboardRepository {
	save(scene: WhiteboardScene, boardId: string): Promise<void>
	get(boardId: string): Promise<WhiteboardScene>
}
