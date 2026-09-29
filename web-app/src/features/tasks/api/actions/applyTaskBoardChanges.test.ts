import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applyTaskBoardChanges } from './applyTaskBoardChanges'
import { prisma } from '@/shared/lib/prisma'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import type { TaskBoardChange } from '@/features/tasks/model/taskBoardDiff'

vi.mock('@/shared/lib/serverAuth', () => ({
	requireBoardAccess: vi.fn().mockResolvedValue(undefined),
}))

// `tx` fake: cada método resuelve con defaults "nada ajeno, nada existente" y deja
// registro en `log` para chequear el orden de aplicación.
const log: string[] = []
const fn = (name: string, value?: unknown) =>
	vi.fn(async (args?: unknown) => {
		log.push(name)
		return typeof value === 'function' ? value(args) : value
	})

const tx = {
	column: {
		findFirst: fn('column.findFirst', null),
		count: fn('column.count', 3),
		upsert: fn('column.upsert'),
		update: fn('column.update'),
		create: fn('column.create', { id: 'real-created' }),
		deleteMany: fn('column.deleteMany'),
	},
	task: {
		findFirst: fn('task.findFirst', null),
		upsert: fn('task.upsert'),
		deleteMany: fn('task.deleteMany'),
	},
}

vi.mock('@/shared/lib/prisma', () => ({
	prisma: { $transaction: vi.fn((cb: (t: unknown) => unknown) => cb(tx)) },
}))

const countOwn = (args: unknown, boardColumns: number) =>
	(args as { where: { id?: { in: string[] } } }).where.id?.in.length ?? boardColumns

const upsertTask = (id: string, extra: object = {}): TaskBoardChange => ({
	type: 'upsertTask',
	task: { id, descriptionText: id, ...extra },
	columnId: 'c1',
	order: 0,
})

