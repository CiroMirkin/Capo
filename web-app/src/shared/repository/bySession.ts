import type { SessionType } from '@/features/auth'

/** Elige la fuente del server si hay sesión, y la de localStorage si es un invitado. */
export const bySession = <Server, Local>(
	session: SessionType,
	sources: { server: () => Server; local: () => Local }
): Server | Local => (session ? sources.server() : sources.local())
