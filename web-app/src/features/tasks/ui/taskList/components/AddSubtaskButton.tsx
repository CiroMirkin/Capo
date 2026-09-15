'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/atoms/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/molecules/popover'
import { PlusIcon } from '@/shared/ui/atoms/icons'
import { TeaxtareaWithActions } from '@/shared/ui/molecules/TextAreaWithActions'
import { DatePicker } from '@/shared/ui/molecules/DatePicker'
import { TagGroupSelect, useTagStore, useUserSelectedTags } from '@/features/tags'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { getNewTask, isThisTaskDescriptionValid } from '@/features/tasks/model/task'
import { addTaskInFirstColumn } from '../useCase/addTask'
import { addChangeToTaskTimelineHistory } from '../useCase/addChangeToTaskTimelineHistory'
import { sortListOfTasksInColumnsByPriority } from '../models/sortListOfTasksInColumnsByPriority'
import { useGetColumnNameFromPosition } from '@/features/tasks/ui/Columns/hooks/useGetColumnNameFromPosition'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'

interface Props {
	className?: string
}

/** Crea una hija de la tarea actual, en la primera columna — mismo input (texto, etiquetas, fecha límite) que una tarea nueva. */
export function AddSubtaskButton({ className }: Props) {
	const { t } = useTranslation()
	const parent = useDataOfTheTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const getColumnName = useGetColumnNameFromPosition()
	const selectedTags = useUserSelectedTags()
	const setUserSelectedTags = useTagStore((state) => state.setUserSelectedTags)
	const [open, setOpen] = useState(false)
	const [text, setText] = useState('')
	const [dueDate, setDueDate] = useState<string | null>(null)

	const add = () => {
		try {
			const task = getNewTask({ descriptionText: text, dueDate: dueDate ?? undefined })
			const subtask = { ...task, parentId: parent.id, tags: selectedTags }
			const updatedList = sortListOfTasksInColumnsByPriority(
				addTaskInFirstColumn({
					task: {
						...subtask,
						timelineHistory: addChangeToTaskTimelineHistory({
							task: subtask,
							columnName: getColumnName('1'),
						}),
					},
					taskListInEachColumn: listOfTaskInColumns,
				})
			)
			updateTaskBoard(updatedList)
			setUserSelectedTags([])
			setText('')
			setDueDate(null)
			setOpen(false)
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild title={t('subtasks.add_btn')}>
				<Button size='sm' variant='ghost' className={className}>
					<PlusIcon size='xs' />
				</Button>
			</PopoverTrigger>

			<PopoverContent className='w-80 p-1'>
				<TeaxtareaWithActions
					value={text}
					id='add_subtask_btn'
					onChange={setText}
					onKeyDown={(e) => {
						if (e.ctrlKey && e.key === 'Enter') add()
					}}
					placeholder={t('subtasks.placeholder')}
					onClick={add}
					btnTitle={t('new_task_btn_title')}
					btnDisabled={!isThisTaskDescriptionValid(text)}
					badges={<TagGroupSelect />}
					dateControl={<DatePicker value={dueDate} onChange={setDueDate} />}
				/>
			</PopoverContent>
		</Popover>
	)
}
