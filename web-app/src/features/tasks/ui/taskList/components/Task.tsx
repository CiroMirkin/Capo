'use client'

import { BlankTask } from '../../BlankTask'
import { taskModel } from '@/features/tasks/model/task'
import { TaskInBoardActions } from './TaskInBoardActions'
import { DragEvent } from 'react'
import { m, useReducedMotion } from 'motion/react'

export function Task({ task, isLastColumn = false }: { task: taskModel; isLastColumn?: boolean }) {
	const reduce = useReducedMotion()

	const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData('task', JSON.stringify(task))
	}

	return (
		<m.div
			layout={reduce ? false : 'position'}
			layoutId={`task-${task.id}`}
			initial={false}
			transition={{ layout: { type: 'spring', stiffness: 500, damping: 40 } }}
		>
			<div className='p-0 m-0' draggable onDragStart={handleDragStart}>
				<BlankTask data={task} key={task.id} isLastColumn={isLastColumn}>
					<BlankTask.ContentCollapse>
						<TaskInBoardActions />
					</BlankTask.ContentCollapse>
				</BlankTask>
			</div>
		</m.div>
	)
}
