'use server'

import { prisma } from '@/shared/lib/prisma'
import {
	MAX_CUSTOM_TAGS,
	MAX_TAG_NAME_LENGTH,
	MAX_TAG_PRIORITY,
	MIN_TAG_PRIORITY,
	type Tag,
} from '../../model/tags'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

export async function saveCustomTagGroup({
	boardId,
	tags,
}: {
	boardId: string
	tags: Tag[]
}): Promise<void> {
	await requireBoardAccess(boardId)

	if (tags.length > MAX_CUSTOM_TAGS) {
		throw new Error(`No podés tener más de ${MAX_CUSTOM_TAGS} etiquetas propias`)
	}

	for (const tag of tags) {
		if (!tag.name.trim() || tag.name.length > MAX_TAG_NAME_LENGTH) {
			throw new Error(
				`El nombre de la etiqueta debe tener hasta ${MAX_TAG_NAME_LENGTH} caracteres`
			)
		}
		if (
			tag.priority !== undefined &&
			(tag.priority < MIN_TAG_PRIORITY || tag.priority > MAX_TAG_PRIORITY)
		) {
			throw new Error(
				`La prioridad debe estar entre ${MIN_TAG_PRIORITY} y ${MAX_TAG_PRIORITY}`
			)
		}
	}

	await prisma.$transaction(async (tx) => {
		const customTagGroup = await tx.tagGroup.upsert({
			where: { boardId },
			create: { boardId, name: '', tags: tags as object },
			update: { tags: tags as object },
		})

		// Los tags propios del usuario se activan solos: no tiene sentido crear
		// una etiqueta y tener que ir a buscarla a "Etiquetas disponibles".
		await tx.board.update({
			where: { id: boardId },
			data: { activeTagGroupId: customTagGroup.id },
		})
	})
}
