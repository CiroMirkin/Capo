'use client'

import { useLimboQuery } from '../hooks/useLimboQuery'
import { LimboTask } from './LimboTask'
import { LimboEmptyState } from './LimboEmptyState'
import { AddLimboTaskInput } from './AddLimboTaskInput'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../model/limboTask'

// En mobile no hay lienzo visible, pero la posición se usa cuando se ve desde el canvas de PC.
const spawnAtCanvasCenter = () => ({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 })

export function LimboMobileGrid() {
	const { limbo } = useLimboQuery()

	if (limbo.length === 0) {
		return (
			<div className='flex justify-center pt-16'>
				<LimboEmptyState />
				<AddLimboTaskInput getSpawnPoint={spawnAtCanvasCenter} />
			</div>
		)
	}

	return (
		<div className='min-h-[calc(100vh-5rem)] px-12 pb-24 pt-2.5'>
			{limbo.length && (
				<div className='flex flex-col gap-2.5'>
					{limbo.map((task) => (
						<LimboTask key={task.id} task={task} className='w-full' />
					))}
				</div>
			)}
			<AddLimboTaskInput getSpawnPoint={spawnAtCanvasCenter} />
		</div>
	)
}
