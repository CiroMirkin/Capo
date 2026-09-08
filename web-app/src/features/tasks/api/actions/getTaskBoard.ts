'use server'

import { prisma } from '@/shared/lib/prisma'
import type { TaskBoard } from '@/features/tasks/model/taskBoard'
import type { taskModel } from '@/features/tasks/model/task'
import { requireBoardAccess } from '@/shared/lib/serverAuth'

/**
 * Returns the board as a TaskBoard (TaskColumn[]) shape expected by the client.
 * Columns are ordered by `order`; tasks by `order` (persisted position), then `createdAt`.
 */
export async function getTaskBoard({ boardId }: { boardId: string }): Promise<TaskBoard> {
	await requireBoardAccess(boardId)

	const columns = await prisma.column.findMany({
		where: { boardId },
		orderBy: { order: 'asc' },
		include: {
			tasks: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
		},
	})

	return columns.map((col) => ({
		id: col.id,
		status: col.name,
		tasks: col.tasks.map((t) => ({
			id: t.id,
			descriptionText: t.descriptionText,
			dueDate: t.dueDate ?? undefined,
			tags: (t.tags as unknown as taskModel['tags']) ?? undefined,
			notesAndComments: t.notesAndComments ?? undefined,
			timelineHistory:
				(t.timelineHistory as unknown as taskModel['timelineHistory']) ?? undefined,
		})),
	}))
}
