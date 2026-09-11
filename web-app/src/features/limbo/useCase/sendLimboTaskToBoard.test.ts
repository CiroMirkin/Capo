import { emptyTask } from '@/features/tasks'
import { LimboTask } from '../model/limboTask'
import { sendLimboTaskToBoard } from './sendLimboTaskToBoard'

describe('sendLimboTaskToBoard', () => {
	const task: LimboTask = { ...emptyTask, id: 'a', descriptionText: 'idea', x: 120, y: 80 }

	test('quita x/y y agrega una entrada de historial "desde el limbo"', () => {
		const boardTask = sendLimboTaskToBoard({ task, movedFromLabel: 'Desde el limbo' })
		expect(boardTask).not.toHaveProperty('x')
		expect(boardTask).not.toHaveProperty('y')
		expect(boardTask.descriptionText).toBe('idea')
		expect(boardTask.timelineHistory?.at(-1)?.columnName).toBe('Desde el limbo')
	})
})
