'use server'

import { prisma } from '@/shared/lib/prisma'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { migrateUsageHistory, UsageHistory } from '../../model/usageHistory'
import { TIME_LIMIT } from '../../model/needsNewUsageSession'
import { foldSessionIntoHistory } from '../../model/foldSessionIntoHistory'
import { hasOpenSession, toOpenSession } from '../../model/currentUsageSession'

interface IncrementParams {
	boardId: string
	incrementDuration: number
	now: number
	dayStart: number
}

interface BoardSessionRow {
	usageHistory: unknown
	currentSessionStart: bigint | null
	currentSessionEnd: bigint | null
	currentSessionDuration: number | null
	currentSessionDay: bigint | null
}

export async function incrementUsageSession(params: IncrementParams): Promise<void> {
	await requireBoardAccess(params.boardId)

	const { count } = await prisma.board.updateMany({
		where: {
			id: params.boardId,
			currentSessionEnd: { gte: BigInt(params.now - TIME_LIMIT) },
			currentSessionDay: BigInt(params.dayStart),
		},
		data: {
			currentSessionDuration: { increment: params.incrementDuration },
			currentSessionEnd: BigInt(params.now),
		},
	})

	if (count === 0) {
		await flushAndRestart(params)
	}
}

/**
 * Cierra la sesión abierta (expiración o cambió el día) volcándola a usageHistory y arranca una nueva,
 * si otra pestaña/dispositivo ya la cerró entonces simplemente suma el incremento a la sesión que esa otra ya dejó abierta.
 *
 * FOR UPDATE lockea la fila del tablero: si otra pestaña/dispositivo entra a la vez, espera a que esta transacción termine y ve el estado ya reiniciado, en vez de pisar el fold con uno propio.
 */
async function flushAndRestart(params: IncrementParams): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const [board] = await tx.$queryRaw<BoardSessionRow[]>`
			SELECT "usageHistory", "currentSessionStart", "currentSessionEnd", "currentSessionDuration", "currentSessionDay"
			FROM "Board"
			WHERE id = ${params.boardId}
			FOR UPDATE
		`
		if (!board) throw new Error(`Board no encontrado: ${params.boardId}`)

		const stillNeedsRestart =
			!hasOpenSession(board) ||
			Number(board.currentSessionEnd) < params.now - TIME_LIMIT ||
			Number(board.currentSessionDay) !== params.dayStart

		if (!stillNeedsRestart) {
			await tx.board.update({
				where: { id: params.boardId },
				data: {
					currentSessionDuration: { increment: params.incrementDuration },
					currentSessionEnd: BigInt(params.now),
				},
			})
			return
		}

		const history = migrateUsageHistory((board.usageHistory as unknown as UsageHistory) ?? [])
		const openSession = toOpenSession(board)
		const foldedHistory = openSession
			? foldSessionIntoHistory({
					usageHistory: history,
					session: openSession,
					dayStart: Number(board.currentSessionDay),
				})
			: history

		await tx.board.update({
			where: { id: params.boardId },
			data: {
				usageHistory: foldedHistory as object[],
				currentSessionStart: BigInt(params.now),
				currentSessionEnd: BigInt(params.now),
				currentSessionDuration: params.incrementDuration,
				currentSessionDay: BigInt(params.dayStart),
			},
		})
	})
}
