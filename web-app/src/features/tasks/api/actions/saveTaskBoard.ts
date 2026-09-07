'use server'

import { prisma } from '@/shared/lib/prisma'
import { DEFAULT_COLUMN_IDS, type TaskBoard } from '@/features/tasks/model/taskBoard'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

// DEFAULT_COLUMN_IDS son los IDs placeholder de emptyTaskBoard — se resuelven a filas reales por posición.

/**
 * Full-sync: upserts all columns and tasks from a TaskBoard snapshot.
 * Columns not in the new snapshot are deleted (cascade deletes their tasks).
 * Tasks not in a column are deleted.
 */
export async function saveTaskBoard({
	boardId,
	taskBoard,
}: {
	boardId: string
	taskBoard: TaskBoard
}): Promise<void> {
	await requireBoardAccess(boardId)

	await prisma.$transaction(async (tx) => {
		// Reject client-supplied IDs that belong to another user's board.
		const incomingColumnIds = taskBoard
			.map((c) => c.id)
			.filter((id) => id && !DEFAULT_COLUMN_IDS.includes(id))
		const incomingTaskIds = taskBoard.flatMap((c) => c.tasks.map((t) => t.id)).filter(Boolean)

		const [foreignColumn, foreignTask] = await Promise.all([
			tx.column.findFirst({
				where: { id: { in: incomingColumnIds }, boardId: { not: boardId } },
				select: { id: true },
			}),
			tx.task.findFirst({
				where: { id: { in: incomingTaskIds }, column: { boardId: { not: boardId } } },
				select: { id: true },
			}),
		])
		if (foreignColumn || foreignTask) throw new Error('No autorizado')

		// Upsert columns and their tasks, tracking the real column IDs we keep.
		const persistedColumnIds: string[] = []

		for (let i = 0; i < taskBoard.length; i++) {
			const col = taskBoard[i]

			let realColumnId: string
			if (DEFAULT_COLUMN_IDS.includes(col.id)) {
				// Placeholder ID from emptyTaskBoard — match the existing column by position.
				const existing = await tx.column.findFirst({ where: { boardId, order: i } })
				if (existing) {
					await tx.column.update({
						where: { id: existing.id },
						data: { name: col.status, order: i },
					})
					realColumnId = existing.id
				} else {
					const created = await tx.column.create({
						data: { name: col.status, order: i, boardId },
					})
					realColumnId = created.id
				}
			} else {
				await tx.column.upsert({
					where: { id: col.id },
					create: { id: col.id, name: col.status, order: i, boardId },
					update: { name: col.status, order: i },
				})
				realColumnId = col.id
			}
			persistedColumnIds.push(realColumnId)

			const columnTaskIds = col.tasks.map((t) => t.id)

			// Delete tasks removed from this column
			await tx.task.deleteMany({
				where: { columnId: realColumnId, id: { notIn: columnTaskIds } },
			})

			// Upsert tasks
			for (const task of col.tasks) {
				await tx.task.upsert({
					where: { id: task.id },
					create: {
						id: task.id,
						descriptionText: task.descriptionText,
						columnId: realColumnId,
						dueDate: task.dueDate ?? undefined,
						tags: (task.tags as object) ?? undefined,
						notesAndComments: task.notesAndComments ?? undefined,
						timelineHistory: (task.timelineHistory as object) ?? undefined,
					},
					update: {
						descriptionText: task.descriptionText,
						columnId: realColumnId,
						dueDate: task.dueDate ?? undefined,
						tags: (task.tags as object) ?? undefined,
						notesAndComments: task.notesAndComments ?? undefined,
						timelineHistory: (task.timelineHistory as object) ?? undefined,
					},
				})
			}
		}

		// Delete columns that were removed from the board (cascade deletes their tasks).
		await tx.column.deleteMany({
			where: { boardId, id: { notIn: persistedColumnIds } },
		})
	})
}
