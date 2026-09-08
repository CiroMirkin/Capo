'use client'

import { TaskList } from './components/TaskList'
import { useTaskListInEachColumn } from './hooks/useTaskListInEachColumn'
import { useTranslation } from 'react-i18next'
import { EmptySpaceText } from '@/shared/ui/atoms/EmptySpaceText'
import { useTheme } from '@/shared/hooks/useTheme'

/** La propiedad columnPosition es el indice de la columna mas uno */
const getColumnPosition = (taskListIndex: number): string => `${taskListIndex + 1}`

export function TaskListInEachColumn() {
	const taskListInEachColumn = useTaskListInEachColumn()
	const colors = useTheme()

	const { t } = useTranslation()

	const columnsContent: React.ReactNode[] = []
	const lastColumnIndex = taskListInEachColumn.length - 1
	// Si todas las listas de tareas estan vacias
	let sumOfEachTaskList = 0
	taskListInEachColumn.forEach((taskList) => (sumOfEachTaskList += Number(taskList.length)))
	if (sumOfEachTaskList == 0) {
		taskListInEachColumn.forEach((taskList, index) => {
			columnsContent.push(
				index == 0 ? (
					<EmptySpaceText
						key='column-0'
						className={`min-h-64 md:min-h-[60vh] pt-4 px-4 ${colors.columnText || 'text-black'}`}
					>
						{t('empty_first_task_list_copy')}
					</EmptySpaceText>
				) : (
					<TaskList
						key={`column-${index}`}
						tasks={taskList}
						columnPosition={getColumnPosition(index)}
						isLastColumn={index === lastColumnIndex}
					/>
				)
			)
		})
		return columnsContent
	}

	taskListInEachColumn.forEach((taskList, index) => {
		columnsContent.push(
			<TaskList
				key={`column-${index}`}
				tasks={taskList}
				columnPosition={getColumnPosition(index)}
				isLastColumn={index === lastColumnIndex}
			/>
		)
	})

	return columnsContent
}
