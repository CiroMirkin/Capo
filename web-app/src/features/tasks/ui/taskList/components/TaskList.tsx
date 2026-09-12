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
import { useMoveTaskToNextColumn } from '../hooks/useMoveTaskToNextColumn'
import { TypeOfView, useTypeOfView } from '@/shared/preferences/view-mode'
import { cn } from '@/shared/lib/utils'

interface TaskListProps {
	tasks: taskList
	columnPosition: string
	isLastColumn?: boolean
}

export function TaskList({ tasks, columnPosition, isLastColumn = false }: TaskListProps) {
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const getColumnName = useGetColumnNameFromPosition()
	const moveTaskToNextColumn = useMoveTaskToNextColumn()
	const isBoardView = useTypeOfView() === TypeOfView.BOARD

	const taskList: React.ReactNode[] = []
	tasks.forEach((task, index) => {
		taskList.push(
			<Task
				task={task}
				key={task.id}
				index={index}
				isLastColumn={isLastColumn}
				rightClickAction={isLastColumn ? undefined : () => moveTaskToNextColumn(task)}
			/>
		)
	})

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
				className={cn(
					'taskList min-h-64 md:min-h-[60vh] pt-2 px-4 flex flex-col gap-y-2',
					// (pantalla grande) bento de hasta 2 tareas por "fila".
					// Multi-columna en vez de grid: con grid, una tarea corta al lado de una larga deja un hueco en blanco (la fila mide lo que mide la más alta).
					// Con columns, cada tarjeta ocupa solo su alto real y se acomodan sin huecos.
					isBoardView && 'lg:block lg:columns-[220px] lg:gap-2 lg:[&>*]:mb-2'
				)}
				onDrop={handleDrop}
			>
				<AnimatePresence initial={false} mode='popLayout'>
					{taskList}
				</AnimatePresence>
			</div>
		</>
	)
}
