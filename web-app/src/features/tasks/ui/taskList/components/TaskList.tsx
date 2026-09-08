import React, { DragEvent } from 'react'
import { AnimatePresence } from 'motion/react'
import { TaskList as taskList } from '@/features/tasks/model/TaskList'
import { Task } from './Task'
import { taskModel } from '@/features/tasks/model/task'
import { moveThisTaskToThisColumn } from '../useCase/moveThisTaskToThisColumn'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { useGetColumnNameFromPosition } from '@/features/tasks/ui/Columns/hooks/useGetColumnNameFromPosition'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'

interface TaskListProps {
	tasks: taskList
	columnPosition: string
	isLastColumn?: boolean
}

export function TaskList({ tasks, columnPosition, isLastColumn = false }: TaskListProps) {
	const taskList: React.ReactNode[] = []

	tasks.forEach((task, index) => {
		taskList.push(<Task task={task} key={task.id} isLastColumn={isLastColumn} index={index} />)
	})

	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const getColumnName = useGetColumnNameFromPosition()
	const handleDrop = (e: DragEvent) => {
		const dropData = e.dataTransfer.getData('task')
		if (dropData != null) {
			const taskDragged: taskModel = JSON.parse(dropData)
			const task: taskModel = {
				...taskDragged,
				timelineHistory: addChangeToTaskTimelineHistory({
					task: taskDragged,
					columnName: getColumnName(columnPosition),
				}),
			}

			const updatedList = sortListOfTasksInColumnsByPriority(
				moveThisTaskToThisColumn({
					taskListOfColumns: listOfTaskInColumns,
					task,
					newColumnPosition: columnPosition,
				})
			)
			updateTaskBoard(updatedList)
		}
	}

	return (
		<>
			<div
				className='taskList min-h-64 md:min-h-[60vh] pt-4 px-4 flex flex-col gap-y-2'
				onDrop={handleDrop}
			>
				<AnimatePresence initial={false}>{taskList}</AnimatePresence>
			</div>
		</>
	)
}
