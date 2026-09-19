'use server'

import { prisma } from '@/shared/lib/prisma'
import type { LibraryOfArchivedNotes } from '../../model/libraryOfArchivedNotes'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function saveArchivedNotes({
	boardId,
	notes,
}: {
	boardId: string
	notes: LibraryOfArchivedNotes
}): Promise<void> {
	await requireBoardAccess(boardId)

	const existing = await prisma.archive.findUnique({ where: { boardId } })
	const existingArchive = existing?.notes as unknown as LibraryOfArchivedNotes | null
	if (existingArchive && notes.archive.length < existingArchive.archive.length) {
		throw new Error('No se puede reducir el archivo de notas.')
	}

	await prisma.archive.upsert({
		where: { boardId },
		create: { boardId, notes: notes as object },
		update: { notes: notes as object },
	})
}
