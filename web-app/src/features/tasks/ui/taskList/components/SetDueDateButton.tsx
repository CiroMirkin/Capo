'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { DatePicker } from '@/shared/ui/molecules/DatePicker'
import { kebabMenuItemClassName } from '@/shared/ui/molecules/KebabMenuItem'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { setDueDateOfThisTask } from '../useCase/setDueDateOfThisTask'

interface Props {
	className?: string
	/** Muestra la etiqueta junto al icono (item de menú en vez de botón compacto). */
	showLabel?: boolean
}

/**
 * Deja agregar una fecha límite a una tarea que no la tiene, con el mismo
 * `DatePicker` del input de nueva tarea. Si la tarea ya tiene fecha, no se
 * muestra (editar una fecha existente está fuera de alcance).
 */
export function SetDueDateButton({ className, showLabel }: Props) {
	const task = useDataOfTheTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()
	const [dueDate, setDueDate] = useState<string | null>(null)

	if (task.dueDate) return null

	const handleChange = (value: string | null) => {
		if (!value) return
		try {
			updateTaskBoard(
				setDueDateOfThisTask({ taskToUpdate: task, dueDate: value, listOfTaskInColumns })
			)
			setDueDate(value)
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<DatePicker
			value={dueDate}
			onChange={handleChange}
			showLabel={showLabel}
			className={kebabMenuItemClassName({ showLabel, className })}
		/>
	)
}
