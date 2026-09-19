'use server'

import { prisma } from '@/shared/lib/prisma'
import type { UsageHistory } from '../../model/usageHistory'
import { migrateUsageHistory } from '../../model/usageHistory'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { foldSessionIntoHistory } from '../../model/foldSessionIntoHistory'
import { toOpenSession } from '../../model/currentUsageSession'

export async function getUsageHistory({ boardId }: { boardId: string }): Promise<UsageHistory> {
	await requireBoardAccess(boardId)

	const board = await prisma.board.findUnique({
		where: { id: boardId },
		select: {
			usageHistory: true,
			currentSessionStart: true,
			currentSessionEnd: true,
			currentSessionDuration: true,
			currentSessionDay: true,
		},
	})

	const history = migrateUsageHistory((board?.usageHistory as unknown as UsageHistory) ?? [])
	const openSession = board ? toOpenSession(board) : null
	if (!openSession || !board) return history

	// La sesión en curso todavía no se volcó a usageHistory (recién lo hace al cerrar)
	// La sesión se mezcla acá sin persistir para que la lectura esté al día
	return foldSessionIntoHistory({
		usageHistory: history,
		session: openSession,
		dayStart: Number(board.currentSessionDay),
	})
}
