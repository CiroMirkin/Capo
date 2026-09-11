import { emptyTask } from '@/features/tasks'
import { addTaskToLimbo, moveTaskInLimbo, deleteTaskFromLimbo, Limbo } from './limbo'
import {
	LIMBO_TASK_LIMIT,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	CARD_WIDTH,
	clampToCanvas,
} from './limboTask'

const task = (id: string): typeof emptyTask => ({ ...emptyTask, id })

describe('addTaskToLimbo', () => {
	test('agrega la tarea con su posición al final del array', () => {
		const limbo = addTaskToLimbo({ limbo: [], task: task('a'), x: 10, y: 20 })
		expect(limbo).toEqual([{ ...task('a'), x: 10, y: 20 }])
	})

	test('lanza BusinessError cuando el limbo está lleno', () => {
		const full: Limbo = Array.from({ length: LIMBO_TASK_LIMIT }, (_, i) => ({
			...task(String(i)),
			x: 0,
			y: 0,
		}))
		expect(() => addTaskToLimbo({ limbo: full, task: task('x'), x: 0, y: 0 })).toThrow(
			'El limbo está lleno.'
		)
	})
})

describe('moveTaskInLimbo', () => {
	const limbo: Limbo = [
		{ ...task('a'), x: 0, y: 0 },
		{ ...task('b'), x: 0, y: 0 },
	]

	test('mueve la tarea al final del array (z-order al frente)', () => {
		const moved = moveTaskInLimbo({ limbo, taskId: 'a', x: 100, y: 100 })
		expect(moved.map((t) => t.id)).toEqual(['b', 'a'])
		expect(moved[1]).toMatchObject({ x: 100, y: 100 })
	})

	test('clampa la posición al lienzo', () => {
		const moved = moveTaskInLimbo({ limbo, taskId: 'a', x: 99999, y: -50, cardHeight: 80 })
		expect(moved[1]).toMatchObject({ x: CANVAS_WIDTH - CARD_WIDTH, y: 0 })
	})

	test('no hace nada si la tarea no existe', () => {
		expect(moveTaskInLimbo({ limbo, taskId: 'z', x: 1, y: 1 })).toBe(limbo)
	})
})

describe('deleteTaskFromLimbo', () => {
	test('quita la tarea indicada', () => {
		const limbo: Limbo = [
			{ ...task('a'), x: 0, y: 0 },
			{ ...task('b'), x: 0, y: 0 },
		]
		expect(deleteTaskFromLimbo({ limbo, taskId: 'a' }).map((t) => t.id)).toEqual(['b'])
	})
})

describe('clampToCanvas', () => {
	test('encierra x/y en [0, canvas - card]', () => {
		expect(clampToCanvas({ x: -10, y: -10, cardHeight: 100 })).toEqual({ x: 0, y: 0 })
		expect(clampToCanvas({ x: 5000, y: 5000, cardHeight: 100 })).toEqual({
			x: CANVAS_WIDTH - CARD_WIDTH,
			y: CANVAS_HEIGHT - 100,
		})
	})
})
