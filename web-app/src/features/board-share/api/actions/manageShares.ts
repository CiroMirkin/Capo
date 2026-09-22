'use server'

import { randomBytes } from 'node:crypto'
import { prisma } from '@/shared/lib/prisma'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { assertCanAddEmailShare, normalizeEmail, type BoardShare } from '../../model/boardShare'

/* Acciones del dueño del tablero sobre sus links compartidos. */

const newToken = () => randomBytes(24).toString('base64url')

const shareSelect = { id: true, mode: true, token: true, recipientEmail: true, active: true }

export async function getBoardShares({ boardId }: { boardId: string }): Promise<BoardShare[]> {
	await requireBoardAccess(boardId)
	return prisma.boardShare.findMany({
		where: { boardId },
		orderBy: { createdAt: 'asc' },
		select: shareSelect,
	})
}

export async function addEmailShare({ boardId, email }: { boardId: string; email: string }) {
	await requireBoardAccess(boardId)
	const shares = await prisma.boardShare.findMany({ where: { boardId }, select: shareSelect })
	assertCanAddEmailShare(shares, email)

	await prisma.boardShare.create({
		data: { boardId, mode: 'EMAIL', recipientEmail: normalizeEmail(email), token: newToken() },
	})
}

/** Hay a lo sumo un link público por tablero: si ya existe, solo se reactiva (mismo token). */
export async function enablePublicShare({ boardId }: { boardId: string }) {
	await requireBoardAccess(boardId)
	const existing = await prisma.boardShare.findFirst({ where: { boardId, mode: 'PUBLIC' } })
	if (existing) {
		await prisma.boardShare.update({ where: { id: existing.id }, data: { active: true } })
		return
	}
	await prisma.boardShare.create({ data: { boardId, mode: 'PUBLIC', token: newToken() } })
}

export async function setShareActive({
	boardId,
	shareId,
	active,
}: {
	boardId: string
	shareId: string
	active: boolean
}) {
	await requireBoardAccess(boardId)
	await prisma.boardShare.update({ where: { id: shareId, boardId }, data: { active } })
}

/** Para un link filtrado: el token viejo deja de funcionar. */
export async function regenerateShareToken({
	boardId,
	shareId,
}: {
	boardId: string
	shareId: string
}) {
	await requireBoardAccess(boardId)
	await prisma.boardShare.update({ where: { id: shareId, boardId }, data: { token: newToken() } })
}

export async function deleteShare({ boardId, shareId }: { boardId: string; shareId: string }) {
	await requireBoardAccess(boardId)
	await prisma.boardShare.delete({ where: { id: shareId, boardId } })
}
