import { needsNewUsageSession } from '../model/needsNewUsageSession'
import { UsageHistory, UsageDuration } from '../model/usageHistory'
import { isTheSameDay } from '../utils/isTheSameDay'
import { limitUsageHistoryToMonths } from '../model/limitUsageHistoryToMonths'

interface Params {
	duration: UsageDuration
	usageHistory: UsageHistory
}

export function updateDailyUsageRecord({ duration, usageHistory }: Params): UsageHistory {
	const currentTimestamp = Date.now()
	const newPeriod = {
		startTimestamp: currentTimestamp,
		endTimestamp: currentTimestamp,
		duration,
	}

	if (usageHistory.length === 0) {
		return limitUsageHistoryToMonths([
			{
				date: currentTimestamp,
				periods: [{ ...newPeriod }],
			},
		])
	}

	const lastDayTracking = usageHistory[usageHistory.length - 1]
	if (usageHistory.length === 0 || !isTheSameDay(lastDayTracking.date, currentTimestamp)) {
		return limitUsageHistoryToMonths([
			...usageHistory,
			{
				date: currentTimestamp,
				periods: [{ ...newPeriod }],
			},
		])
	}

	if (needsNewUsageSession(lastDayTracking)) {
		return limitUsageHistoryToMonths([
			...usageHistory.slice(0, -1),
			{
				...lastDayTracking,
				periods: [...lastDayTracking.periods, newPeriod],
			},
		])
	}

	const lastPeriod = lastDayTracking.periods[lastDayTracking.periods.length - 1]
	return limitUsageHistoryToMonths([
		...usageHistory.slice(0, -1),
		{
			...lastDayTracking,
			periods: [
				...lastDayTracking.periods.slice(0, -1),
				{
					...lastPeriod,
					duration: lastPeriod.duration + duration,
					endTimestamp: currentTimestamp,
				},
			],
		},
	])
}
