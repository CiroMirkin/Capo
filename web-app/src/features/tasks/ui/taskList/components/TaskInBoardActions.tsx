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
import { KebabMenu } from '@/shared/ui/molecules/KebabMenu'
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
			<div className='w-full flex gap-1 items-center'>
				<ShowTaskNotesEditor
					className={cn(
						'w-full flex justify-start',
						isTheTaskInTheLastColumn && buttonHover
					)}
				/>
				<KebabMenu className={buttonHover} testId='BotonMenuTarea'>
					<CopyTextButton
						text={data.descriptionText}
						showLabel
						className='w-full justify-start'
					/>
					<SetDueDateButton
						showLabel
						className='flex w-full items-center gap-2 whitespace-nowrap rounded-md px-2 h-7 text-sm hover:bg-accent'
					/>
					{isTheTaskInTheLastColumn && canArchiveThisTask && (
						<ArchiveTaskButton
							handleClick={handleClick}
							className='w-full justify-start px-2 h-7'
						/>
					)}
					<DeleteTaskButton
						handleClick={handleClick}
						showLabel
						className='w-full justify-start'
					/>
				</KebabMenu>
			</div>
			<div className='flex gap-2 justify-between items-center'>
				<MovePrevTaskButton
					handleClick={handleClick}
					className={cn(buttonHover, 'w-full h-7')}
				/>
				{!data.parentId && <AddSubtaskButton className={cn(buttonHover, 'h-7')} />}
				<MoveNextTaskButton
					handleClick={handleClick}
					className={cn(buttonHover, 'w-full h-7')}
				/>
			</div>
		</div>
	)
}
