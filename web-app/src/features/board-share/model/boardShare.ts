import BusinessError from '@/shared/errors/businessError'
import type { TaskBoard } from '@/features/tasks/model/taskBoard'

/*
 "Invitado" acá = quien VE un tablero compartido por otro usuario.
 No confundir con el "modo invitado" (usuario sin cuenta, datos en localStorage).
*/

export type ShareMode = 'EMAIL' | 'PUBLIC'

export interface BoardShare {
	id: string
	mode: ShareMode
	token: string
	/** Solo en modo `EMAIL`. */
	recipientEmail: string | null
	active: boolean
}

export const MAX_EMAIL_SHARES = 4

export const normalizeEmail = (email: string): string => email.trim().toLowerCase()

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const assertCanAddEmailShare = (shares: BoardShare[], email: string): void => {
	const normalized = normalizeEmail(email)
	if (!EMAIL_FORMAT.test(normalized)) throw new BusinessError('El email no es válido.')

	const emailShares = shares.filter((s) => s.mode === 'EMAIL')
	if (emailShares.some((s) => s.recipientEmail === normalized))
		throw new BusinessError('Ese email ya está invitado.')
	if (emailShares.length >= MAX_EMAIL_SHARES)
		throw new BusinessError(`Solo se puede invitar hasta ${MAX_EMAIL_SHARES} emails.`)
}

export type ShareAccess = 'ok' | 'not-found' | 'login-required' | 'wrong-account'

/** Inactivo se reporta igual que inexistente, para no revelar que el link existió. */
export const getShareAccess = (
	share: Pick<BoardShare, 'mode' | 'recipientEmail' | 'active'> | null,
	viewerEmail: string | null | undefined
): ShareAccess => {
	if (!share || !share.active) return 'not-found'
	if (share.mode === 'PUBLIC') return 'ok'
	if (!viewerEmail) return 'login-required'
	if (normalizeEmail(viewerEmail) !== share.recipientEmail) return 'wrong-account'
	return 'ok'
}

/** El Invitado nunca ve las notas de las tareas. */
export const withoutNotes = (taskBoard: TaskBoard): TaskBoard =>
	taskBoard.map((column) => ({
		...column,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		tasks: column.tasks.map(({ notesAndComments, ...task }) => task),
	}))
