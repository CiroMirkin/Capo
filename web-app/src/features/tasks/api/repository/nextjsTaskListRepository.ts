import { emptyTaskBoard, TaskBoard } from '@/features/tasks/model/taskBoard'
import { diffTaskBoard } from '@/features/tasks/model/taskBoardDiff'
import { TaskListInEachColumnRepository } from './taskListInEachColumnRepository'

export default class NextjsTaskListInEachColumnRepository
	implements TaskListInEachColumnRepository
{
	async getAll(boardId: string): Promise<TaskBoard> {
		const { getTaskBoard } = await import('../actions/getTaskBoard')
		const board = await getTaskBoard({ boardId })
		return board ?? emptyTaskBoard
	}

	async save(next: TaskBoard, boardId: string, previous: TaskBoard): Promise<void> {
		const changes = diffTaskBoard(previous, next)
		if (!changes.length) return
		const { applyTaskBoardChanges } = await import('../actions/applyTaskBoardChanges')
		await applyTaskBoardChanges({ boardId, changes })
	}
}
