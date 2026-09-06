import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authConfig } from './auth.config'
import { defaultBoard } from '@/features/boards/model/board'

const { auth } = NextAuth(authConfig)

// The guest board without login.
const GUEST_BOARD = `/board/${defaultBoard.id}`

export default auth((req: NextRequest & { auth: unknown }) => {
	const { pathname } = req.nextUrl
	const isAuthenticated = !!req.auth

	if (!isAuthenticated && pathname === '/') {
		return NextResponse.redirect(new URL(GUEST_BOARD, req.url))
	}

	if (isAuthenticated && pathname === '/auth') {
		return NextResponse.redirect(new URL('/', req.url))
	}

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.svg|.*\\.png).*)'],
}
