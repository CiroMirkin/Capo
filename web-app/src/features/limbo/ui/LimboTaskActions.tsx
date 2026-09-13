'use client'

import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import { UploadIcon, TrashIcon } from '@/shared/ui/atoms/icons'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import {
	useTaskBoardQuery,
	useTaskListInEachColumn,
	sortListOfTasksInColumnsByPriority,
	addTaskInFirstColumn,
} from '@/features/tasks'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { addTaskToLimbo, deleteTaskFromLimbo } from '../model/limbo'
import { sendLimboTaskToBoard } from '../useCase/sendLimboTaskToBoard'
import { LimboNotesDialog } from './LimboNotesDialog'
import { LimboTask } from '../model/limboTask'
import { CopyTextButton } from '@/shared/ui/atoms/CopyTextButton'
import { cn } from '@/shared/lib/utils'

export function LimboTaskActions({ task }: { task: LimboTask }) {
	const { t } = useTranslation()
	const { limbo, updateLimbo } = useLimboQuery()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()

	const sendToBoard = () => {
		try {
			const boardTask = sendLimboTaskToBoard({
				task,
				movedFromLabel: t('limbo.moved_from_limbo'),
			})
			const updatedBoard = sortListOfTasksInColumnsByPriority(
				addTaskInFirstColumn({
					task: boardTask,
					taskListInEachColumn: listOfTaskInColumns,
				})
			)
			updateLimbo(deleteTaskFromLimbo({ limbo, taskId: task.id }))
			updateTaskBoard(updatedBoard, {
				onError: () => updateLimbo(addTaskToLimbo({ limbo, task, x: task.x, y: task.y })),
			})
			toast.success(t('limbo.send_to_board_toast'))
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	const askDelete = () => {
		toast.warning(t('limbo.delete_warning'), {
			action: {
				label: t('limbo.delete'),
				onClick: () => updateLimbo(deleteTaskFromLimbo({ limbo, taskId: task.id })),
			},
		})
	}

	const buttonHover = 'opacity-65 hover:opacity-100 transition-opacity ease-in duration-75'

	return (
		<div className='w-full grid grid-rows-2 gap-1'>
			<LimboNotesDialog task={task} className='w-full flex justify-start' />
			<div className='flex gap-1'>
				<div className='flex gap-1'>
					<CopyTextButton text={task.descriptionText} className={buttonHover} />
					<Button
						size='sm'
						variant='destructiveGhost'
						className={buttonHover}
						title={t('limbo.delete')}
						onClick={askDelete}
					>
						<TrashIcon />
					</Button>
				</div>
				<Button
					size='sm'
					variant='ghost'
					className={cn('w-full', buttonHover)}
					title={t('limbo.send_to_board')}
					onClick={sendToBoard}
				>
					<UploadIcon className='mr-2' /> {t('limbo.send_to_board')}
				</Button>
			</div>
		</div>
	)
}
