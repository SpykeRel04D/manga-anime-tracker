import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

const publicPaths = ['/login', '/signup', '/api/auth']

export function proxy(request: NextRequest) {
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
