'use server'

import { prisma } from '@/shared/lib/prisma'
import {
	defaultAvialableTags,
	emptyTagGroup,
	type TagGroup,
	type AvailableTags,
} from '../../model/tags'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function getActiveTagGroup({
	boardId,
}: {
	boardId: string
}): Promise<{ actualTagGroup: TagGroup; tags: AvailableTags }> {
	await requireBoardAccess(boardId)

	const [board, availableTagGroups] = await Promise.all([
		prisma.board.findUnique({
			where: { id: boardId },
			select: {
				activeTagGroup: { select: { id: true, tags: true } },
			},
		}),
		prisma.tagGroup.findMany({
			select: { id: true, tags: true },
		}),
	])

	const tags: AvailableTags =
		availableTagGroups.length > 0
			? availableTagGroups.map((g) => ({
					id: g.id,
					tags: g.tags as unknown as TagGroup['tags'],
				}))
			: defaultAvialableTags

	if (board?.activeTagGroup) {
		return {
			actualTagGroup: {
				id: board.activeTagGroup.id,
				tags: board.activeTagGroup.tags as unknown as TagGroup['tags'],
			},
			tags,
		}
	}

	return { actualTagGroup: emptyTagGroup, tags }
}
