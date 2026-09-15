import { formatTaskDuration } from './formatTaskDuration'

describe('formatTaskDuration', () => {
	test('0 ms da "0h 0m".', () => {
		expect(formatTaskDuration(0)).toBe('0h 0m')
	})

	test('Menos de una hora no muestra días.', () => {
		expect(formatTaskDuration(45 * 60_000)).toBe('0h 45m')
	})

	test('Exactamente 24h pasa a mostrar días.', () => {
		expect(formatTaskDuration(24 * 60 * 60_000)).toBe('1d 0h 0m')
	})

	test('Varios días con horas y minutos.', () => {
		const ms = (2 * 24 * 60 + 3 * 60 + 15) * 60_000
		expect(formatTaskDuration(ms)).toBe('2d 3h 15m')
	})
})
