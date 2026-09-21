import { UsageHistory } from './usageHistory'

/** Cantidad máxima de meses calendario distintos que se guardan en el historial. */
export const MAX_MONTHS_STORED = 14

function getMonthKey(date: number): string {
	const d = new Date(date)
	return `${d.getFullYear()}-${d.getMonth()}`
}

/**
 * Descarta por completo el/los meses más viejos cuando se supera el límite (FIFO por mes).
 */
export function limitUsageHistoryToMonths(
	history: UsageHistory,
	maxMonths: number = MAX_MONTHS_STORED
): UsageHistory {
	const monthKeys: string[] = []
	for (const day of history) {
		const key = getMonthKey(day.date)
		if (monthKeys[monthKeys.length - 1] !== key) monthKeys.push(key)
	}

	if (monthKeys.length <= maxMonths) return history

	const monthsToDrop = new Set(monthKeys.slice(0, monthKeys.length - maxMonths))
	return history.filter((day) => !monthsToDrop.has(getMonthKey(day.date)))
}
