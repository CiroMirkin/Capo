import { setDueDateOfThisTask } from './setDueDateOfThisTask'
import { taskModel, todayISODate } from '@/features/tasks/model/task'
import { TaskListInEachColumn } from '../models/taskListInEachColumn'
import { format, addDay } from '@formkit/tempo'

const tomorrow = format(addDay(new Date(), 1), 'YYYY-MM-DD')

describe('Agregar fecha límite a una tarea que no la tiene.', () => {
	it('setea dueDate en la tarea sin fecha', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1' }
		const list: TaskListInEachColumn = [[task], [], []]

		const updated = setDueDateOfThisTask({
			taskToUpdate: task,
			dueDate: tomorrow,
			listOfTaskInColumns: list,
		})

		expect(updated[0][0].dueDate).toBe(tomorrow)
	})

	it('rechaza una fecha inválida', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1' }
		const list: TaskListInEachColumn = [[task], [], []]

		expect(() =>
			setDueDateOfThisTask({
				taskToUpdate: task,
				dueDate: '2020-13-40',
				listOfTaskInColumns: list,
			})
		).toThrow()
	})

	it('no pisa una fecha ya seteada', () => {
		const task: taskModel = { id: '1', descriptionText: 'Task 1', dueDate: todayISODate() }
		const list: TaskListInEachColumn = [[task], [], []]

		const updated = setDueDateOfThisTask({
			taskToUpdate: task,
			dueDate: tomorrow,
			listOfTaskInColumns: list,
		})

		expect(updated[0][0].dueDate).toBe(todayISODate())
	})
})
