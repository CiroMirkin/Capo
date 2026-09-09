'use client'

import { BlankTask } from '../../BlankTask'
import { taskModel } from '@/features/tasks/model/task'
import { TaskInBoardActions } from './TaskInBoardActions'
import { DragEvent, MouseEvent, forwardRef } from 'react'
import { m, useReducedMotion } from 'motion/react'

interface TaskProps {
	task: taskModel
	index?: number
	isLastColumn?: boolean
	/** Se dispara con click derecho sobre la tarea. Si no se pasa, no se intercepta el menú contextual. */
	rightClickAction?: () => void
}

export const Task = forwardRef<HTMLDivElement, TaskProps>(function Task(
	{ task, index = 0, isLastColumn = false, rightClickAction },
	ref
) {
	const reduce = useReducedMotion()

	const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData('task', JSON.stringify(task))
	}

	const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
		if (!rightClickAction) return
		e.preventDefault()
		rightClickAction()
	}

	return (
		<m.div
			ref={ref}
			style={{ originY: 1 }}
			layout={reduce ? false : 'position'}
			initial={reduce ? false : { opacity: 0, scale: 0.9, y: 12 }}
			animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
			// Solo animamos la salida en la última columna (cascada al archivar). En
			// las demás, una tarea que "sale" es una que se movió de columna: con
			// `mode="popLayout"` la salida la deja montada ~250ms y la tarea aparece
			// en dos columnas a la vez (rompía los e2e). Sin `exit` se desmonta ya.
			exit={
				!isLastColumn
					? undefined
					: reduce
						? { opacity: 0 }
						: {
								opacity: 0,
								scale: 0.6,
								y: 24,
								transition: { duration: 0.22, delay: index * 0.06, ease: 'easeIn' },
							}
			}
			transition={{
				layout: { type: 'spring', stiffness: 500, damping: 40 },
				duration: 0.2,
				ease: 'easeOut',
			}}
		>
			<div
				className='p-0 m-0'
				draggable
				onDragStart={handleDragStart}
				onContextMenu={handleContextMenu}
			>
				<BlankTask data={task} key={task.id} isLastColumn={isLastColumn}>
					<BlankTask.ContentCollapse>
						<TaskInBoardActions />
					</BlankTask.ContentCollapse>
				</BlankTask>
			</div>
		</m.div>
	)
})
