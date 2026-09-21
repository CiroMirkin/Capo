import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteAccount } from './deleteAccount'
import { prisma } from '@/shared/lib/prisma'
import { requireAuth } from '@/shared/lib/serverAuth'

vi.mock('@/shared/lib/serverAuth', () => ({
	requireAuth: vi.fn(),
}))

vi.mock('@/shared/lib/prisma', () => ({
	prisma: {
		user: {
			delete: vi.fn().mockResolvedValue(undefined),
		},
	},
}))

describe('deleteAccount (server action)', () => {
	beforeEach(() => {
		vi.mocked(requireAuth).mockReset()
		vi.mocked(prisma.user.delete).mockClear()
	})

	it('borra al usuario autenticado', async () => {
		vi.mocked(requireAuth).mockResolvedValue('u1')

		await deleteAccount()

		expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } })
	})

	it('no borra nada si no hay sesión válida', async () => {
		vi.mocked(requireAuth).mockRejectedValue(new Error('No autorizado'))

		await expect(deleteAccount()).rejects.toThrow('No autorizado')
		expect(prisma.user.delete).not.toHaveBeenCalled()
	})
})
