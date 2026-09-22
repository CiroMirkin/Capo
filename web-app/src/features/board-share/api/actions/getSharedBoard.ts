'use server'

import { headers } from 'next/headers'
import { prisma } from '@/shared/lib/prisma'
import { getSessionUser } from '@/shared/lib/serverAuth'
import { readTaskBoard } from '@/features/tasks/api/readTaskBoard'
import type { TaskBoard } from '@/features/tasks/model/taskBoard'
import type { Theme } from '@/shared/preferences/theme'
import { getShareAccess, withoutNotes, type ShareAccess } from '../../model/boardShare'
import { createRateLimiter } from '../../model/rateLimit'

const hitPublicView = createRateLimiter({ max: 60, windowMs: 60 * 60 * 1000 })

export type SharedBoardResult =
	| { status: Exclude<ShareAccess, 'ok'> | 'rate-limited' }
	| { status: 'ok'; boardName: string; theme: Theme; taskBoard: TaskBoard }

/** Vista de solo lectura para el Invitado. Público no requiere login; email sí. */
export async function getSharedBoard({ token }: { token: string }): Promise<SharedBoardResult> {
	const share = await prisma.boardShare.findUnique({
		where: { token },
		select: {
			mode: true,
			recipientEmail: true,
			active: true,
			board: {
				select: {
					id: true,
					name: true,
					theme: {
						select: {
							id: true,
							bg: true,
							task: true,
							column: true,
							text: true,
							taskText: true,
							columnText: true,
							reminder: true,
						},
					},
				},
			},
		},
	})

	const viewer = share?.mode === 'EMAIL' ? await getSessionUser() : null
	const access = getShareAccess(share, viewer?.email)
	if (access !== 'ok') return { status: access }
	if (!share) return { status: 'not-found' } // inalcanzable: solo narrowing para TS

	if (share.mode === 'PUBLIC') {
		// IP que setea la plataforma (Netlify / Vercel), no falsificable por el cliente.
		// El primer valor de x-forwarded-for sí lo controla el cliente: último recurso.
		const h = await headers()
		const ip =
			h.get('x-nf-client-connection-ip') ??
			h.get('x-real-ip') ??
			(h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown')
		if (!hitPublicView(ip)) return { status: 'rate-limited' }
	}

	const { theme } = share.board
	return {
		status: 'ok',
		boardName: share.board.name,
		// Prisma devuelve `null` en los opcionales; `Theme` los quiere `undefined` (igual que getThemes).
		theme: {
			...theme,
			taskText: theme.taskText ?? undefined,
			columnText: theme.columnText ?? undefined,
			reminder: theme.reminder ?? undefined,
		},
		taskBoard: withoutNotes(await readTaskBoard(share.board.id)),
	}
}
