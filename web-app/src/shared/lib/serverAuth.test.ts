import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, getSessionUser } from './serverAuth'
import { auth } from '@/../auth'

vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }))
vi.mock('@/../auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/shared/lib/prisma', () => ({ prisma: {} }))

const getSession = vi.mocked(auth.api.getSession)
const dbBlip = new Error('Failed to get session')

describe('requireAuth / getSessionUser', () => {
	beforeEach(() => {
		getSession.mockReset()
	})

	it('sin sesión tira No autorizado', async () => {
		getSession.mockResolvedValue(null as never)
		await expect(requireAuth()).rejects.toThrow('No autorizado')
	})

	it('reintenta una vez si getSession falla por un blip de conexión (Sentry 7756334505)', async () => {
		getSession
			.mockRejectedValueOnce(dbBlip)
			.mockResolvedValueOnce({ user: { id: 'u1' } } as never)
		await expect(requireAuth()).resolves.toBe('u1')
	})

	it('si getSession sigue fallando propaga el error real, no lo disfraza de No autorizado', async () => {
		getSession.mockRejectedValue(dbBlip)
		await expect(requireAuth()).rejects.toThrow(dbBlip.message)
		await expect(getSessionUser()).rejects.toThrow(dbBlip.message)
	})
})
