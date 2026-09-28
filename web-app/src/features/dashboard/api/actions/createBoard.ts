'use server'

import { prisma } from '@/shared/lib/prisma'
import i18next from '@/shared/i18n/server'
import { requireAuth } from '@/shared/lib/serverAuth'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'
import { MAX_COLUMNS, isThisColumnNameValid } from '@/features/tasks/model/taskColumn'
import { HERO_COUNT } from '../../model/heros'
import { MAX_BOARDS } from '../../model/board'

export interface CreateBoardInput {
	name: string
	/** Nombres en orden. Las claves de `DEFAULT_COLUMN_IDS` se guardan tal cual y se traducen en el cliente. */
	columns?: string[]
	themeId?: string
	cardCanvas?: number
}

export async function createBoard({
	name,
	columns = DEFAULT_COLUMN_IDS,
	themeId,
	cardCanvas = Math.floor(Math.random() * HERO_COUNT),
}: CreateBoardInput): Promise<void> {
	const userId = await requireAuth()

	if (!name.trim()) throw new Error(i18next.t('dashboard.board_name_required'))
	if (name.length <= 2 || name.length >= 15) {
		throw new Error(i18next.t('dashboard.board_name_length_error'))
	}

	if (columns.length < 1 || columns.length > MAX_COLUMNS) {
		throw new Error(i18next.t('dashboard.columns_count_error', { max: MAX_COLUMNS }))
	}
	columns.forEach(isThisColumnNameValid)

	if (!Number.isInteger(cardCanvas) || cardCanvas < 0 || cardCanvas >= HERO_COUNT) {
		throw new Error('Índice de canvas inválido')
	}

	const count = await prisma.board.count({ where: { userId } })
	if (count >= MAX_BOARDS) {
		throw new Error(i18next.t('dashboard.board_limit_error', { max: MAX_BOARDS }))
	}

	await prisma.$transaction(async (tx) => {
		const board = await tx.board.create({
			data: {
				name,
				userId,
				cardCanvas,
				...(themeId && { themeId }),
			},
		})

		await tx.column.createMany({
			data: columns.map((name, order) => ({
				name: name.trim(),
				order,
				boardId: board.id,
			})),
		})

		await tx.note.create({
			data: {
				boardId: board.id,
				content: '',
			},
		})
		await tx.reminder.create({
			data: {
				boardId: board.id,
				data: { columnPosition: '', text: '' },
			},
		})
		await tx.archive.create({
			data: {
				boardId: board.id,
			},
		})
	})
}
