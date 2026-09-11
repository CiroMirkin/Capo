'use client'

import { useEffect, useRef, useState } from 'react'
import { BlankTask } from '@/features/tasks'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { moveTaskInLimbo } from '../model/limbo'
import { LimboTask as LimboTaskModel, clampToCanvas } from '../model/limboTask'
import { LimboTaskActions } from './LimboTaskActions'
import { cn } from '@/shared/lib/utils'

const DRAG_THRESHOLD = 5

interface Props {
	task: LimboTaskModel
	draggable?: boolean
	zIndex?: number
	onBringToFront?: () => void
	className?: string
}

/** En mobile la card se renderiza sin drag; en el lienzo es `position:absolute` y arrastrable. */
export function LimboTask({ task, draggable = false, zIndex, onBringToFront, className }: Props) {
	const { limbo, updateLimbo } = useLimboQuery()
	const ref = useRef<HTMLDivElement>(null)
	const drag = useRef<{ sx: number; sy: number; moved: boolean } | null>(null)
	const suppressClick = useRef(false)
	// Posición absoluta a mostrar mientras se arrastra/acaba de soltar. `null` = usar `task.x/y`.
	const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)

	// Recién limpia dragPos cuando la posición real (`task.x/y`) llega a coincidir
	// con la soltada; evita el "fantasma" de volver a la posición vieja (o saltar
	// de más) mientras se guarda el drop.
	useEffect(() => {
		if (dragPos && task.x === dragPos.x && task.y === dragPos.y) setDragPos(null)
	}, [task.x, task.y, dragPos])

	if (!draggable) return <CardBody task={task} className={cn('w-full max-w-none', className)} />

	const onPointerDown = (e: React.PointerEvent) => {
		if (e.button !== 0) return
		// Los diálogos/menús de LimboTaskActions se portalean fuera del DOM de la card, pero React sigue burbujeando sus eventos por el árbol de componentes
		// Sin este chequeo, abrir notas y cerrar el diálogo clickeando afuera dispara este handler con coordenadas lejanas y deja `drag.current` colgado
		if (!ref.current?.contains(e.target as Node)) return
		suppressClick.current = false
		drag.current = { sx: e.clientX, sy: e.clientY, moved: false }
		onBringToFront?.()
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
		setDragPos({ x: task.x + dx, y: task.y + dy })
	}

	const onPointerUp = (e: React.PointerEvent) => {
		const d = drag.current
		drag.current = null
		if (!d) return
		if (!d.moved) {
			setDragPos(null)
			return
		}

		ref.current?.releasePointerCapture?.(e.pointerId)
		suppressClick.current = true
		const cardHeight = ref.current?.offsetHeight ?? 0
		const dropped = clampToCanvas({
			x: task.x + (e.clientX - d.sx),
			y: task.y + (e.clientY - d.sy),
			cardHeight,
		})
		// Se queda mostrando la posición soltada (posición absoluta, no relativa a `task.x/y`),
		// //hasta que el efecto de arriba detecte la data ya persistida.
		setDragPos(dropped)
		updateLimbo(
			moveTaskInLimbo({
				limbo,
				taskId: task.id,
				x: task.x + (e.clientX - d.sx),
				y: task.y + (e.clientY - d.sy),
				cardHeight,
			})
		)
	}

	// El navegador puede cancelar el gesto a mitad de camino (menú contextual con click derecho mientras se arrastra, long-press, gesto de touch) sin disparar `pointerup`
	// sin este handler `drag.current` queda colgado con `moved: true` y la próxima vez que el mouse pase por encima de la card, `onPointerMove` retoma el arrastre fantasma "pegado" al cursor
	const onPointerCancel = (e: React.PointerEvent) => {
		if (!drag.current) return
		drag.current = null
		ref.current?.releasePointerCapture?.(e.pointerId)
		setDragPos(null)
	}

	return (
		<div
			ref={ref}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerCancel}
			onClickCapture={(e) => {
				if (suppressClick.current) {
					e.stopPropagation()
					suppressClick.current = false
				}
			}}
			style={{
				position: 'absolute',
				left: dragPos?.x ?? task.x,
				top: dragPos?.y ?? task.y,
				zIndex: dragPos ? 9999 : zIndex,
				touchAction: 'none',
				cursor: dragPos ? 'grabbing' : 'grab',
			}}
			className={cn('w-[220px] select-none', className)}
		>
			<CardBody task={task} />
		</div>
	)
}

function CardBody({ task, className }: { task: LimboTaskModel; className?: string }) {
	return (
		<BlankTask data={task} context='limbo' className={className}>
			<BlankTask.ContentCollapse>
				<LimboTaskActions task={task} />
			</BlankTask.ContentCollapse>
		</BlankTask>
	)
}
