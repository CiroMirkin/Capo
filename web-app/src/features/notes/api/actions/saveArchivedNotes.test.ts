import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveArchivedNotes } from './saveArchivedNotes'
import { prisma } from '@/shared/lib/prisma'

vi.mock('@/shared/lib/serverAuth', () => ({
	requireBoardAccess: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/shared/lib/prisma', () => ({
	prisma: {
		archive: {
			findUnique: vi.fn(),
			upsert: vi.fn().mockResolvedValue(undefined),
		},
	},
}))

describe('saveArchivedNotes (server action)', () => {
	beforeEach(() => {
		vi.mocked(prisma.archive.findUnique).mockReset()
		vi.mocked(prisma.archive.upsert).mockClear()
	})

	it('rechaza un archivo con menos notas que el ya persistido (no existe feature para borrar)', async () => {
		vi.mocked(prisma.archive.findUnique).mockResolvedValue({
			notes: { archive: [{ id: '1' }, { id: '2' }] },
		} as never)

		await expect(
			saveArchivedNotes({ boardId: 'b1', notes: { archive: [{ id: '1' }] as never } })
		).rejects.toThrow()
		expect(prisma.archive.upsert).not.toHaveBeenCalled()
	})

	it('permite agregar una nota archivada nueva', async () => {
		vi.mocked(prisma.archive.findUnique).mockResolvedValue({
			notes: { archive: [{ id: '1' }] },
		} as never)

		await saveArchivedNotes({
			boardId: 'b1',
			notes: { archive: [{ id: '2' }, { id: '1' }] as never },
		})

		expect(prisma.archive.upsert).toHaveBeenCalledTimes(1)
	})

	it('permite el mismo tamaño (trim FIFO al llegar al tope)', async () => {
		vi.mocked(prisma.archive.findUnique).mockResolvedValue({
			notes: { archive: [{ id: '1' }, { id: '2' }] },
		} as never)

		await saveArchivedNotes({
			boardId: 'b1',
			notes: { archive: [{ id: '3' }, { id: '1' }] as never },
		})

		expect(prisma.archive.upsert).toHaveBeenCalledTimes(1)
	})

	it('permite el primer guardado sobre un tablero sin archivo previo', async () => {
		vi.mocked(prisma.archive.findUnique).mockResolvedValue(null)

		await saveArchivedNotes({ boardId: 'b1', notes: { archive: [{ id: '1' }] as never } })

		expect(prisma.archive.upsert).toHaveBeenCalledTimes(1)
	})
})
