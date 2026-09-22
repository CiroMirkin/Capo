'use server'

import { prisma } from '@/shared/lib/prisma'
import { getSessionUser } from '@/shared/lib/serverAuth'
import { normalizeEmail } from '../../model/boardShare'

export interface SharedWithMeBoard {
	token: string
	name: string
	cardCanvas: number
	themeId: string
}

/** Tableros compartidos por email con la cuenta logueada (aparecen sin necesitar el link). */
export async function getBoardsSharedWithMe(): Promise<SharedWithMeBoard[]> {
	const user = await getSessionUser()
	if (!user?.email) return []

	const shares = await prisma.boardShare.findMany({
		where: {
			mode: 'EMAIL',
			active: true,
			recipientEmail: normalizeEmail(user.email),
			board: { userId: { not: user.id } },
		},
		orderBy: { createdAt: 'asc' },
		select: {
			token: true,
			board: { select: { name: true, cardCanvas: true, themeId: true } },
		},
	})

	return shares.map(({ token, board }) => ({ token, ...board }))
}
