import { format } from '@formkit/tempo'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/utils'
import { weekdays } from '@/shared/lib/weekdays'
import { UsageHistory } from '../model/usageHistory'

interface UsageCalendarProps {
	usageHistory: UsageHistory
}

/**
 * Calendario del mes en curso: un punto por día, relleno en los días con
 * actividad registrada.
 */
export default function UsageCalendar({ usageHistory }: UsageCalendarProps) {
	const { column, columnText } = useTheme()
	const { t, i18n } = useTranslation()

	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	const today = now.getDate()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	// La grilla empieza por el domingo
	const leadingBlanks = new Date(year, month, 1).getDay()

	const activeDays = new Set(
		usageHistory
			.map(({ date }) => new Date(date))
			.filter((d) => d.getFullYear() === year && d.getMonth() === month)
			.map((d) => d.getDate())
	)

	return (
		<Card
			className={cn(
				'w-full pt-3 pb-4 rounded-md border-2 shadow-sm sm:w-fit grid place-items-center',
				column,
				columnText || 'text-black'
			)}
		>
			<CardHeader className='p-0'>
				<CardTitle className='text-2xl capitalize'>
					{format(now, 'MMMM', i18n.language)}
				</CardTitle>
			</CardHeader>
			<CardContent className='mt-4 w-max p-0'>
				<div className='grid grid-cols-7 gap-2.5' aria-hidden='true'>
					{weekdays(i18n.language).map(({ key, label }) => (
						<span
							key={key}
							className='w-3 text-center text-[0.625rem] font-bold leading-none opacity-40'
						>
							{label}
						</span>
					))}
				</div>
				<div
					className='mt-2.5 grid grid-cols-7 gap-2.5'
					role='img'
					aria-label={t('usage_history.calendar_alt', { count: activeDays.size })}
				>
					{Array.from({ length: leadingBlanks }, (_, i) => (
						<span key={`blank-${i}`} className='h-3.5 w-3.5' />
					))}
					{Array.from({ length: daysInMonth }, (_, i) => {
						const day = i + 1
						const active = activeDays.has(day)
						const future = day > today
						return (
							<span
								key={day}
								className={cn(
									'h-3.5 w-3.5 rounded border border-current',
									active && 'bg-current',
									!active && 'opacity-15',
									future && 'opacity-50',
									!active && !future && day === today && 'opacity-60'
								)}
							/>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
