'use server'

import { prisma, Prisma } from '@/shared/lib/prisma'
import { requireBoardAccess } from '@/shared/lib/serverAuth'
import { migrateUsageHistory, UsageHistory } from '../../model/usageHistory'
import { TIME_LIMIT } from '../../model/needsNewUsageSession'
import { foldSessionIntoHistory } from '../../model/foldSessionIntoHistory'
import { hasOpenSession, toOpenSession } from '../../model/currentUsageSession'

const MAX_FLUSH_RETRIES = 3
const SERIALIZATION_FAILURE_CODE = 'P2034'

interface IncrementParams {
	boardId: string
	incrementDuration: number
	now: number
	dayStart: number
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
 * Garantiza que el fold ocurra una sola vez por cierre de sesión sin importar cuántas pestañas/dispositivos compartan el tablero.
 */
async function flushAndRestart(params: IncrementParams, attempt = 0): Promise<void> {
	try {
		await prisma.$transaction(
			async (tx) => {
				const board = await tx.board.findUniqueOrThrow({
					where: { id: params.boardId },
					select: {
						usageHistory: true,
						currentSessionStart: true,
						currentSessionEnd: true,
						currentSessionDuration: true,
						currentSessionDay: true,
					},
				})

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

				const history = migrateUsageHistory(
					(board.usageHistory as unknown as UsageHistory) ?? []
				)
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
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
		)
	} catch (e) {
		if (isSerializationConflict(e) && attempt < MAX_FLUSH_RETRIES) {
			return flushAndRestart(params, attempt + 1)
		}
		throw e
	}
}

function isSerializationConflict(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		(error as { code?: string }).code === SERIALIZATION_FAILURE_CODE
	)
}
