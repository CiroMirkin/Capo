'use client'

import React, { createContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { taskModel, emptyTask, getDueDateDisplay, type DueDateContext } from '../model/task'
import { Card, CardContent, CardFooter } from '@/shared/ui/molecules/card'
import { TextWithURL } from '@/shared/ui/atoms/TextWithURL'
import { useTheme } from '@/shared/hooks/useTheme'
import { Badge } from '@/shared/ui/atoms/badge'
import { useAvailableTags, useActualTagGroup, getHighestPriority } from '@/features/tags'
import { CollapseTransition } from '@/shared/ui/atoms/CollapseTransition'
import { DueDateSlot } from './DueDateSlot'

export const TaskContext = createContext(emptyTask)

interface BlankTaskProps {
	data: taskModel
	children?: React.ReactNode
	/** La tarea está en la última columna del tablero (suprime el aviso de urgencia). */
	isLastColumn?: boolean
	context?: DueDateContext
	/** `taskListArchived.date` — requerido en el contexto `archive`. */
	archivedDate?: string
}

export function BlankTask({
	data,
	children,
	isLastColumn = false,
	context = 'board',
	archivedDate,
}: BlankTaskProps) {
	const [show, setShow] = useState(false)
	const description = data.descriptionText
	const colorTheme = useTheme()
	const availableTags = useAvailableTags()
	const { actualTagGroup } = useActualTagGroup()
	const { t, i18n } = useTranslation()

	const taskTags = availableTags
		.flatMap((group) => group.tags)
		.filter((tag) => data.tags && data.tags.find((taskTag) => taskTag.id === tag.id))

	const dueDate = data.dueDate
		? getDueDateDisplay({
				dueDate: data.dueDate,
				taskPriority: getHighestPriority(data.tags),
				topPriority: getHighestPriority(actualTagGroup.tags),
				isLastColumn,
				context,
				archivedDate,
				locale: i18n.language === 'en' ? 'en' : 'es',
				t,
			})
		: null

	const taskClassName = `p-0 rounded-md border-none text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-200 ${colorTheme.task}`

	const dueVisibleClosed = dueDate && (dueDate.restingLabel || dueDate.restingLine)
	const showFooter =
		(taskTags && taskTags.length !== 0) || Boolean(dueVisibleClosed) || (dueDate !== null && show)

	return (
		<TaskContext.Provider value={data}>
			<Card className={taskClassName}>
				<CardContent
					onClick={() => setShow(!show)}
					className='rounded-md px-3 py-2 text-xl leading-tight font-semibold cursor-pointer'
				>
					<p className={`whitespace-pre-wrap ${colorTheme.taskText}`}>
						<TextWithURL text={description}></TextWithURL>
					</p>
					{showFooter && (
						<footer className='w-full pt-2 flex gap-1.5 items-center justify-between opacity-80 hover:opacity-100 transition-opacity duration-200'>
							<div className='flex gap-1.5 flex-wrap items-center'>
								{taskTags.map((tag) => (
									<Badge
										variant={tag.variant ? tag.variant : 'inverted'}
										key={tag.id}
									>
										{tag.name}
									</Badge>
								))}
							</div>
							{dueDate && <DueDateSlot display={dueDate} open={show} />}
						</footer>
					)}
				</CardContent>
				<CollapseTransition isOpen={show} duration={300}>
					{children}
				</CollapseTransition>
			</Card>
		</TaskContext.Provider>
	)
}

function ContentCollapse({ children }: { children: React.ReactNode }) {
	return (
		<CardFooter className='flex flex-col justify-between gap-x-1 gap-y-1.5 items-start p-2 pt-1'>
			{children}
		</CardFooter>
	)
}

/** El children de ContentCollapse se muestra y oculta cuando el usuario hace click sobre el contenido del componente Task. */
BlankTask.ContentCollapse = ContentCollapse
