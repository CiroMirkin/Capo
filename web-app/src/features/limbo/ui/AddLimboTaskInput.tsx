'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getNewTask } from '@/features/tasks'
import getErrorMessageForTheUser from '@/shared/lib/getErrorMessageForTheUser'
import { Input } from '@/shared/ui/atoms/input'
import { Button } from '@/shared/ui/atoms/button'
import { useLimboQuery } from '../hooks/useLimboQuery'
import { addTaskToLimbo } from '../model/limbo'
import { LIMBO_TASK_LIMIT } from '../model/limboTask'
import { Plus } from 'lucide-react'

const jitter = () => Math.round((Math.random() - 0.5) * 80)

export function AddLimboTaskInput({
	getSpawnPoint,
}: {
	getSpawnPoint: () => { x: number; y: number }
}) {
	const { t } = useTranslation()
	const { limbo, updateLimbo } = useLimboQuery()
	const [text, setText] = useState('')
	const full = limbo.length >= LIMBO_TASK_LIMIT

	const add = () => {
		try {
			const task = getNewTask({ descriptionText: text })
			const spawn = getSpawnPoint()
			updateLimbo(
				addTaskToLimbo({ limbo, task, x: spawn.x + jitter(), y: spawn.y + jitter() })
			)
			setText('')
		} catch (error) {
			toast.error(getErrorMessageForTheUser(error))
		}
	}

	return (
		<div className='fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border bg-background px-2 py-1.5 shadow-lg'>
			<Input
				value={text}
				onChange={(e) => setText(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && add()}
				placeholder={t('limbo.new_task_placeholder')}
				disabled={full}
				title={full ? t('limbo.full_hint') : undefined}
				className={'h-10 w-56 rounded border-0 focus-visible:ring-0 text-black'}
			/>
			<span className={'shrink-0 text-xs opacity-60 text-black'}>
				{t('limbo.counter', { count: limbo.length, max: LIMBO_TASK_LIMIT })}
			</span>
			<Button
				size='sm'
				variant='ghost'
				className='rounded-lg text-black'
				onClick={add}
				disabled={full || !text.trim()}
			>
				<Plus />
			</Button>
		</div>
	)
}
