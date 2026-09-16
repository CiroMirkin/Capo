import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'

export function ColumnsSkeleton() {
	return (
		<div className='h-auto pb-2 px-6 md:px-11 flex flex-wrap justify-stretch lg:justify-center items-start gap-3'>
			{DEFAULT_COLUMN_IDS.map((id) => (
				<ColumnSkeleton key={id} />
			))}
		</div>
	)
}

function ColumnSkeleton() {
	return (
		<div className='p-0 m-0 min-w-48 flex-1 lg:min-w-[252px] lg:max-w-[480px]'>
			<div className='h-auto w-auto flex flex-col gap-2 rounded p-4'>
				<Skeleton height={28} width='60%' />
				{/* 256 = min-h-64, el mismo mínimo que usa el cuerpo de columna real (TaskList.tsx) */}
				<Skeleton height={256} className='mt-2' />
			</div>
		</div>
	)
}
