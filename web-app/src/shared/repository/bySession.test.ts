import { describe, it, expect } from 'vitest'
import type { SessionType } from '@/features/auth'
import { bySession } from './bySession'

const sources = { server: () => 'server', local: () => 'local' }

describe('bySession', () => {
	it('sin sesión elige la fuente local', () => {
		expect(bySession(null, sources)).toBe('local')
	})

	it('con sesión elige la del server', () => {
		expect(bySession({ user: { id: 'u1' } } as SessionType, sources)).toBe('server')
	})
})
