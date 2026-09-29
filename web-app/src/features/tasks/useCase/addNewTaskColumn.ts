import { TaskBoard } from '@/features/tasks/model/taskBoard'
import {
	getNewTaskColumn,
	isThisBoardWithinTheColumnLimit,
} from '@/features/tasks/model/taskColumn'
import BusinessError from '@/shared/errors/businessError'

interface addNewTaskColumnParams {
	taskBoard: TaskBoard
	status: string
}

export const addNewTaskColumn = ({ status, taskBoard }: addNewTaskColumnParams): TaskBoard => {
	if (!isThisBoardWithinTheColumnLimit(taskBoard.length + 1)) {
		throw new BusinessError('El tablero ya tiene el máximo de columnas permitido.')
	}

	const newTaskColumn = getNewTaskColumn(status)
	if (newTaskColumn) {
		return [...taskBoard, newTaskColumn]
	}
	return taskBoard
}
