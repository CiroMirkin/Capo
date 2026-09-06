import React from 'react'
import { TaskList as taskList } from '@/features/tasks'
import { BlankTask } from '@/features/tasks'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { useTheme } from '@/shared/hooks/useTheme'
import { MinimalTiptapViewer } from '@/shared/ui/organisms/MinimalTiptapViewer'
import { ReturnTaskToBoardButton } from './ReturnTaskToBoardButton'
import { DeleteArchivedTaskButton } from './DeleteArchivedTaskButton'
import TaskTimeline from './TaskTimeline'

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
	const tasks: React.ReactNode[] = taskList.map((task) => (
		<BlankTask data={task} key={task.id} context='archive' archivedDate={date}>
			<BlankTask.ContentCollapse>
				{task.notesAndComments && (
					<div>
						<MinimalTiptapViewer
							value={task.notesAndComments ? task.notesAndComments : ''}
						/>
					</div>
				)}
				{task.timelineHistory && <TaskTimeline timelineHistory={task.timelineHistory} />}
				<>
					<ReturnTaskToBoardButton />
					<DeleteArchivedTaskButton />
				</>
			</BlankTask.ContentCollapse>
		</BlankTask>
	))
	return <>{tasks}</>
}
