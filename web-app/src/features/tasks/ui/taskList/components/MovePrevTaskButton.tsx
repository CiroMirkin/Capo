import { useTranslation } from 'react-i18next'
import { useCheckIfThisTaskIsInTheFirstColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfThisTaskIsInTheFirstColumn'
import { Button } from '@/shared/ui/atoms/button'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { ArrowLeftIcon } from '@/shared/ui/atoms/icons'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { moveThisTaskToThePrevColumn } from '../useCase/moveTask'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { useGetColumnNameFromTask } from '@/features/tasks/ui/Columns/hooks/useGetColumnNameFromTask'

interface Props {
	handleClick: (action: () => void) => void
	className?: string
}

export function MovePrevTaskButton({ handleClick, className }: Props) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const getColumnName = useGetColumnNameFromTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const isTheTaskInTheFirstColumn = useCheckIfThisTaskIsInTheFirstColumn(data)

	const moveTaskToPrevColumnAction = () => {
		const task = {
			...data,
			timelineHistory: addChangeToTaskTimelineHistory({
				task: data,
				columnName: getColumnName(data),
			}),
		}
		const updatedList = sortListOfTasksInColumnsByPriority(
			moveThisTaskToThePrevColumn({
				taskListInEachColumn: listOfTaskInColumns || [],
				task,
			})
		)
		updateTaskBoard(updatedList)
	}

	return (
		<Button
			size='sm'
			disabled={isTheTaskInTheFirstColumn}
			variant='ghost'
			data-testid='BotonParaRetrocederTarea'
			className={className}
			onClick={() => handleClick(moveTaskToPrevColumnAction)}
			title={t('task_buttons.prev_btn')}
		>
			<ArrowLeftIcon size='xs' />
		</Button>
	)
}
