import type { SessionType } from '@/features/auth'
import { Tag } from '../../model/tags'
import LocalStorageCustomTagRepository from './localstorageCustomTagRepository'
import NextjsCustomTagRepository from './nextjsCustomTagRepository'
import { CustomTagRepository } from './customTagRepository'

const getCustomTagRepository = (session: SessionType): CustomTagRepository => {
	if (session) {
		return new NextjsCustomTagRepository()
	}
	return new LocalStorageCustomTagRepository()
}

export const fetchCustomTags = async (session: SessionType, boardId: string): Promise<Tag[]> => {
	const repository = getCustomTagRepository(session)
	return repository.get(boardId)
}

export const saveCustomTags = async ({
	session,
	boardId,
	tags,
}: {
	session: SessionType
	boardId: string
	tags: Tag[]
}): Promise<void> => {
	const repository = getCustomTagRepository(session)
	await repository.save(boardId, tags)
}
