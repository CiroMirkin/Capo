import { DailyUsage } from './usageHistory'

/** Se especifica en milisegundos */
const TIME_LIMIT: number = 1500000 // 25 minutos

/**
 * @description Calcula cuánto tiempo pasó desde el final del último período
 * (`endTimestamp`, hora real de la última actividad) hasta ahora.
 * @returns true si ha pasado mas del limite de tiempo (25 minutos)
 */
export function needsNewUsageSession(lastDayTracking: DailyUsage): boolean {
	if (!lastDayTracking || lastDayTracking.periods.length === 0) {
		return true
	}

	const lastPeriod = lastDayTracking.periods[lastDayTracking.periods.length - 1]
	const lastActivityEndTime = lastPeriod.endTimestamp
	const currentTime = Date.now()
	const inactivityDuration = currentTime - lastActivityEndTime

	return inactivityDuration > TIME_LIMIT
}
