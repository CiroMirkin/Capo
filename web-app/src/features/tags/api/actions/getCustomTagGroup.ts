'use server'

import { prisma } from '@/shared/lib/prisma'
import { type TagGroup } from '../../model/tags'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function getCustomTagGroup({
	boardId,
}: {
	boardId: string
}): Promise<TagGroup | null> {
	await requireBoardAccess(boardId)

	const customTagGroup = await prisma.tagGroup.findUnique({
		where: { boardId },
		select: { id: true, tags: true },
	})

	if (!customTagGroup) return null

	return {
		id: customTagGroup.id,
		tags: customTagGroup.tags as unknown as TagGroup['tags'],
	}
}
