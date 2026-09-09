import { UsageSession } from '../model/usageHistory'
import { parseDuration } from '../utils/parseDuration'
import { formatTime } from '@/shared/lib/formatTime'

interface PeriodProps {
	period: UsageSession
}

function Period({ period }: PeriodProps) {
	const startTime = formatTime(new Date(period.startTimestamp))
	const endTime = formatTime(new Date(period.startTimestamp + period.duration))
	const duration = parseDuration(period.duration)

	return (
		<li className='pr-4 sm:pr-10 pb-2 border-b border-gray-600 last:border-b-0'>
			<span className='font-semibold whitespace-nowrap'>{`${startTime} - ${endTime}`}</span>
			<div>{duration}</div>
		</li>
	)
}

export default Period
