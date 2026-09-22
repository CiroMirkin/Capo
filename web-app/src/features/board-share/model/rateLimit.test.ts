import { describe, it, expect } from 'vitest'
import { createRateLimiter } from './rateLimit'

describe('createRateLimiter', () => {
	it('deja pasar hasta `max` hits por clave dentro de la ventana', () => {
		const hit = createRateLimiter({ max: 2, windowMs: 1000 })
		expect(hit('ip', 0)).toBe(true)
		expect(hit('ip', 10)).toBe(true)
		expect(hit('ip', 20)).toBe(false)
		expect(hit('otra-ip', 20)).toBe(true)
	})

	it('resetea el contador al vencer la ventana', () => {
		const hit = createRateLimiter({ max: 1, windowMs: 1000 })
		expect(hit('ip', 0)).toBe(true)
		expect(hit('ip', 999)).toBe(false)
		expect(hit('ip', 1000)).toBe(true)
	})
})
