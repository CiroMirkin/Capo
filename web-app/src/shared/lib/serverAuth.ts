import { headers } from 'next/headers'
import { auth } from '@/../auth'
import { prisma } from '@/shared/lib/prisma'

/*
 Guards de servidor: auth + ownership por fila en una sola llamada.
 Tiran 'No autorizado' / 'Tablero|Columna|Tarea no encontrada'.
 El cliente solo distingue el prefijo.
*/

/**
 Usuario logueado o `null` si no hay sesión
 
 - Si getSession tira (blip de conexión del pooler, p.ej. `server conn crashed?`) reintenta una vez
 - Si vuelve a fallar propaga el error real
*/
export async function getSessionUser() {
	const reqHeaders = await headers()
	const session = await auth.api
		.getSession({ headers: reqHeaders })
		.catch(() => auth.api.getSession({ headers: reqHeaders }))
	return session?.user ?? null
}

export async function requireAuth() {
	const user = await getSessionUser()
	if (!user?.id) throw new Error('No autorizado')
	return user.id
}

export async function requireBoardAccess(boardId: string) {
	const userId = await requireAuth()
	const board = await prisma.board.findUnique({ where: { id: boardId } })
	if (!board) throw new Error('Tablero no encontrado')
	if (board.userId !== userId) throw new Error('No autorizado')

	}
