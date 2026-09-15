import { useCheckIfThisTaskIsInTheFirstColumn } from '@/features/tasks/ui/Columns/hooks/useCheckIfThisTaskIsInTheFirstColumn'
import { useTranslation } from 'react-i18next'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { toast } from 'sonner'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { TrashIcon } from '@/shared/ui/atoms/icons'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { deleteThisTask } from '../useCase/deleteTask'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { KebabMenuItem } from '@/shared/ui/molecules/KebabMenuItem'

interface DeleteButtonProps {
	handleClick: (action: () => void) => void
	className?: string
	/** Muestra la etiqueta junto al icono (item de menú en vez de botón compacto). */
	showLabel?: boolean
}

export function DeleteTaskButton({ handleClick, className, showLabel }: DeleteButtonProps) {
	const { t } = useTranslation()
	const data = useDataOfTheTask()
	const isTheTaskInTheFirstColumn = useCheckIfThisTaskIsInTheFirstColumn(data)
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()

	const deleteTaskAction = () => {
		const updatedList = deleteThisTask({
			taskListInEachColumn: listOfTaskInColumns,
			task: data,
		})
		updateTaskBoard(updatedList)
	}

	const askForConfirmationToDeleteTheTask = () => {
		isTheTaskInTheFirstColumn
			? handleClick(deleteTaskAction)
			: toast.warning(t('task_buttons.delete_task_warning'), {
					action: {
						label: t('task_buttons.delete'),
						onClick: () => handleClick(deleteTaskAction),
					},
				})
	}

	return (
		<PopoverPrimitive.Close asChild>
			<KebabMenuItem
				variant='destructiveGhost'
				showLabel={showLabel}
				className={className}
				onClick={askForConfirmationToDeleteTheTask}
				data-testid='BotonEliminarTarea'
				title={t('task_buttons.delete')}
			>
				<TrashIcon size='xs' />
				{showLabel && t('task_buttons.delete')}
			</KebabMenuItem>
		</PopoverPrimitive.Close>
	)
}
