'use client'

import { useLimboQuery } from '../hooks/useLimboQuery'
import { LimboTask } from './LimboTask'
import { LimboEmptyState } from './LimboEmptyState'
import { AddLimboTaskInput } from './AddLimboTaskInput'

export function LimboMobileGrid() {
	const { limbo } = useLimboQuery()

	if (limbo.length === 0) {
		return (
			<div className='flex justify-center pt-16'>
				<LimboEmptyState />
				<AddLimboTaskInput getSpawnPoint={() => ({ x: 0, y: 0 })} />
			</div>
		)
	}

	return (
		<div className='min-h-[calc(100vh-5rem)] px-4 pb-24 pt-2'>
			{limbo.length && (
				<div className='flex flex-col gap-2'>
					{limbo.map((task) => (
						<LimboTask key={task.id} task={task} className='w-full' />
					))}
				</div>
			)}
			<AddLimboTaskInput getSpawnPoint={() => ({ x: 0, y: 0 })} />
		</div>
	)
}
