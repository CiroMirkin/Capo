'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/shared/ui/atoms/spinner'
import { useWhiteboard } from '../hooks/useWhiteboard'

const WhiteboardSpinner = () => (
	<div className='h-full grid place-items-center'>
		<Spinner size={30} />
	</div>
)

const WhiteboardCanvas = dynamic(() => import('./WhiteboardCanvas'), {
	ssr: false,
	loading: WhiteboardSpinner,
})

export default function Whiteboard() {
	const { scene, isLoading, saveScene } = useWhiteboard()

	return (
		<div className='h-[calc(100dvh-5rem)]'>
			{isLoading || !scene ? (
				<WhiteboardSpinner />
			) : (
				<WhiteboardCanvas scene={scene} onSave={saveScene} />
			)}
		</div>
	)
}
