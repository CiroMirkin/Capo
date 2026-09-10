'use server'

import { prisma } from '@/shared/lib/prisma'
import type { Limbo } from '@/features/limbo/model/limbo'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function getLimbo({ boardId }: { boardId: string }): Promise<Limbo> {
	await requireBoardAccess(boardId)

	const limbo = await prisma.limbo.findUnique({ where: { boardId } })
	return (limbo?.tasks as unknown as Limbo) ?? []
}
