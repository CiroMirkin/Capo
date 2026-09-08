'use server'

import { prisma } from '@/shared/lib/prisma'
import type { Board } from '../../model/board'
import { requireAuth } from '@/shared/lib/serverAuth'

export async function getBoards(): Promise<Board[]> {
	const userId = await requireAuth()
	const boards = await prisma.board.findMany({
		where: { userId },
		orderBy: { createdAt: 'asc' },
		select: {
			id: true,
			name: true,
			createdAt: true,
			cardCanvas: true,
			themeId: true,
		},
	})

	return boards.map((b) => ({
		id: b.id,
		name: b.name,
		date: b.createdAt,
		cardCanvas: b.cardCanvas,
		themeId: b.themeId,
	}))
}
