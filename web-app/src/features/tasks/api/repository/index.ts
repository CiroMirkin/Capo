import type { SessionType } from '@/features/auth'
import { TaskBoard } from '@/features/tasks/model/taskBoard'
import { bySession, LocalStorageDataSource } from '@/shared/repository'
import {
	ServerTaskBoardSource,
	SnapshotTaskBoardSource,
	TaskBoardRepository,
} from './taskBoardRepository'

const local = () =>
	new SnapshotTaskBoardSource(
		new LocalStorageDataSource<TaskBoard>({ key: 'taskListInEachColumn' })
	)

const server = () => new ServerTaskBoardSource()

const getTaskBoardRepository = (session: SessionType) =>
	new TaskBoardRepository(bySession(session, { server, local }))

export const fetchTaskBoard = async (session: SessionType, boardId: string): Promise<TaskBoard> =>
	getTaskBoardRepository(session).getAll(boardId)

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
	await getTaskBoardRepository(session).save(taskBoard, boardId, previous)
}
