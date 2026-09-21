import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Chequeo optimista de cookie (edge-safe, sin DB). La validación real la hacen
// los server guards (serverAuth.ts).
export default function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl
	const isAuthenticated = !!getSessionCookie(req)

	if (isAuthenticated && (pathname === '/' || pathname === '/auth')) {
		return NextResponse.redirect(new URL('/dashboard', req.url))
	}

	if (!isAuthenticated && pathname === '/dashboard') {
		return NextResponse.redirect(new URL('/', req.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|monitoring|_next/static|_next/image|favicon.ico|fonts|.*\\.svg|.*\\.png).*)'],
}
