import { UsageHistory, UsageSession } from './usageHistory'
import { limitUsageHistoryToMonths } from './limitUsageHistoryToMonths'

const MS_PER_DAY = 24 * 60 * 60 * 1000

interface Params {
	usageHistory: UsageHistory
	session: UsageSession
	dayStart: number
}

/**
 * Agrega una sesión ya cerrada al historial, como período nuevo.
 * La sesión que llega acá ya está completa.
 */
export function foldSessionIntoHistory({ usageHistory, session, dayStart }: Params): UsageHistory {
	const lastDayTracking = usageHistory[usageHistory.length - 1]
	// Corre en el servidor (UTC): se compara contra el dayStart local del cliente, no con getDate()
	const isSameDay =
		!!lastDayTracking &&
		lastDayTracking.date >= dayStart &&
		lastDayTracking.date < dayStart + MS_PER_DAY

	if (!isSameDay) {
		return limitUsageHistoryToMonths([
			...usageHistory,
			{
				date: dayStart,
				periods: [session],
			},
		])
	}

	return limitUsageHistoryToMonths([
		...usageHistory.slice(0, -1),
		{
			...lastDayTracking,
			periods: [...lastDayTracking.periods, session],
		},
	])
}
