import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSharedBoard } from './getSharedBoard'
import { prisma } from '@/shared/lib/prisma'
import { getSessionUser } from '@/shared/lib/serverAuth'

vi.mock('next/headers', () => ({
	headers: async () => new Headers({ 'x-forwarded-for': '1.1.1.1, 10.0.0.1' }),
}))
vi.mock('@/shared/lib/serverAuth', () => ({ getSessionUser: vi.fn() }))
vi.mock('@/shared/lib/prisma', () => ({ prisma: { boardShare: { findUnique: vi.fn() } } }))
vi.mock('@/features/tasks/api/readTaskBoard', () => ({
	readTaskBoard: vi.fn().mockResolvedValue([
		{
			id: 'c1',
			status: 'Todo',
			tasks: [{ id: 't1', descriptionText: 'a', notesAndComments: 'secreto' }],
		},
	]),
}))

const theme = { id: 'retro', bg: 'bg', task: 'task', column: 'col', text: 'txt' }
const row = (over = {}) => ({
	mode: 'EMAIL',
	recipientEmail: 'ana@mail.com',
	active: true,
	board: { id: 'b1', name: 'Mi tablero', theme },
	...over,
})

describe('getSharedBoard (server action)', () => {
	beforeEach(() => {
		vi.mocked(getSessionUser).mockReset()
		vi.mocked(prisma.boardShare.findUnique).mockReset()
	})

	it('email: sin login no devuelve nada del tablero', async () => {
		vi.mocked(prisma.boardShare.findUnique).mockResolvedValue(row() as never)
		vi.mocked(getSessionUser).mockResolvedValue(null)

		expect(await getSharedBoard({ token: 'tok' })).toEqual({ status: 'login-required' })
	})

	it('email: con la cuenta invitada devuelve el tablero sin notas', async () => {
		vi.mocked(prisma.boardShare.findUnique).mockResolvedValue(row() as never)
		vi.mocked(getSessionUser).mockResolvedValue({ email: 'ana@mail.com' } as never)

		expect(await getSharedBoard({ token: 'tok' })).toEqual({
			status: 'ok',
			boardName: 'Mi tablero',
			theme,
			taskBoard: [{ id: 'c1', status: 'Todo', tasks: [{ id: 't1', descriptionText: 'a' }] }],
		})
	})

	it('público: corta en la vista 61 de la misma IP', async () => {
		vi.mocked(prisma.boardShare.findUnique).mockResolvedValue(
			row({ mode: 'PUBLIC', recipientEmail: null }) as never
		)
		vi.mocked(getSessionUser).mockResolvedValue(null)

		for (let i = 0; i < 60; i++) {
			expect((await getSharedBoard({ token: 'tok' })).status).toBe('ok')
		}
		expect(await getSharedBoard({ token: 'tok' })).toEqual({ status: 'rate-limited' })
	})
})
