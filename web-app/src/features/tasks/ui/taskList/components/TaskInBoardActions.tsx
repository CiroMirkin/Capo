import { toast } from 'sonner'
import { useCheckIfTaskIsInTheLastColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfTaskIsInTheLastColumn'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { MovePrevTaskButton } from './MovePrevTaskButton'
import { MoveNextTaskButton } from './MoveNextTaskButton'
import { AddSubtaskButton } from './AddSubtaskButton'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { isTaskReadyToArchiveIndividually } from '../models/taskListInEachColumn'
import { CopyTextButton } from '../../../../../shared/ui/atoms/CopyTextButton'
import { ArchiveTaskButton } from '@/features/archived-tasks'
import { DeleteTaskButton } from './DeleteTaskButton'
import ShowTaskNotesEditor from './ShowTaskNotesEditor'
import { SetDueDateButton } from './SetDueDateButton'
import { cn } from '@/shared/lib/utils'

export function TaskInBoardActions() {
	const data = useDataOfTheTask()
	const isTheTaskInTheLastColumn = useCheckIfTaskIsInTheLastColumn(data)
	const listOfTaskInColumns = useTaskListInEachColumn()
	const canArchiveThisTask = isTaskReadyToArchiveIndividually(listOfTaskInColumns, data)

	const handleClick = (action: () => void) => {
		try {
			action()
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	const buttonHover = 'opacity-65 hover:opacity-100 transition-opacity ease-in duration-75'

	return (
		<div className='w-full flex flex-col gap-1'>
			<div className='w-full flex justify-stretch gap-1'>
				<ShowTaskNotesEditor
					className={cn(
						'w-full flex justify-start',
						isTheTaskInTheLastColumn && buttonHover
					)}
				/>
				{isTheTaskInTheLastColumn && canArchiveThisTask && (
					<ArchiveTaskButton handleClick={handleClick} className='w-full' />
				)}
			</div>
			<div className='flex flex-wrap gap-1 justify-between'>
				<div className='flex gap-1'>
					<CopyTextButton text={data.descriptionText} className={buttonHover} />
					<SetDueDateButton className={buttonHover} />
					<DeleteTaskButton handleClick={handleClick} className={buttonHover} />
				</div>
				<div className='flex w-full gap-1 sm:w-auto lg:justify-stretch xl:w-auto xl:justify-normal'>
					<MovePrevTaskButton
						handleClick={handleClick}
						className={cn(buttonHover, 'w-full sm:w-auto xl:w-auto')}
					/>
					{!data.parentId && <AddSubtaskButton className={cn(buttonHover)} />}
					<MoveNextTaskButton
						handleClick={handleClick}
						className={cn(buttonHover, 'w-full sm:w-auto xl:w-auto')}
					/>
				</div>
			</div>
		</div>
	)
}
