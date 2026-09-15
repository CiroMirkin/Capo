import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { taskModel, TaskList as taskList } from '@/features/tasks'
import { BlankTask } from '@/features/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { useTheme } from '@/shared/hooks/useTheme'
import { MinimalTiptapViewer } from '@/shared/ui/organisms/MinimalTiptapViewer'
import { Button } from '@/shared/ui/atoms/button'
import { SquareTextIcon, HistoryIcon, ChevronDownIcon } from '@/shared/ui/atoms/icons'
import { CollapseTransition } from '@/shared/ui/atoms/CollapseTransition'
import { cn } from '@/shared/lib/utils'
import { ReturnTaskToBoardButton } from './ReturnTaskToBoardButton'
import { DeleteArchivedTaskButton } from './DeleteArchivedTaskButton'
import TaskTimeline from './TaskTimeline'
import TaskDurationSummary from './TaskDurationSummary'
import { useArchive } from '../hooks/useArchive'
import { getArchivedChildren, type Archive } from '../model/archive'

interface TaskListArchivedProps {
	taskList: taskList
	date: string
}

export function TaskListArchived({ taskList, date }: TaskListArchivedProps) {
	const { column } = useTheme()
	return (
		<>
			<Card key={date} className={`md:px-11 px-6 rounded-lg ${column}`}>
				<CardHeader>
					<CardTitle className='text-2xl'>{date}</CardTitle>
				</CardHeader>
				<CardContent className='flex flex-col gap-y-2'>
					<TaskList taskList={taskList} date={date} />
				</CardContent>
			</Card>
		</>
	)
}

function TaskList({ taskList, date }: { taskList: taskList; date: string }) {
	const archive = useArchive()
	const tasks: React.ReactNode[] = taskList.map((task) => (
		<BlankTask data={task} key={task.id} context='archive' archivedDate={date}>
			<BlankTask.ContentCollapse>
				<ArchivedTaskDetails task={task} />
				<div className='flex gap-1'>
					<ReturnTaskToBoardButton />
					<DeleteArchivedTaskButton />
				</div>
				{!task.parentId && <ArchivedChildren archive={archive} parentId={task.id} />}
			</BlankTask.ContentCollapse>
		</BlankTask>
	))
	return <>{tasks}</>
}

/** Cards completas de las hijas archivadas de `parentId`, anidadas dentro del padre. */
function ArchivedChildren({ archive, parentId }: { archive: Archive; parentId: string }) {
	const children = getArchivedChildren(archive, parentId)
	if (children.length === 0) return null

	return (
		<div className='flex w-full flex-col gap-2'>
			{children.map(({ task, date }) => (
				<BlankTask data={task} key={task.id} context='archive' archivedDate={date}>
					<BlankTask.ContentCollapse>
						<ArchivedTaskDetails task={task} />
						<div className='flex gap-1'>
							<ReturnTaskToBoardButton />
							<DeleteArchivedTaskButton />
						</div>
					</BlankTask.ContentCollapse>
				</BlankTask>
			))}
		</div>
	)
}

function ArchivedTaskDetails({ task }: { task: taskModel }) {
	const { t } = useTranslation()
	const [open, setOpen] = useState<'notes' | 'history' | null>(null)

	const hasNotes = !!task.notesAndComments
	const hasHistory = !!task.timelineHistory?.length
	if (!hasNotes && !hasHistory) return null

	const toggle = (section: 'notes' | 'history') =>
		setOpen((current) => (current === section ? null : section))

	const triggerClassName = (section: 'notes' | 'history') =>
		cn('w-full justify-start', open === section && 'bg-accent')

	return (
		<div className='w-full flex flex-col gap-1'>
			<div className='w-full flex gap-1'>
				{hasNotes && (
					<Button
						size='sm'
						variant='secondary'
						className={triggerClassName('notes')}
						onClick={() => toggle('notes')}
					>
						<SquareTextIcon className='mr-2' /> {t('archive.notes_option')}
						<ChevronDownIcon
							className={cn(
								'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
								open === 'notes' && 'rotate-180'
							)}
						/>
					</Button>
				)}

				{hasHistory && (
					<Button
						size='sm'
						variant='secondary'
						className={triggerClassName('history')}
						onClick={() => toggle('history')}
					>
						<HistoryIcon className='mr-2' /> {t('archive.history_option')}
						<ChevronDownIcon
							className={cn(
								'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
								open === 'history' && 'rotate-180'
							)}
						/>
					</Button>
				)}
			</div>

			{hasNotes && (
				<CollapseTransition isOpen={open === 'notes'}>
					<MinimalTiptapViewer value={task.notesAndComments ?? ''} />
				</CollapseTransition>
			)}

			{hasHistory && task.timelineHistory && (
				<CollapseTransition isOpen={open === 'history'}>
					<TaskDurationSummary timelineHistory={task.timelineHistory} />
					<TaskTimeline timelineHistory={task.timelineHistory} />
				</CollapseTransition>
			)}
		</div>
	)
}
