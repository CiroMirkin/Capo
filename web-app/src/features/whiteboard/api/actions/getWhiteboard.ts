'use server'

import { prisma } from '@/shared/lib/prisma'
import { defaultScene, isValidScene, type WhiteboardScene } from '../../model/whiteboard'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function getWhiteboard({ boardId }: { boardId: string }): Promise<WhiteboardScene> {
	await requireBoardAccess(boardId)

	const whiteboard = await prisma.whiteboard.findUnique({ where: { boardId } })
	return isValidScene(whiteboard?.scene) ? whiteboard.scene : defaultScene
}
