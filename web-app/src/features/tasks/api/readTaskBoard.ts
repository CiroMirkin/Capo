import 'server-only'
import { prisma } from '@/shared/lib/prisma'
import type { TaskBoard } from '@/features/tasks/model/taskBoard'
import type { taskModel } from '@/features/tasks/model/task'

/**
 * Lee el tablero como TaskBoard (TaskColumn[]), SIN chequear acceso: el caller lo hace.
 * Columns are ordered by `order`; tasks by `order` (persisted position), then `createdAt`.
 */
export async function readTaskBoard(boardId: string): Promise<TaskBoard> {
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
			parentId: t.parentId ?? undefined,
		})),
	}))
}
