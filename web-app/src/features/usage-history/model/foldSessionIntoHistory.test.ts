import { describe, test, expect, beforeEach } from 'vitest'
import { foldSessionIntoHistory } from './foldSessionIntoHistory'
import { UsageHistory } from './usageHistory'
import { isTheSameDay } from '../utils/isTheSameDay'

vi.mock('../utils/isTheSameDay')

describe('foldSessionIntoHistory', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	test('crea el primer día cuando el historial está vacío', () => {
		const session = { startTimestamp: 1000, endTimestamp: 5000, duration: 4000 }

		const result = foldSessionIntoHistory({
			usageHistory: [],
			session,
			dayStart: 900,
		})

		expect(result).toEqual([{ date: 900, periods: [session] }])
	})

	test('crea un día nuevo si el último día no es el mismo que dayStart', () => {
		vi.mocked(isTheSameDay).mockReturnValue(false)
		const session = { startTimestamp: 90000, endTimestamp: 95000, duration: 5000 }

		const usageHistory: UsageHistory = [
			{
				date: 1000,
				periods: [{ startTimestamp: 1000, endTimestamp: 4000, duration: 3000 }],
			},
		]
		const originalHistory = structuredClone(usageHistory)

		const result = foldSessionIntoHistory({ usageHistory, session, dayStart: 90000 })

		expect(result).toEqual([...originalHistory, { date: 90000, periods: [session] }])
		expect(usageHistory).toEqual(originalHistory)
		expect(isTheSameDay).toHaveBeenCalledWith(1000, 90000)
	})

	test('agrega la sesión como período nuevo del último día cuando es el mismo día, sin extender el último período', () => {
		vi.mocked(isTheSameDay).mockReturnValue(true)
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
})
