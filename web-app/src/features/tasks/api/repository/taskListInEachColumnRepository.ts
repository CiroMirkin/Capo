import { TaskBoard } from '@/features/tasks/model/taskBoard'

export interface TaskListInEachColumnRepository {
	/** `previous`: el tablero antes del cambio, para que cada implementación guarde solo lo que necesite. */
	save(next: TaskBoard, boardId: string, previous: TaskBoard): Promise<void>
	getAll(boardId: string): Promise<TaskBoard>
}
