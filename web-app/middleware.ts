import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultBoard } from '@/features/boards/model/board'

// The guest board without login.
const GUEST_BOARD = `/board/${defaultBoard.id}`

// Chequeo optimista de cookie (edge-safe, sin DB). La validación real la hacen
// los server guards (serverAuth.ts).
export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	const isAuthenticated = !!getSessionCookie(req)

	if (!isAuthenticated && pathname === '/') {
		return NextResponse.redirect(new URL(GUEST_BOARD, req.url))
	}

	if (isAuthenticated && pathname === '/auth') {
		return NextResponse.redirect(new URL('/', req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts|.*\\.svg|.*\\.png).*)'],
}
