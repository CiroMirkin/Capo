import { getDueDateDisplay } from '../model/task'
import { badgeVariants, badgeSizes } from '@/shared/ui/atoms/badge'
import { cn } from '@/shared/lib/utils'

export function DueDateSlot({
	display,
	open,
}: {
	display: NonNullable<ReturnType<typeof getDueDateDisplay>>
	open: boolean
}) {
	if (open) {
		return (
			<span className='text-sm font-semibold text-black/70 text-right'>
				{display.openLine}
			</span>
		)
	}

	if (display.restingLabel) {
		return (
			<span
				className={cn(
					'inline-flex items-center rounded font-bold whitespace-nowrap tabular-nums shrink-0',
					badgeVariants['gray-subtle'],
					badgeSizes.md
				)}
			>
				{display.restingLabel}
			</span>
		)
	}

	if (display.restingLine) {
		return (
			<span className='text-sm font-semibold text-black/70 text-right'>
				{display.restingLine}
			</span>
		)
	}
	return null
}
