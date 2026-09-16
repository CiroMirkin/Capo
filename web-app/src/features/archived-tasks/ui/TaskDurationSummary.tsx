import { useTranslation } from 'react-i18next'
import { TaskTimelineHistory } from '@/features/tasks'
import { useTaskDurationEstimate } from '../hooks/useTaskDurationEstimate'
import { formatTaskDuration } from '../model/formatTaskDuration'

interface TaskDurationSummaryProps {
	timelineHistory: TaskTimelineHistory
}

export default function TaskDurationSummary({ timelineHistory }: TaskDurationSummaryProps) {
	const { t } = useTranslation()
	const { untilLastColumn, untilArchived } = useTaskDurationEstimate(timelineHistory)

	// Cada línea se valida y se oculta por separado: sin dato (null) o sin tiempo activo detectado (0)
	const showUntilLastColumn = untilLastColumn !== null && untilLastColumn > 0
	const showUntilArchived = untilArchived > 0

	if (!showUntilLastColumn && !showUntilArchived) return null

	return (
		<div className='text-sm text-black opacity-50 flex flex-col gap-0.5 mb-2'>
			{showUntilLastColumn && (
				<span>
					{t('archive.duration_until_last_column')}: {formatTaskDuration(untilLastColumn)}
				</span>
			)}
			{showUntilArchived && (
				<span>
					{t('archive.duration_until_archived')}: {formatTaskDuration(untilArchived)}
				</span>
			)}
			<span className='text-xs italic'>{t('archive.duration_estimate_disclaimer')}</span>
		</div>
	)
}
