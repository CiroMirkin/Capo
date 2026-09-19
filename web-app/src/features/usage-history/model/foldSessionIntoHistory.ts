import { UsageHistory, UsageSession } from './usageHistory'
import { isTheSameDay } from '../utils/isTheSameDay'

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

	if (!lastDayTracking || !isTheSameDay(lastDayTracking.date, dayStart)) {
		return [
			...usageHistory,
			{
				date: dayStart,
				periods: [session],
			},
		]
	}

	return [
		...usageHistory.slice(0, -1),
		{
			...lastDayTracking,
			periods: [...lastDayTracking.periods, session],
		},
	]
}
