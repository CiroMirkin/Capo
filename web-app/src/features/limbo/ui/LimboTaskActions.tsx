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

	return (
		<div className='w-full grid grid-rows-2 gap-1.5'>
			<Button
				size='sm'
				variant='ghost'
				className='w-full flex items-center gap-4'
				title={t('limbo.send_to_board')}
				onClick={sendToBoard}
			>
				<UploadIcon /> {t('limbo.send_to_board')}
			</Button>

			<div className='flex justify-evenly gap-1.5'>
				<CopyTextButton text={task.descriptionText} className='flex-1' />
				<LimboNotesDialog task={task} />
				<Button
					size='sm'
					variant='destructiveGhost'
					className='flex-1'
					title={t('limbo.delete')}
					onClick={askDelete}
				>
					<TrashIcon />
				</Button>
			</div>
		</div>
	)
}
