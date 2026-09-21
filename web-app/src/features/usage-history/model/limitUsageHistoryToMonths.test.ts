import { describe, test, expect } from 'vitest'
import { limitUsageHistoryToMonths } from './limitUsageHistoryToMonths'
import { UsageHistory, DailyUsage } from './usageHistory'

function dayAt(year: number, month: number, dayOfMonth: number): DailyUsage {
	const date = new Date(year, month, dayOfMonth).getTime()
	return { date, periods: [{ startTimestamp: date, endTimestamp: date + 1000, duration: 1000 }] }
}

function monthsFrom2024(count: number): UsageHistory {
	return Array.from({ length: count }, (_, i) => dayAt(2024, i, 1))
}

describe('limitUsageHistoryToMonths', () => {
	test('no cambia nada si hay 14 meses o menos', () => {
		const usageHistory = monthsFrom2024(14)
		const originalHistory = structuredClone(usageHistory)

		const result = limitUsageHistoryToMonths(usageHistory)

		expect(result).toEqual(originalHistory)
		expect(usageHistory).toEqual(originalHistory)
	})

	test('descarta el mes más viejo completo cuando hay 15 meses distintos', () => {
		const usageHistory = monthsFrom2024(15)
		const originalHistory = structuredClone(usageHistory)

		const result = limitUsageHistoryToMonths(usageHistory)

		expect(result).toHaveLength(14)
		expect(result).toEqual(originalHistory.slice(1))
		expect(usageHistory).toEqual(originalHistory)
	})

	test('descarta todas las entradas del mes más viejo, no solo una', () => {
		const oldestMonthEntries = [dayAt(2024, 0, 1), dayAt(2024, 0, 15), dayAt(2024, 0, 28)]
		const usageHistory: UsageHistory = [...oldestMonthEntries, ...monthsFrom2024(15).slice(1)]

		const result = limitUsageHistoryToMonths(usageHistory)

		for (const entry of oldestMonthEntries) {
			expect(result).not.toContainEqual(entry)
		}
		expect(result).toHaveLength(14)
	})

	test('con muchos meses de sobra, descarta todos los que sobran, no solo el primero', () => {
		const usageHistory = monthsFrom2024(20)

		const result = limitUsageHistoryToMonths(usageHistory)

		expect(result).toHaveLength(14)
		expect(result).toEqual(monthsFrom2024(20).slice(6))
	})

	test('respeta un maxMonths custom', () => {
		const usageHistory = monthsFrom2024(5)

		const result = limitUsageHistoryToMonths(usageHistory, 3)

		expect(result).toHaveLength(3)
		expect(result).toEqual(usageHistory.slice(2))
	})
})
