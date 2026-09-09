import { describe, it, expect } from 'vitest'
import { needsNewUsageSession } from './needsNewUsageSession'
import { DailyUsage } from './usageHistory'

const day = (opts: { start: number; end: number; duration: number }): DailyUsage => ({
	date: opts.start,
	periods: [{ startTimestamp: opts.start, endTimestamp: opts.end, duration: opts.duration }],
})

describe('needsNewUsageSession', () => {
	it('día sin períodos → true', () => {
		expect(needsNewUsageSession({ date: Date.now(), periods: [] })).toBe(true)
	})

	it('mide la inactividad desde endTimestamp, no desde startTimestamp + duration', () => {
		const now = Date.now()
		// La actividad terminó hace 10 min (endTimestamp), pero la sesión acumuló
		// solo 2 min de tiempo activo por pausas cortas: startTimestamp + duration
		// daría "hace 48 min" y cortaría una sesión nueva por error.
		const d = day({ start: now - 50 * 60_000, end: now - 10 * 60_000, duration: 2 * 60_000 })
		expect(needsNewUsageSession(d)).toBe(false)
	})

	it('> 25 min desde el fin de la última actividad → true', () => {
		const now = Date.now()
		const d = day({ start: now - 40 * 60_000, end: now - 30 * 60_000, duration: 10 * 60_000 })
		expect(needsNewUsageSession(d)).toBe(true)
	})
})
