'use client'

import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import { Column } from '@/features/tasks/ui/Columns/components/Column'
import type { TaskBoard } from '@/features/tasks/model/taskBoard'
import { ReadOnlyTask } from './ReadOnlyTask'

export function ReadOnlyBoard({ name, taskBoard }: { name: string; taskBoard: TaskBoard }) {
	const { t } = useTranslation()
	const { bg, text } = useTheme()
	const lists = taskBoard.map((column) => column.tasks)

	return (
		<div className={cn(bg, text, 'min-h-screen')}>
			<header className='w-full h-20 px-6 md:px-11 flex justify-between items-center'>
				<h1 className='text-xl font-medium'>{name}</h1>
				<span className='text-sm opacity-60'>{t('shared_board.read_only')}</span>
			</header>
			<div className='h-auto pb-2 px-6 md:px-11 flex flex-wrap justify-stretch lg:justify-center items-start gap-3'>
				{taskBoard.map((column) => (
					<Column key={column.id} columnName={column.status} columnPosition=''>
						<div className='min-h-64 pt-2 pb-4 px-4 flex flex-col gap-y-2'>
							{column.tasks.map((task) => (
								<ReadOnlyTask
									key={task.id}
									task={task}
									lists={lists}
									isLastColumn={column === taskBoard[taskBoard.length - 1]}
								/>
							))}
						</div>
					</Column>
				))}
			</div>
		</div>
	)
}
