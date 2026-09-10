import { addChangeToTaskTimelineHistory, taskModel } from '@/features/tasks'
import { LimboTask } from '../model/limboTask'

/** Convierte una `LimboTask` en tarea de tablero: saca x/y y anota el paso por el limbo. */
export const sendLimboTaskToBoard = ({
	task,
	movedFromLabel,
}: {
	task: LimboTask
	movedFromLabel: string
}): taskModel => {
	const boardTask: taskModel = {
		id: task.id,
		descriptionText: task.descriptionText,
		dueDate: task.dueDate,
		tags: task.tags,
		notesAndComments: task.notesAndComments,
	}
	return {
		...boardTask,
		timelineHistory: addChangeToTaskTimelineHistory({
			task: boardTask,
			columnName: movedFromLabel,
		}),
	}
}
