'use client'

import type { ReactNode } from 'react'

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

// Better Auth React usa nanostores; no necesita provider. Se mantiene el
// componente como passthrough para no tocar el barrel ni `app/providers.tsx`.
export default function SessionProvider({ children }: { children: ReactNode }) {
	return <>{children}</>
}
