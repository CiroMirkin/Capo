'use server'

import { prisma } from '@/shared/lib/prisma'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'
import type { TaskBoardChange } from '@/features/tasks/model/taskBoardDiff'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { isThisBoardWithinTheColumnLimit } from '@/features/tasks/model/taskColumn'

// subirlo si algún tablero viejo, sin tope de columnas, llega a pegarle.
// (5 columnas × 15 tareas × upsert+delete da ~150)
const MAX_CHANGES = 1000

const isNonEmptyString = (value: unknown): value is string =>
	typeof value === 'string' && value.length > 0
const isOrder = (value: unknown) => Number.isInteger(value) && (value as number) >= 0

const isValidChange = (change: unknown): boolean => {
	if (!change || typeof change !== 'object') return false
	const c = change as Record<string, unknown>
	switch (c.type) {
		case 'deleteTask':
			return isNonEmptyString(c.taskId)

		case 'deleteColumn':
			return isNonEmptyString(c.columnId)

		case 'upsertColumn': {
			const column = c.column as Record<string, unknown> | undefined
			return (
				!!column &&
				isNonEmptyString(column.id) &&
				isNonEmptyString(column.name) &&
				isOrder(column.order)
			)
		}

		case 'upsertTask': {
			const task = c.task as Record<string, unknown> | undefined
			return (
				!!task &&
				isNonEmptyString(task.id) &&
				isNonEmptyString(task.descriptionText) &&
				(task.parentId === undefined || isNonEmptyString(task.parentId)) &&
				isNonEmptyString(c.columnId) &&
				isOrder(c.order)
			)
		}

		default:
			return false
	}
}

const isPlaceholder = (columnId: string) => DEFAULT_COLUMN_IDS.includes(columnId)

/**
 * Aplica, en una transacción, el diff que calculó `diffTaskBoard` en el cliente.
 * Los deletes van acotados al board; los ids que se upsertean se verifican contra otros boards antes de escribir.
 */
export async function applyTaskBoardChanges({
	boardId,
	changes,
}: {
	boardId: string
	changes: TaskBoardChange[]
}): Promise<void> {
	if (!Array.isArray(changes) || changes.length > MAX_CHANGES || !changes.every(isValidChange)) {
		throw new Error('Cambios inválidos')
	}

	await requireBoardAccess(boardId)
	if (changes.length === 0) return

	const upsertColumns = changes.flatMap((c) => (c.type === 'upsertColumn' ? [c.column] : []))
	const upsertTasks = changes.flatMap((c) => (c.type === 'upsertTask' ? [c] : []))
	const deleteTaskIds = changes.flatMap((c) => (c.type === 'deleteTask' ? [c.taskId] : []))
	const deleteColumnIds = changes.flatMap((c) => (c.type === 'deleteColumn' ? [c.columnId] : []))
	const batchColumnIds = new Set(upsertColumns.map((column) => column.id))

	const columnIds = [...batchColumnIds].filter((id) => !isPlaceholder(id))
	const taskAndParentIds = [
		...new Set(
			upsertTasks.flatMap(({ task }) => [task.id, ...(task.parentId ? [task.parentId] : [])])
		),
	]

	const referencedColumnIds = [...new Set(upsertTasks.map((c) => c.columnId))].filter(
		(id) => !isPlaceholder(id) && !batchColumnIds.has(id)
	)

	await prisma.$transaction(async (tx) => {
		const [foreignColumn, foreignTask, ownReferencedColumns] = await Promise.all([
			columnIds.length
				? tx.column.findFirst({
						where: {
							id: { in: columnIds },
							boardId: { not: boardId },
						},
						select: { id: true },
					})
				: null,

			taskAndParentIds.length
				? tx.task.findFirst({
						where: {
							id: { in: taskAndParentIds },
							column: { boardId: { not: boardId } },
						},
						select: { id: true },
					})
				: null,

			referencedColumnIds.length
				? tx.column.count({
						where: {
							id: { in: referencedColumnIds },
							boardId,
						},
					})
				: 0,
		])
		if (foreignColumn || foreignTask || ownReferencedColumns !== referencedColumnIds.length) {
			throw new Error('No autorizado')
		}

		const columnCountBefore = await tx.column.count({ where: { boardId } })

		// Placeholders de emptyTaskBoard > fila real por posición (se crea si falta).
		// Con sesión solo llegan si la cache estaba vacía o el tablero no tenía columnas.
		const realColumnIds = new Map<string, string>()
		const resolveColumnId = async (columnId: string, name?: string) => {
			if (!isPlaceholder(columnId)) return columnId
			const known = realColumnIds.get(columnId)
			if (known) return known
			const order = DEFAULT_COLUMN_IDS.indexOf(columnId)
			const existing = await tx.column.findFirst({ where: { boardId, order } })
			const realId =
				existing?.id ??
				(
					await tx.column.create({
						data: { name: name ?? `default_columns.${columnId}`, order, boardId },
					})
				).id
			realColumnIds.set(columnId, realId)
			return realId
		}

		// Mismo orden que emite diffTaskBoard: columnas → deletes de tareas → tareas → deletes de columnas.
		for (const { id, name, order } of upsertColumns) {
			if (isPlaceholder(id)) {
				const realId = await resolveColumnId(id, name)
				await tx.column.update({ where: { id: realId }, data: { name, order } })
			} else {
				await tx.column.upsert({
					where: { id },
					create: { id, name, order, boardId },
					update: { name, order },
				})
			}
		}

		// Borrar algo que ya no existe (otra pestaña ya lo borró)
		if (deleteTaskIds.length) {
			await tx.task.deleteMany({
				where: {
					id: { in: deleteTaskIds },
					column: { boardId },
				},
			})
		}

		// En serie, en el orden recibido el FK de parentId exige que el padre exista antes.
		for (const { task, columnId, order } of upsertTasks) {
			const data = {
				descriptionText: task.descriptionText,
				columnId: await resolveColumnId(columnId),
				order,
				parentId: task.parentId ?? null,
				dueDate: task.dueDate ?? undefined,
				tags: (task.tags as object) ?? undefined,
				notesAndComments: task.notesAndComments ?? undefined,
				timelineHistory: (task.timelineHistory as object) ?? undefined,
			}
			await tx.task.upsert({
				where: { id: task.id },
				create: { id: task.id, ...data },
				update: data,
			})
		}

		// Cascade borra lo que quede adentro; lo que se sacó de ahí ya se movió arriba.
		if (deleteColumnIds.length) {
			await tx.column.deleteMany({
				where: {
					id: { in: deleteColumnIds },
					boardId,
				},
			})
		}

		// Tableros previos al tope pueden tener más columnas: solo se rechaza que crezcan por encima.
		const columnCountAfter = await tx.column.count({ where: { boardId } })
		if (
			!isThisBoardWithinTheColumnLimit(columnCountAfter) &&
			columnCountAfter > columnCountBefore
		)
			throw new Error('El tablero ya tiene el máximo de columnas.')
	})
}
