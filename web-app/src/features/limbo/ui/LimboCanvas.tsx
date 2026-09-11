'use client'

import { useEffect, useRef, useState } from 'react'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { CANVAS_HEIGHT, CANVAS_WIDTH, CARD_WIDTH } from '../model/limboTask'
import { LimboTask } from './LimboTask'
import { LimboEmptyState } from './LimboEmptyState'
import { AddLimboTaskInput } from './AddLimboTaskInput'

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

// lienzo de tamaño fijo 2400×1600. Si 30 cards con títulos largos se amontonan demasiado en la práctica, el upgrade es un lienzo auto-creciente. YAGNI.
const clampPan = (x: number, y: number, el: HTMLElement) => ({
	x: clamp(x, Math.min(0, el.clientWidth - CANVAS_WIDTH), 0),
	y: clamp(y, Math.min(0, el.clientHeight - CANVAS_HEIGHT), 0),
})

export function LimboCanvas() {
	const { limbo } = useLimboQuery()
	const viewportRef = useRef<HTMLDivElement>(null)
	const bgRef = useRef<HTMLDivElement>(null)
	const [pan, setPan] = useState({ x: 0, y: 0 })
	const panRef = useRef(pan)
	panRef.current = pan
	const panDrag = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
	const [panning, setPanning] = useState(false)

	const centeredRef = useRef(false)
	const zCounter = useRef(1)
	const [frontOrder, setFrontOrder] = useState<Record<string, number>>({})
	const bringToFront = (taskId: string) => {
		zCounter.current += 1
		setFrontOrder((order) => ({ ...order, [taskId]: zCounter.current }))
	}

	// Cuando ya hay datos centra el lienzo una vez sobre las tareas existentes
	useEffect(() => {
		const el = viewportRef.current
		if (!el || centeredRef.current || limbo.length === 0) return
		centeredRef.current = true

		const xs = limbo.map((t) => t.x)
		const ys = limbo.map((t) => t.y)
		const centerX = (Math.min(...xs) + Math.max(...xs) + CARD_WIDTH) / 2
		const centerY = (Math.min(...ys) + Math.max(...ys)) / 2
		setPan(clampPan(el.clientWidth / 2 - centerX, el.clientHeight / 2 - centerY, el))
	}, [limbo])

	useEffect(() => {
		const el = viewportRef.current
		if (!el) return

		const onWheel = (e: WheelEvent) => {
			e.preventDefault()
			const horizontal = e.shiftKey
			setPan((p) =>
				clampPan(
					p.x - (horizontal ? e.deltaY : e.deltaX),
					horizontal ? p.y : p.y - e.deltaY,
					el
				)
			)
		}
		el.addEventListener('wheel', onWheel, { passive: false })

		return () => el.removeEventListener('wheel', onWheel)
	}, [])

	const onPointerDown = (e: React.PointerEvent) => {
		const onBackground = e.target === bgRef.current || e.target === viewportRef.current
		if (e.button !== 1 && !(e.button === 0 && onBackground)) return

		panDrag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y }
		setPanning(true)
		e.currentTarget.setPointerCapture(e.pointerId)
	}

	const onPointerMove = (e: React.PointerEvent) => {
		const d = panDrag.current
		if (!d || !viewportRef.current) return

		setPan(clampPan(d.px + (e.clientX - d.x), d.py + (e.clientY - d.y), viewportRef.current))
	}

	const endPan = (e: React.PointerEvent) => {
		if (!panDrag.current) return

		panDrag.current = null
		setPanning(false)
		e.currentTarget.releasePointerCapture?.(e.pointerId)
	}

	const getSpawnPoint = () => {
		const el = viewportRef.current
		if (!el) return { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }
		return {
			x: -panRef.current.x + el.clientWidth / 2,
			y: -panRef.current.y + el.clientHeight / 2,
		}
	}

	if (limbo.length === 0) {
		return (
			<div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
				<LimboEmptyState />
			</div>
		)
	}

	return (
		<div
			ref={viewportRef}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={endPan}
			onPointerCancel={endPan}
			className='relative h-[calc(100vh-5rem)] w-full overflow-hidden'
			style={{ cursor: panning ? 'grabbing' : 'default' }}
		>
			<div
				ref={bgRef}
				className='absolute left-0 top-0 origin-top-left'
				style={{
					width: CANVAS_WIDTH,
					height: CANVAS_HEIGHT,
					transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
				}}
			>
				{limbo.map((task) => (
					<LimboTask
						key={task.id}
						task={task}
						draggable
						zIndex={frontOrder[task.id]}
						onBringToFront={() => bringToFront(task.id)}
					/>
				))}
			</div>

			<AddLimboTaskInput getSpawnPoint={getSpawnPoint} />
		</div>
	)
}
