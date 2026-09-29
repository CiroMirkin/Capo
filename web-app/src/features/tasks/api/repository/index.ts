import type { SessionType } from '@/features/auth'
import { TaskBoard } from '@/features/tasks/model/taskBoard'
import { TaskListInEachColumnRepository } from './taskListInEachColumnRepository'
import LocalStorageTaskListInEachColumnRepository from './localStorageTaskListsRepository'
import NextjsTaskListInEachColumnRepository from './nextjsTaskListRepository'

const getTaskBoardRepository = (session: SessionType): TaskListInEachColumnRepository => {
	if (session) {
		return new NextjsTaskListInEachColumnRepository()
	}
	return new LocalStorageTaskListInEachColumnRepository()
}

export const fetchTaskBoard = async (session: SessionType, boardId: string): Promise<TaskBoard> => {
	const repository = getTaskBoardRepository(session)
	return repository.getAll(boardId)
}

export const saveTaskBoard = async ({
	taskBoard,
	previous,
	session,
	boardId,
}: {
	taskBoard: TaskBoard
	previous: TaskBoard
	session: SessionType
	boardId: string
}): Promise<void> => {
	const repository = getTaskBoardRepository(session)
	await repository.save(taskBoard, boardId, previous)
}
