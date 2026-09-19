'use server'

import { prisma } from '@/shared/lib/prisma'
import type { Notes } from '../../model/notes'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import BusinessError from '@/shared/errors/businessError'

export async function saveNotes({
	boardId,
	notes,
	allowEmpty = false,
}: {
	boardId: string
	notes: Notes
	allowEmpty?: boolean
}): Promise<void> {
	await requireBoardAccess(boardId)

	if (!allowEmpty && notes.trim() === '') {
		const existing = await prisma.note.findUnique({ where: { boardId } })
		if (existing && existing.content.trim() !== '') {
			throw new BusinessError('No se pueden vaciar notas existentes sin confirmar.')
		}
	}

	await prisma.note.upsert({
		where: { boardId },
		create: { boardId, content: notes },
		update: { content: notes },
	})
}
