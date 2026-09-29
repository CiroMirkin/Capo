import type { SessionType } from '@/features/auth'
import LocalStorageWhiteboardRepository from './LocalStorageWhiteboardRepository'
import NextjsWhiteboardRepository from './nextjsWhiteboardRepository'
import { WhiteboardRepository } from './whiteboardRepository'

export const whiteboardRepositoryFactory = (session: SessionType): WhiteboardRepository => {
	if (session) {
		return new NextjsWhiteboardRepository()
	}
	return new LocalStorageWhiteboardRepository()
}
