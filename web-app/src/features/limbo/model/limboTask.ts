import type { taskModel } from '@/features/tasks'

/** `x` y `y` son su posición en píxeles sobre el lienzo. */
export type LimboTask = taskModel & { x: number; y: number }

export const LIMBO_TASK_LIMIT = 30

// UI
export const CANVAS_WIDTH = 2400
export const CANVAS_HEIGHT = 1600
export const CARD_WIDTH = 220

/**
 * Mantiene la card dentro del lienzo.
 */
export const clampToCanvas = ({
	x,
	y,
	cardHeight,
}: {
	x: number
	y: number
	cardHeight: number
}): { x: number; y: number } => ({
	x: Math.min(Math.max(x, 0), Math.max(CANVAS_WIDTH - CARD_WIDTH, 0)),
	y: Math.min(Math.max(y, 0), Math.max(CANVAS_HEIGHT - cardHeight, 0)),
})
