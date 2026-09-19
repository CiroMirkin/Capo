import { UsageSession } from './usageHistory'

/**
 * Los 4 campos de la sesión abierta en `Board` van juntos
 *  Los 4 son `null` (no hay sesión abierta) o los 4 tienen valor.
 */
export interface BoardSessionFields {
	currentSessionStart: bigint | null
	currentSessionEnd: bigint | null
	currentSessionDuration: number | null
	currentSessionDay: bigint | null
}

type OpenBoardSessionFields = {
	currentSessionStart: bigint
	currentSessionEnd: bigint
	currentSessionDuration: number
	currentSessionDay: bigint
}

export function hasOpenSession(board: BoardSessionFields): board is OpenBoardSessionFields {
	return (
		board.currentSessionStart !== null &&
		board.currentSessionEnd !== null &&
		board.currentSessionDuration !== null &&
		board.currentSessionDay !== null
	)
}

/** Convierte los campos de sesión abierta de `Board` a un `UsageSession` (`null` si no hay ninguna). */
export function toOpenSession(board: BoardSessionFields): UsageSession | null {
	if (!hasOpenSession(board)) return null
	return {
		startTimestamp: Number(board.currentSessionStart),
		endTimestamp: Number(board.currentSessionEnd),
		duration: board.currentSessionDuration,
	}
}
