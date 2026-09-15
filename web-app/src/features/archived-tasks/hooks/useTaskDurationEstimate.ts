import { TaskTimelineHistory, useColumnList } from '@/features/tasks'
import { useUsageHistoryQuery, estimateActiveDuration } from '@/features/usage-history'
import { getTaskDurationBoundaries } from '../model/taskDurationBoundaries'

/**
 * Estimación aproximada de tiempo activo invertido en una tarea, en base al registro de uso del tablero. */
export function useTaskDurationEstimate(timelineHistory: TaskTimelineHistory) {
	const { usageHistory } = useUsageHistoryQuery()
	const columnList = useColumnList()
	const columnNames = columnList.map((column) => column.name)

	const { start, untilLastColumn, untilArchived } = getTaskDurationBoundaries({
		timelineHistory,
		columnNames,
	})

	return {
		untilLastColumn: untilLastColumn
			? estimateActiveDuration({ start, end: untilLastColumn, usageHistory })
			: null,
		untilArchived: estimateActiveDuration({ start, end: untilArchived, usageHistory }),
	}
}
