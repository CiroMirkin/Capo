import { headers } from 'next/headers'
import { auth } from '@/../auth'
import { prisma } from '@/shared/lib/prisma'

/*
 Guards de servidor: auth + ownership por fila en una sola llamada.
 Tiran 'No autorizado' / 'Tablero|Columna|Tarea no encontrada'.
 El cliente solo distingue el prefijo.
*/

export async function requireAuth() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session?.user?.id) throw new Error('No autorizado')
	return session.user.id
}

export async function requireBoardAccess(boardId: string) {
	const userId = await requireAuth()
	const board = await prisma.board.findUnique({ where: { id: boardId } })
	if (!board) throw new Error('Tablero no encontrado')
	if (board.userId !== userId) throw new Error('No autorizado')
}

export async function requireColumnAccess(columnId: string) {
	const userId = await requireAuth()
	const column = await prisma.column.findUnique({
		where: { id: columnId },
		include: { board: { select: { userId: true } } },
	})
	if (!column) throw new Error('Columna no encontrada')
	if (column.board.userId !== userId) throw new Error('No autorizado')
}

export async function requireTaskAccess(taskId: string) {
	const userId = await requireAuth()
	const task = await prisma.task.findUnique({
		where: { id: taskId },
		include: { column: { include: { board: { select: { userId: true } } } } },
	})
	if (!task) throw new Error('Tarea no encontrada')
	if (task.column.board.userId !== userId) throw new Error('No autorizado')
}
