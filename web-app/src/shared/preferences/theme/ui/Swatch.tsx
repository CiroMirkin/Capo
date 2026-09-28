import { Card, CardContent } from '@/shared/ui/molecules/card'
import { CheckIcon } from '@/shared/ui/atoms/icons'
import { cn } from '@/shared/lib/utils'
import type { Theme } from '../model/themesList'

interface Props {
	theme: Theme
	selected: boolean
	onClick: () => void
}

/** Muestra de un tema: fondo + color de tarea, con check si está elegido. */
export function Swatch({ theme, selected, onClick }: Props) {
	return (
		<button type='button' onClick={onClick} aria-pressed={selected} title={theme.id}>
			<Card
				className={cn(
					'w-[68px] h-[68px] p-3 rounded-md border',
					theme.bg,
					selected ? 'border-black' : 'border-transparent'
				)}
			>
				<CardContent
					className={cn(
						'w-full h-full rounded-md grid place-items-center pb-0',
						theme.task
					)}
				>
					{selected && <CheckIcon className='p-0' />}
				</CardContent>
			</Card>
		</button>
	)
}
