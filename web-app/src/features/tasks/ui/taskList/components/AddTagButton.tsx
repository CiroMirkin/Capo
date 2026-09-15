'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { LazyMotion, domAnimation, m, AnimatePresence, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { TagIcon, TagPlusIcon } from '@/shared/ui/atoms/icons'
import { CheckboxBadge } from '@/shared/ui/molecules/CheckboxBadge'
import { useActualTagGroup, translateTagGroup, type Tag } from '@/features/tags'
import { useTaskBoardQuery } from '@/features/tasks/hooks/useTaskBoardQuery'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { useDataOfTheTask } from '../hooks/useDataOfTheTask'
import { useTaskListInEachColumn } from '../hooks/useTaskListInEachColumn'
import { addTagInThisTask } from '../useCase/addTagInThisTask'
import { cn } from '@/shared/lib/utils'

interface Props {
	className?: string
	showLabel?: boolean
}

/** Permite alternar los tags del grupo activo del tablero sobre una tarea ya creada. */
export function AddTagButton({ className, showLabel }: Props) {
	const { t } = useTranslation()
	const reduce = useReducedMotion()
	const { actualTagGroup } = useActualTagGroup()
	const translatedTagGroup = translateTagGroup(actualTagGroup, t)
	const task = useDataOfTheTask()
	const { updateTaskBoard } = useTaskBoardQuery()
	const listOfTaskInColumns = useTaskListInEachColumn()

	if (translatedTagGroup.tags.length === 0) return null

	const taskTags = task.tags ?? []
	const hasTags = taskTags.length > 0
	const label = t(hasTags ? 'task_buttons.tags' : 'task_buttons.add_tag')
	const Icon = hasTags ? TagIcon : TagPlusIcon

	const handleToggle = (checked: boolean, tag: Tag) => {
		const newTags = checked
			? [...taskTags, tag]
			: taskTags.filter((existing) => existing.id !== tag.id)
		try {
			updateTaskBoard(
				addTagInThisTask({ taskListByColumns: listOfTaskInColumns, task, tags: newTags })
			)
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<PopoverPrimitive.Root>
			<PopoverPrimitive.Trigger asChild>
				<button
					type='button'
					title={label}
					className={cn(
						'flex items-center gap-2 whitespace-nowrap rounded-md px-2 h-7 text-sm hover:bg-accent',
						className
					)}
				>
					<Icon size='xs' />
					<span className={cn(!showLabel && 'sr-only')}>{label}</span>
				</button>
			</PopoverPrimitive.Trigger>

			<PopoverPrimitive.Portal>
				<PopoverPrimitive.Content side='top' align='start' sideOffset={8} className='z-50'>
					<LazyMotion features={domAnimation}>
						<AnimatePresence>
							<m.div
								initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
								transition={{
									duration: reduce ? 0.1 : 0.16,
									ease: [0.22, 1, 0.36, 1],
								}}
								className='flex w-[min(16rem,calc(100vw-1.5rem))] flex-wrap gap-2 rounded-lg border border-border bg-white p-3 shadow-lg'
							>
								{translatedTagGroup.tags.map((tag) => (
									<CheckboxBadge
										id={tag.id}
										key={tag.id}
										variant={tag.variant ? tag.variant : 'inverted'}
										checked={taskTags.some(
											(existing) => existing.id === tag.id
										)}
										onChange={(checked) => handleToggle(checked, tag)}
									>
										{tag.name}
									</CheckboxBadge>
								))}
							</m.div>
						</AnimatePresence>
					</LazyMotion>
				</PopoverPrimitive.Content>
			</PopoverPrimitive.Portal>
		</PopoverPrimitive.Root>
	)
}
