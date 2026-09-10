import BusinessError from '@/shared/errors/businessError'
import type { taskModel } from '@/features/tasks'
import { LimboTask, LIMBO_TASK_LIMIT, clampToCanvas } from './limboTask'

export type Limbo = LimboTask[]

export const emptyLimbo: Limbo = []

/** El z-order es el orden del array: la última card se dibuja al frente. */
export const addTaskToLimbo = ({
	limbo,
	task,
	x,
	y,
}: {
	limbo: Limbo
	task: taskModel
	x: number
	y: number
}): Limbo => {
	if (limbo.length >= LIMBO_TASK_LIMIT) throw new BusinessError('El limbo está lleno.')
	return [...limbo, { ...task, x, y }]
}

/** Clampa la posición y manda la card al final del array (pasa al frente). */
export const moveTaskInLimbo = ({
	limbo,
	taskId,
	x,
	y,
	cardHeight = 0,
}: {
	limbo: Limbo
	taskId: string
	x: number
	y: number
	cardHeight?: number
}): Limbo => {
	const task = limbo.find((t) => t.id === taskId)
	if (!task) return limbo
	return [
		...limbo.filter((t) => t.id !== taskId),
		{ ...task, ...clampToCanvas({ x, y, cardHeight }) },
	]
}

export const deleteTaskFromLimbo = ({
	limbo,
	taskId,
}: {
	limbo: Limbo
	taskId: string
}): Limbo => limbo.filter((t) => t.id !== taskId)
