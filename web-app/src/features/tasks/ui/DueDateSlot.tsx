import { getDueDateDisplay } from '../model/task'

export function DueDateSlot({
	display,
	open,
}: {
	display: NonNullable<ReturnType<typeof getDueDateDisplay>>
	open: boolean
}) {
	const text = open ? display.openLine : display.restingLabel ?? display.restingLine
	if (!text) return null

	return (
		<span className='block text-sm font-bold opacity-40 text-black whitespace-nowrap tabular-nums'>
			{text}
		</span>
	)
}
