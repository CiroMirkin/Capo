import { estimateActiveDuration } from './estimateActiveDuration'
import { UsageHistory } from './usageHistory'

describe('estimateActiveDuration', () => {
	test('Suma una sesión totalmente dentro del rango.', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 100, endTimestamp: 200, duration: 100 }] },
		]

		const result = estimateActiveDuration({
			start: new Date(0),
			end: new Date(1000),
			usageHistory,
		})

		expect(result).toBe(100)
	})

	test('Ignora una sesión totalmente afuera del rango.', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 2000, endTimestamp: 2100, duration: 100 }] },
		]

		const result = estimateActiveDuration({
			start: new Date(0),
			end: new Date(1000),
			usageHistory,
		})

		expect(result).toBe(0)
	})

	test('Recorta una sesión parcialmente solapada en el borde.', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 800, endTimestamp: 1200, duration: 400 }] },
		]

		const result = estimateActiveDuration({
			start: new Date(0),
			end: new Date(1000),
			usageHistory,
		})

		expect(result).toBe(200)
	})

	test('Suma sesiones de días distintos dentro del mismo rango (caso multi-día).', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 0, endTimestamp: 100, duration: 100 }] },
			{ date: 2, periods: [{ startTimestamp: 90_000, endTimestamp: 90_100, duration: 100 }] },
			{
				date: 3,
				periods: [{ startTimestamp: 180_000, endTimestamp: 180_100, duration: 100 }],
			},
		]

		const result = estimateActiveDuration({
			start: new Date(0),
			end: new Date(200_000),
			usageHistory,
		})

		expect(result).toBe(300)
	})

	test('Da 0 con un rango vacío (start === end).', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 0, endTimestamp: 1000, duration: 1000 }] },
		]

		const result = estimateActiveDuration({
			start: new Date(500),
			end: new Date(500),
			usageHistory,
		})

		expect(result).toBe(0)
	})

	test('Acepta start/end como string ISO (timelineHistory viene de un campo Json sin revivir).', () => {
		const usageHistory: UsageHistory = [
			{ date: 1, periods: [{ startTimestamp: 100, endTimestamp: 200, duration: 100 }] },
		]

		const result = estimateActiveDuration({
			start: new Date(0).toISOString() as unknown as Date,
			end: new Date(1000).toISOString() as unknown as Date,
			usageHistory,
		})

		expect(result).toBe(100)
	})
})
