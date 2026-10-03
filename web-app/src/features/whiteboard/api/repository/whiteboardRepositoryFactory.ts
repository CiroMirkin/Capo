import type { SessionType } from '@/features/auth'
import {
	bySession,
	LocalStorageDataSource,
	ServerActionDataSource,
	SnapshotRepository,
} from '@/shared/repository'
import { defaultScene, isValidScene, WhiteboardScene } from '../../model/whiteboard'

const local = () =>
	new LocalStorageDataSource<WhiteboardScene>({
		key: 'capo-whiteboard',
		parse: (raw) => (isValidScene(raw) ? raw : null),
	})

const server = () =>
	new ServerActionDataSource<WhiteboardScene>({
		read: async (boardId) =>
			(await import('../actions/getWhiteboard')).getWhiteboard({ boardId }),
		write: async (boardId, scene) => {
			const { saveWhiteboard } = await import('../actions/saveWhiteboard')
			await saveWhiteboard({ boardId, scene })
		},
	})

export const whiteboardRepositoryFactory = (session: SessionType) =>
	new SnapshotRepository(bySession(session, { server, local }), () => defaultScene)
