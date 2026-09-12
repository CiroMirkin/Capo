import { useTranslation } from 'react-i18next'
import { useCheckIfThisTaskIsInTheFirstColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfThisTaskIsInTheFirstColumn'
import { useCheckIfTaskIsInTheLastColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfTaskIsInTheLastColumn'
import { Button } from '@/shared/ui/atoms/button'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/atoms/icons'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { moveThisTaskToThePrevColumn } from '../useCase/moveTask'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { useGetColumnNameFromTask } from '@/features/tasks/ui/Columns/hooks/useGetColumnNameFromTask'
import { useMoveTaskToNextColumn } from '../hooks/useMoveTaskToNextColumn'

interface MoveButtonsProps {
	handleClick: (action: () => void) => void
}

export function MoveButttons({ handleClick }: MoveButtonsProps) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const getColumnName = useGetColumnNameFromTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const isTheTaskInTheFirstColumn = useCheckIfThisTaskIsInTheFirstColumn(data)
	const isTheTaskInTheLastColumn = useCheckIfTaskIsInTheLastColumn(data)
	const moveTaskToNextColumn = useMoveTaskToNextColumn()
	const moveTaskToNextColumnAction = () => moveTaskToNextColumn(data)
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
		<div className='w-full flex justify-stretch gap-1'>
			<Button
				size='sm'
				disabled={isTheTaskInTheFirstColumn}
				variant='ghost'
				data-testid='BotonParaRetrocederTarea'
				className='w-full'
				onClick={() => handleClick(moveTaskToPrevColumnAction)}
				title={t('task_buttons.prev_btn')}
			>
				<ArrowLeftIcon />
			</Button>
			<Button
				size='sm'
				disabled={isTheTaskInTheLastColumn}
				variant='ghost'
				className='w-full'
				data-testid='BotonParaAvanzarTarea'
				onClick={() => handleClick(moveTaskToNextColumnAction)}
				title={t('task_buttons.next_btn')}
			>
				<ArrowRightIcon />
			</Button>
		</div>
	)
}
