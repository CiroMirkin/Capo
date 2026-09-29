'use server'

import { prisma } from '@/shared/lib/prisma'
import { isValidScene } from '../../model/whiteboard'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import BusinessError from '@/shared/errors/businessError'

export async function saveWhiteboard({
	boardId,
	scene,
}: {
	boardId: string
	scene: unknown
}): Promise<void> {
	await requireBoardAccess(boardId)

	if (!isValidScene(scene)) {
		throw new BusinessError('Pizarra inválida o mayor a 1MB.')
	}

	await prisma.whiteboard.upsert({
		where: { boardId },
		create: {
			boardId,
			scene: scene as object,
		},
		update: {
			scene: scene as object,
		},
	})
}
