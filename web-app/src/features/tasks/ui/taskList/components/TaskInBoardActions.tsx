import { toast } from 'sonner'
import { useCheckIfTaskIsInTheLastColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfTaskIsInTheLastColumn'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { MoveButttons } from './MoveButtons'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { CopyTextButton } from '../../../../../shared/ui/atoms/CopyTextButton'
import { ArchiveTaskButton } from '@/features/archived-tasks'
import { DeleteTaskButton } from './DeleteTaskButton'
import ShowTaskNotesEditor from './ShowTaskNotesEditor'
import { SetDueDateButton } from './SetDueDateButton'
import { cn } from '@/shared/lib/utils'

export function TaskInBoardActions() {
	const data = useDataOfTheTask()
	const isTheTaskInTheLastColumn = useCheckIfTaskIsInTheLastColumn(data)

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
				{isTheTaskInTheLastColumn && (
					<ArchiveTaskButton handleClick={handleClick} className='w-full' />
				)}
			</div>
			<div className='flex gap-1'>
				<div className='flex gap-1'>
					<CopyTextButton text={data.descriptionText} className={buttonHover} />
					<SetDueDateButton className={buttonHover} />
					<DeleteTaskButton handleClick={handleClick} className={buttonHover} />
				</div>
				<MoveButttons handleClick={handleClick} />
			</div>
		</div>
	)
}
