import { BlankTask } from '../../BlankTask'
import { taskModel } from '@/features/tasks/model/task'
import { TaskInBoardActions } from './TaskInBoardActions'
import { DragEvent } from 'react'

export function Task({ task, isLastColumn = false }: { task: taskModel; isLastColumn?: boolean }) {
	const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
		e.dataTransfer.setData('task', JSON.stringify(task))
	}

	return (
		<div className='p-0 m-0' draggable onDragStart={handleDragStart}>
			<BlankTask data={task} key={task.id} isLastColumn={isLastColumn}>
				<BlankTask.ContentCollapse>
					<TaskInBoardActions />
				</BlankTask.ContentCollapse>
			</BlankTask>
		</div>
	)
}
