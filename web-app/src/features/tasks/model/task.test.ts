import type { TFunction } from 'i18next'
import { format as tempoFormat } from '@formkit/tempo'
import { getDueDateDisplay, isValidDueDate, getNewTask } from './task'
import es from '@/shared/i18n/es.json'

// `t` de juguete: resuelve la clave contra es.json e interpola `{{var}}`.
const t = ((key: string, opts?: Record<string, unknown>) => {
	const value = key.split('.').reduce<unknown>((acc, k) => (acc as never)?.[k], es)
	if (typeof value !== 'string') return key
	return value.replace(/\{\{(\w+)\}\}/g, (_, name) => String(opts?.[name] ?? ''))
}) as unknown as TFunction

const board = (over: Partial<Parameters<typeof getDueDateDisplay>[0]>) =>
	getDueDateDisplay({
		dueDate: '2026-01-10',
		today: '2026-01-01',
		taskPriority: null,
		topPriority: 1,
		isLastColumn: false,
		context: 'board',
		locale: 'es',
		t,
		...over,
	})

describe('isValidDueDate', () => {
	test('acepta hoy y el futuro, rechaza el pasado y los formatos inválidos', () => {
		expect(isValidDueDate('2026-06-15', '2026-06-15')).toBe(true)
		expect(isValidDueDate('2026-06-16', '2026-06-15')).toBe(true)
		expect(isValidDueDate('2026-06-14', '2026-06-15')).toBe(false)
		expect(isValidDueDate('2026-6-1', '2026-01-01')).toBe(false)
		expect(isValidDueDate('2026-02-31', '2026-01-01')).toBe(false)
	})
})

describe('getNewTask con fecha límite', () => {
	test('guarda la fecha válida y rechaza la inválida', () => {
		const today = new Date().getFullYear() + 1 + '-01-01'
		expect(getNewTask({ descriptionText: 'x', dueDate: today }).dueDate).toBe(today)
		expect(() => getNewTask({ descriptionText: 'x', dueDate: '2000-01-01' })).toThrow()
		expect(getNewTask({ descriptionText: 'x' }).dueDate).toBeUndefined()
	})
})

describe('getDueDateDisplay - matriz en reposo (board)', () => {
	test('atrasada y vence hoy: siempre etiqueta', () => {
		expect(board({ dueDate: '2025-12-30' }).restingLabel).toBe('Atrasado')
		expect(board({ dueDate: '2026-01-01' }).restingLabel).toBe('Hoy')
	})

	test('mañana: solo con al menos un tag', () => {
		expect(board({ dueDate: '2026-01-02', taskPriority: null }).restingLabel).toBeNull()
		expect(board({ dueDate: '2026-01-02', taskPriority: 3 }).restingLabel).toBe('Para mañana')
	})

	test('en 2 días: solo con el tag de máxima prioridad', () => {
		expect(
			board({ dueDate: '2026-01-03', taskPriority: 3, topPriority: 1 }).restingLabel
		).toBeNull()
		expect(
			board({ dueDate: '2026-01-03', taskPriority: 1, topPriority: 1 }).restingLabel
		).toBe('En 2 días')
	})

	test('3+ días: sin etiqueta', () => {
		expect(
			board({ dueDate: '2026-01-10', taskPriority: 1, topPriority: 1 }).restingLabel
		).toBeNull()
	})

	test('última columna: sin etiqueta aunque esté atrasada', () => {
		expect(board({ dueDate: '2025-12-01', isLastColumn: true }).restingLabel).toBeNull()
	})

	test('línea expandida: {fecha} | relativo', () => {
		const year = new Date().getFullYear()
		const mid = `${year}-06-10`
		expect(board({ today: mid, dueDate: `${year}-06-11` }).openLine).toBe('11 jun | en 1 día')
		expect(board({ today: mid, dueDate: mid }).openLine).toBe('10 jun | hoy')
		expect(board({ today: mid, dueDate: `${year}-06-07` }).openLine).toBe('7 jun | hace 3 días')
	})
})

describe('getDueDateDisplay - archivo', () => {
	// Igual que en producción: getFullDate() -> format(date, { date: 'full' }).
	const archivedDate = tempoFormat(new Date(2026, 0, 15), { date: 'full' })

	test('veredicto según Terminada vs Vencía', () => {
		const late = getDueDateDisplay({
			dueDate: '2026-01-12',
			today: '2026-02-01',
			taskPriority: null,
			topPriority: 1,
			isLastColumn: true,
			context: 'archive',
			archivedDate,
			locale: 'es',
			t,
		})
		expect(late.restingLabel).toBeNull()
		expect(late.restingLine).toContain('terminada 3 días tarde')
		expect(late.restingLine).toContain('Vencía')
		expect(late.restingLine).toContain('Terminada')
	})
})
