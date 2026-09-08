'use client'

import {
	SessionProvider as NextAuthSessionProvider,
	useSession as useNextAuthSession,
} from 'next-auth/react'
import { createContext, useMemo, type ReactNode } from 'react'

export type SessionUser = {
	id: string
	email?: string | null
	name?: string | null
	image?: string | null
}

export type SessionType = {
	user: SessionUser
	expires: string
} | null

interface SessionContextValue {
	session: SessionType
	isLoading: boolean
	update: ReturnType<typeof useNextAuthSession>['update']
}

export const SessionContext = createContext<SessionContextValue>({
	session: null,
	isLoading: true,
	update: async () => null,
})

function SessionBridge({ children }: { children: ReactNode }) {
	const { data: nextAuthSession, status, update } = useNextAuthSession()
	const isLoading = status === 'loading'

	const session: SessionType = useMemo(
		() =>
			nextAuthSession?.user
				? {
						user: {
							id:
								nextAuthSession.user.id ??
								(() => {
									if (process.env.NODE_ENV !== 'production') {
										console.error(
											'session.user.id ausente: revisar el callback session() en auth.ts'
										)
									}
									return ''
								})(),
							email: nextAuthSession.user.email,
							name: nextAuthSession.user.name,
							image: nextAuthSession.user.image,
						},
						expires: nextAuthSession.expires,
					}
				: null,
		[nextAuthSession]
	)

	const value = useMemo(() => ({ session, isLoading, update }), [session, isLoading, update])

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export default function SessionProvider({ children }: { children: ReactNode }) {
	return (
		<NextAuthSessionProvider>
			<SessionBridge>{children}</SessionBridge>
		</NextAuthSessionProvider>
	)
}