describe('applyTaskBoardChanges (server action)', () => {
	beforeEach(() => {
		log.length = 0
		vi.mocked(prisma.$transaction).mockClear()
		vi.mocked(requireBoardAccess).mockClear()
		Object.values(tx).forEach((model) => Object.values(model).forEach((m) => m.mockClear()))
		tx.column.findFirst.mockImplementation(async () => null)
		tx.task.findFirst.mockImplementation(async () => null)
		// Por defecto: todos los columnId referenciados son del board; el board tiene 3 columnas.
		tx.column.count.mockImplementation(async (args) => countOwn(args, 3))
	})

	it('chequea acceso al tablero', async () => {
		await applyTaskBoardChanges({ boardId: 'b1', changes: [upsertTask('t1')] })
		expect(requireBoardAccess).toHaveBeenCalledWith('b1')
	})

	it('rechaza una columna de otro board sin escribir nada', async () => {
		tx.column.findFirst.mockImplementation(async (args) =>
			(args as { where: { boardId?: unknown } }).where.boardId ? { id: 'ajena' } : null
		)

		await expect(
			applyTaskBoardChanges({
				boardId: 'b1',
				changes: [{ type: 'upsertColumn', column: { id: 'ajena', name: 'x', order: 0 } }],
			})
		).rejects.toThrow('No autorizado')
		expect(tx.column.upsert).not.toHaveBeenCalled()
	})

	it('rechaza una tarea (o parentId) de otro board sin escribir nada', async () => {
		tx.task.findFirst.mockImplementation(async () => ({ id: 'ajena' }))

		await expect(
			applyTaskBoardChanges({ boardId: 'b1', changes: [upsertTask('t1', { parentId: 'p' })] })
		).rejects.toThrow('No autorizado')
		const where = (tx.task.findFirst.mock.calls[0][0] as { where: { id: { in: string[] } } })
			.where
		expect(where.id.in).toEqual(expect.arrayContaining(['t1', 'p']))
		expect(tx.task.upsert).not.toHaveBeenCalled()
	})

	it('rechaza un columnId de tarea que no es del board', async () => {
		tx.column.count.mockImplementation(async (args) =>
			(args as { where: { id?: unknown } }).where.id ? 0 : 3
		)

		await expect(
			applyTaskBoardChanges({ boardId: 'b1', changes: [upsertTask('t1')] })
		).rejects.toThrow('No autorizado')
		expect(tx.task.upsert).not.toHaveBeenCalled()
	})

	it('los deletes van acotados por boardId', async () => {
		await applyTaskBoardChanges({
			boardId: 'b1',
			changes: [
				{ type: 'deleteTask', taskId: 't1' },
				{ type: 'deleteColumn', columnId: 'c9' },
			],
		})

		expect(tx.task.deleteMany).toHaveBeenCalledWith({
			where: { id: { in: ['t1'] }, column: { boardId: 'b1' } },
		})
		expect(tx.column.deleteMany).toHaveBeenCalledWith({
			where: { id: { in: ['c9'] }, boardId: 'b1' },
		})
	})

	it('resuelve placeholders y usa el id real en los upsertTask', async () => {
		tx.column.findFirst.mockImplementation(async (args) =>
			(args as { where: { order?: number } }).where.order === 1 ? { id: 'real-doing' } : null
		)

		await applyTaskBoardChanges({
			boardId: 'b1',
			changes: [
				{ type: 'upsertColumn', column: { id: 'in_progress', name: 'Doing', order: 1 } },
				{ ...upsertTask('t1'), columnId: 'in_progress' } as TaskBoardChange,
				{ ...upsertTask('t2'), columnId: 'done' } as TaskBoardChange,
			],
		})

		expect(tx.column.update).toHaveBeenCalledWith({
			where: { id: 'real-doing' },
			data: { name: 'Doing', order: 1 },
		})
		expect(tx.column.create).toHaveBeenCalledWith({
			data: { name: 'default_columns.done', order: 2, boardId: 'b1' },
		})
		const columnIds = tx.task.upsert.mock.calls.map(
			(c) => (c[0] as { create: { columnId: string } }).create.columnId
		)
		expect(columnIds).toEqual(['real-doing', 'real-created'])
	})

	it('tope de columnas: rechaza crecer por encima del máximo', async () => {
		let count = 5
		tx.column.count.mockImplementation(async (args) => countOwn(args, count))
		tx.column.upsert.mockImplementation(async () => {
			count++
		})

		await expect(
			applyTaskBoardChanges({
				boardId: 'b1',
				changes: [{ type: 'upsertColumn', column: { id: 'c6', name: 'x', order: 5 } }],
			})
		).rejects.toThrow()
	})

	it('tope de columnas: permite guardar un tablero viejo que ya está por encima', async () => {
		tx.column.count.mockImplementation(async (args) => countOwn(args, 7))

		await expect(
			applyTaskBoardChanges({
				boardId: 'b1',
				changes: [
					{ type: 'upsertColumn', column: { id: 'c2', name: 'renombrada', order: 1 } },
				],
			})
		).resolves.toBeUndefined()
	})

	it('aplica en el orden recibido (padre antes que hija)', async () => {
		await applyTaskBoardChanges({
			boardId: 'b1',
			changes: [upsertTask('padre'), upsertTask('hija', { parentId: 'padre' })],
		})

		const ids = tx.task.upsert.mock.calls.map(
			(c) => (c[0] as { where: { id: string } }).where.id
		)
		expect(ids).toEqual(['padre', 'hija'])
		expect(tx.task.upsert.mock.calls[1][0]).toMatchObject({
			create: { parentId: 'padre', columnId: 'c1', order: 0 },
		})
	})

	it('sin cambios → no abre la transacción', async () => {
		await applyTaskBoardChanges({ boardId: 'b1', changes: [] })
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it.each([
		['type desconocido', [{ type: 'dropBoard' }]],
		['id vacío', [{ type: 'deleteTask', taskId: '' }]],
		[
			'nombre de columna vacío',
			[{ type: 'upsertColumn', column: { id: 'c1', name: '', order: 0 } }],
		],
		['descripción vacía', [upsertTask('t1', { descriptionText: '' })]],
		['order negativo', [{ ...upsertTask('t1'), order: -1 }]],
		['order no entero', [{ ...upsertTask('t1'), order: 1.5 }]],
		['no es array', 'nope'],
		[
			'demasiados cambios',
			Array.from({ length: 1001 }, () => ({ type: 'deleteTask', taskId: 'x' })),
		],
	])('payload inválido (%s) → rechaza antes de abrir la transacción', async (_name, changes) => {
		await expect(
			applyTaskBoardChanges({ boardId: 'b1', changes: changes as TaskBoardChange[] })
		).rejects.toThrow()
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})
})
