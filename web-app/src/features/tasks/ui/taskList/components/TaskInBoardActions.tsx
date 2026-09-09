import { toast } from 'sonner'
import { useCheckIfTaskIsInTheLastColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfTaskIsInTheLastColumn'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { MoveButttons } from './MoveButtons'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { CopyTextButton } from './CopyTextButton'
import { ArchiveTaskButton } from '@/features/archived-tasks'
import { DeleteTaskButton } from './DeleteTaskButton'
import ShowTaskNotesEditor from './ShowTaskNotesEditor'
import { SetDueDateButton } from './SetDueDateButton'

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

	return (
		<div className='w-full flex flex-wrap justify-between gap-1.5'>
			<div className='flex'>
				<MoveButttons handleClick={handleClick} />
			</div>
			<div className='flex'>
				<CopyTextButton />
				<SetDueDateButton />
				<ShowTaskNotesEditor />
				{isTheTaskInTheLastColumn && <ArchiveTaskButton handleClick={handleClick} />}
				<DeleteTaskButton handleClick={handleClick} />
			</div>
		</div>
	)
}
