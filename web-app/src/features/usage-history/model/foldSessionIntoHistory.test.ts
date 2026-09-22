import { describe, test, expect } from 'vitest'
import { foldSessionIntoHistory } from './foldSessionIntoHistory'
import { UsageHistory } from './usageHistory'

const HOUR = 60 * 60 * 1000
// 2026-09-21 00:00 en Argentina (UTC-3) = 03:00 UTC
const DAY_START = Date.UTC(2026, 8, 21, 3)

describe('foldSessionIntoHistory', () => {
	test('crea el primer día cuando el historial está vacío', () => {
		const session = { startTimestamp: 1000, endTimestamp: 5000, duration: 4000 }

		const result = foldSessionIntoHistory({
			usageHistory: [],
			session,
			dayStart: 900,
		})

		expect(result).toEqual([{ date: 900, periods: [session] }])
	})

	test('crea un día nuevo si el último día es anterior a dayStart', () => {
		const session = {
			startTimestamp: DAY_START + HOUR,
			endTimestamp: DAY_START + 2 * HOUR,
			duration: HOUR,
		}

		const usageHistory: UsageHistory = [
			{
				date: DAY_START - 24 * HOUR,
				periods: [{ startTimestamp: 1000, endTimestamp: 4000, duration: 3000 }],
			},
		]
		const originalHistory = structuredClone(usageHistory)

		const result = foldSessionIntoHistory({ usageHistory, session, dayStart: DAY_START })

		expect(result).toEqual([...originalHistory, { date: DAY_START, periods: [session] }])
		expect(usageHistory).toEqual(originalHistory)
	})

	test('agrega la sesión como período nuevo del último día cuando es el mismo día, sin extender el último período', () => {
		const session = { startTimestamp: 8000, endTimestamp: 9000, duration: 1000 }

		const usageHistory: UsageHistory = [
			{
				date: 1000,
				periods: [{ startTimestamp: 1000, endTimestamp: 4000, duration: 3000 }],
			},
		]
		const originalHistory = structuredClone(usageHistory)

		const result = foldSessionIntoHistory({ usageHistory, session, dayStart: 1000 })

		expect(result).toEqual([
			{
				...originalHistory[0],
				periods: [...originalHistory[0].periods, session],
			},
		])
		expect(usageHistory).toEqual(originalHistory)
	})

	test('no duplica el día cuando el date viejo cae al día siguiente en UTC (21:00+ ART)', () => {
		// date guardado como Date.now() a las 22:00 ART del 21/09 = 01:00 UTC del 22/09
		const lateLegacyDate = DAY_START + 22 * HOUR
		const session = {
			startTimestamp: DAY_START + 23 * HOUR,
			endTimestamp: DAY_START + 23.5 * HOUR,
			duration: HOUR / 2,
		}
		const usageHistory: UsageHistory = [
			{
				date: lateLegacyDate,
				periods: [
					{
						startTimestamp: lateLegacyDate,
						endTimestamp: lateLegacyDate,
						duration: 1000,
					},
				],
			},
		]

		const result = foldSessionIntoHistory({ usageHistory, session, dayStart: DAY_START })

		expect(result).toHaveLength(1)
		expect(result[0].periods).toHaveLength(2)
	})
})
