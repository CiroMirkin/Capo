import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveNotes } from './saveNotes'
import { prisma } from '@/shared/lib/prisma'

vi.mock('@/shared/lib/serverAuth', () => ({
	requireBoardAccess: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/shared/lib/prisma', () => ({
	prisma: {
		note: {
			findUnique: vi.fn(),
			upsert: vi.fn().mockResolvedValue(undefined),
		},
	},
}))

describe('saveNotes (server action)', () => {
	beforeEach(() => {
		vi.mocked(prisma.note.findUnique).mockReset()
		vi.mocked(prisma.note.upsert).mockClear()
	})

	it('rechaza vaciar notas existentes sin allowEmpty, sin importar lo que mande el cliente', async () => {
		vi.mocked(prisma.note.findUnique).mockResolvedValue({ content: 'notas reales' } as never)

		await expect(saveNotes({ boardId: 'b1', notes: '' })).rejects.toThrow()
		expect(prisma.note.upsert).not.toHaveBeenCalled()
	})

	it('permite vaciar con allowEmpty (confirmación del usuario o archivado)', async () => {
		vi.mocked(prisma.note.findUnique).mockResolvedValue({ content: 'notas reales' } as never)

		await saveNotes({ boardId: 'b1', notes: '', allowEmpty: true })

		expect(prisma.note.upsert).toHaveBeenCalledTimes(1)
	})

	it('permite guardar contenido no vacío sin consultar el estado previo', async () => {
		await saveNotes({ boardId: 'b1', notes: 'texto nuevo' })

		expect(prisma.note.findUnique).not.toHaveBeenCalled()
		expect(prisma.note.upsert).toHaveBeenCalledTimes(1)
	})

	it('permite vaciar si el tablero nunca tuvo notas', async () => {
		vi.mocked(prisma.note.findUnique).mockResolvedValue(null)

		await saveNotes({ boardId: 'b1', notes: '' })

		expect(prisma.note.upsert).toHaveBeenCalledTimes(1)
	})
})
