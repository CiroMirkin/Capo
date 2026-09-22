'use server'

import type { TaskBoard } from '@/features/tasks/model/taskBoard'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { readTaskBoard } from '../readTaskBoard'

export async function getTaskBoard({ boardId }: { boardId: string }): Promise<TaskBoard> {
	await requireBoardAccess(boardId)
	return readTaskBoard(boardId)
}
