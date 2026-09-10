'use client'

import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import { SendIcon, TrashIcon } from '@/shared/ui/atoms/icons'
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
				onError: () =>
					updateLimbo(addTaskToLimbo({ limbo, task, x: task.x, y: task.y })),
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
		<div className='flex w-full flex-wrap justify-between gap-1.5'>
			<LimboNotesDialog task={task} />
			<Button
				size='sm'
				variant='ghost'
				className='flex-1'
				title={t('limbo.send_to_board')}
				onClick={sendToBoard}
			>
				<SendIcon />
			</Button>
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
	)
}
