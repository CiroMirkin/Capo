'use server'

import { prisma } from '@/shared/lib/prisma'
import type { Limbo } from '@/features/limbo/model/limbo'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function saveLimbo({
	boardId,
	tasks,
}: {
	boardId: string
	tasks: Limbo
}): Promise<void> {
	await requireBoardAccess(boardId)

	await prisma.limbo.upsert({
		where: { boardId },
		create: { boardId, tasks: tasks as object[] },
		update: { tasks: tasks as object[] },
	})
}
