'use client'

import { useRef, useState } from 'react'
import { BlankTask } from '@/features/tasks'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { moveTaskInLimbo } from '../model/limbo'
import { LimboTask as LimboTaskModel } from '../model/limboTask'
import { LimboTaskActions } from './LimboTaskActions'

const DRAG_THRESHOLD = 5

function CardBody({ task }: { task: LimboTaskModel }) {
	return (
		<BlankTask data={task} context='limbo'>
			<BlankTask.ContentCollapse>
				<LimboTaskActions task={task} />
			</BlankTask.ContentCollapse>
		</BlankTask>
	)
}

interface Props {
	task: LimboTaskModel
	draggable?: boolean
}

/** En mobile la card se renderiza sin drag; en el lienzo es `position:absolute` y arrastrable. */
export function LimboTask({ task, draggable = false }: Props) {
	const { limbo, updateLimbo } = useLimboQuery()
	const ref = useRef<HTMLDivElement>(null)
	const drag = useRef<{ sx: number; sy: number; moved: boolean } | null>(null)
	const suppressClick = useRef(false)
	const [offset, setOffset] = useState<{ x: number; y: number } | null>(null)

	if (!draggable) return <CardBody task={task} />

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.button !== 0) return
		suppressClick.current = false
		drag.current = { sx: e.clientX, sy: e.clientY, moved: false }
	}

	const onPointerMove = (e: React.PointerEvent) => {
		if (!drag.current) return
		const dx = e.clientX - drag.current.sx
		const dy = e.clientY - drag.current.sy
		if (!drag.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
		if (!drag.current.moved) {
			// Capturar recién acá: hacerlo en pointerdown redirige el `click` al
			// wrapper y BlankTask nunca togglea sus acciones.
			drag.current.moved = true
			ref.current?.setPointerCapture(e.pointerId)
		}
		setOffset({ x: dx, y: dy })
	}

	const onPointerUp = (e: React.PointerEvent) => {
		const d = drag.current
		drag.current = null
		if (!d) return
		setOffset(null)
		if (!d.moved) return
		ref.current?.releasePointerCapture?.(e.pointerId)
		suppressClick.current = true
		updateLimbo(
			moveTaskInLimbo({
				limbo,
				taskId: task.id,
				x: task.x + (e.clientX - d.sx),
				y: task.y + (e.clientY - d.sy),
				cardHeight: ref.current?.offsetHeight ?? 0,
			})
		)
	}

	return (
		<div
			ref={ref}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onClickCapture={(e) => {
				if (suppressClick.current) {
					e.stopPropagation()
					suppressClick.current = false
				}
			}}
			style={{
				position: 'absolute',
				left: task.x + (offset?.x ?? 0),
				top: task.y + (offset?.y ?? 0),
				zIndex: offset ? 9999 : undefined,
				touchAction: 'none',
				cursor: offset ? 'grabbing' : 'grab',
			}}
			className='w-[220px]'
		>
			<CardBody task={task} />
		</div>
	)
}
