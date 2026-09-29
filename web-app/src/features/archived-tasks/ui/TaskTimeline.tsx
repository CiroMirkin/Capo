import { format } from '@formkit/tempo'
import { TaskTimelineHistory } from '@/features/tasks'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/hooks/useTheme'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'

interface TaskTimelineProps {
	timelineHistory: TaskTimelineHistory
}

export default function TaskTimeline({ timelineHistory }: TaskTimelineProps) {
	const { t } = useTranslation()
	const timeLine = timelineHistory.map((timeHistory, index) => {
		const date = format(timeHistory.date, 'DD/MM/YY, HH:mm')
		const key = `${timeHistory.date}`
		const columnName = DEFAULT_COLUMN_IDS.includes(timeHistory.columnName)
			? t(`default_columns.${timeHistory.columnName}`)
			: timeHistory.columnName

		return (
			<li key={key} className='flex'>
				<div className='flex flex-col items-center mr-2'>
					<div className='w-2 h-2 bg-black rounded-full relative z-10 mt-1'></div>
					{index < timelineHistory.length - 1 && (
						<div className='w-0.5 flex-1 bg-black mt-1'></div>
					)}
				</div>

				<div className={`text-sm ${index < timelineHistory.length - 1 ? 'pb-4' : ''}`}>
					<span className='font-semibold'>{columnName}</span> - {date}
				</div>
			</li>
		)
	})
	const { column } = useTheme()
	return <ul className={`w-full py-2 px-3 rounded-md ${column}`}>{timeLine}</ul>
}
