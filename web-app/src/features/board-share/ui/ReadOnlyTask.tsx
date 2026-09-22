'use client'

import { KebabMenu } from '@/shared/ui/molecules/kebab'
import { BlankTask } from '@/features/tasks/ui/BlankTask'
import { CopyTextButton } from '@/features/tasks/ui/taskList/components/CopyTextButton'
import {
	getChildrenOfTaskInBoard,
	type TaskListInEachColumn,
} from '@/features/tasks/ui/taskList/models/taskListInEachColumn'
import type { TaskList } from '@/features/tasks/model/TaskList'

interface ReadOnlyTaskProps {
	task: TaskList[number]
	lists: TaskListInEachColumn
	isLastColumn: boolean
}

export function ReadOnlyTask({ task, lists, isLastColumn }: ReadOnlyTaskProps) {
	return (
		<BlankTask
			data={task}
			isLastColumn={isLastColumn}
			parentDescription={
				task.parentId
					? lists.flat().find((p) => p.id === task.parentId)?.descriptionText
					: undefined
			}
			childrenCount={
				task.parentId ? undefined : getChildrenOfTaskInBoard(lists, task.id).length
			}
		>
			<BlankTask.ContentCollapse>
				<KebabMenu className='opacity-65 hover:opacity-100 self-end'>
					<CopyTextButton text={task.descriptionText} showLabel />
				</KebabMenu>
			</BlankTask.ContentCollapse>
		</BlankTask>
	)
}
