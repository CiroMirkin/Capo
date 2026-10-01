import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'

const HEAD = 30
const BODY = 40
const ARM = 25
const LEG = 30

const line = (x: number, y: number, dx: number, dy: number) => ({
	type: 'line' as const,
	x,
	y,
	points: [
		[0, 0],
		[dx, dy],
	],
})

/** Actor UML ("stick-man") de ~50×100 centrado en (cx, cy), agrupado bajo `groupId`. */
export function stickmanSkeleton(
	cx: number,
	cy: number,
	groupId: string
): ExcalidrawElementSkeleton[] {
	const top = cy - (HEAD + BODY + LEG) / 2
	const neck = top + HEAD
	const hip = neck + BODY

	// `points` es LocalPoint (tupla con brand) en Excalidraw: el cast evita importar @excalidraw/math.
	return [
		{ type: 'ellipse', x: cx - HEAD / 2, y: top, width: HEAD, height: HEAD },
		line(cx, neck, 0, BODY),
		line(cx - ARM, neck + BODY / 3, ARM * 2, 0),
		line(cx, hip, -LEG / 1.5, LEG),
		line(cx, hip, LEG / 1.5, LEG),
	].map((el) => ({ ...el, groupIds: [groupId] })) as ExcalidrawElementSkeleton[]
}
