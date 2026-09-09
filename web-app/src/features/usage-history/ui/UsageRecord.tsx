import { DailyUsage } from '../model/usageHistory'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/ui/molecules/card'
import { formatDate } from '@/shared/lib/formatDate'
import Period from './Period'
import { useTheme } from '@/shared/hooks/useTheme'
import { parseDuration } from '../utils/parseDuration'
import { isTheSameDay } from '../utils/isTheSameDay'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/utils'

interface UsageRecordProps {
	usageRecord: DailyUsage
}

function UsageRecord({ usageRecord }: UsageRecordProps) {
	const { column, columnText } = useTheme()
	const { t } = useTranslation()
	const date = formatDate(new Date(usageRecord.date))
	let totalDuration = 0
	const periods = [...usageRecord.periods].reverse().map((period) => {
		totalDuration += period.duration
		return <Period key={period.startTimestamp} period={period} />
	})
	const isToday = isTheSameDay(usageRecord.date, Date.now())

	return (
		<Card
			className={cn(
				'w-full md:w-50 pt-4 flex flex-row md:flex-col justify-between md:justify-normal gap-2 rounded-md shadow-sm',
				columnText || 'text-black',
				column
			)}
		>
			<CardHeader className='p-0'>
				<CardTitle className='text-2xl flex items-baseline gap-2'>
					{date}
					{isToday && (
						<span className='text-sm opacity-60'>( {t('usage_history.today')} )</span>
					)}
				</CardTitle>
				<CardDescription className='text-base !m-0' title='Total de tiempo'>
					{parseDuration(totalDuration)}
				</CardDescription>
			</CardHeader>
			<CardContent className='md:mt-4'>
				<ul className='flex flex-col gap-2'>{periods}</ul>
			</CardContent>
		</Card>
	)
}

export default UsageRecord
