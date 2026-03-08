import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock better-auth/cookies before importing proxy
vi.mock('better-auth/cookies', () => ({
  getSessionCookie: vi.fn(),
}))

// Mock next/server
vi.mock('next/server', () => {
  const redirect = vi.fn((url: URL) => ({
    type: 'redirect',
    url: url.toString(),
  }))
  const next = vi.fn(() => ({ type: 'next' }))

  return {
    NextResponse: {
      redirect,
      next,
    },
  }
})

import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse } from 'next/server'

import { proxy } from '@/proxy'

function createMockRequest(pathname: string, baseUrl = 'http://localhost:3000') {
  return {
    nextUrl: {
      pathname,
    },
    url: `${baseUrl}${pathname}`,
  } as Parameters<typeof proxy>[0]
}

describe('proxy route protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('public paths', () => {
    it('allows /login without cookie check', () => {
      const request = createMockRequest('/login')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(getSessionCookie).not.toHaveBeenCalled()
    })

    it('allows /signup without cookie check', () => {
      const request = createMockRequest('/signup')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(getSessionCookie).not.toHaveBeenCalled()
    })

    it('allows /api/auth/* without cookie check', () => {
      const request = createMockRequest('/api/auth/sign-in')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(getSessionCookie).not.toHaveBeenCalled()
    })

    it('allows /api/auth nested paths', () => {
      const request = createMockRequest('/api/auth/sign-up/email')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(getSessionCookie).not.toHaveBeenCalled()
    })
  })

  describe('protected paths without session cookie', () => {
    it('redirects / to /login when no session cookie', () => {
      vi.mocked(getSessionCookie).mockReturnValue(undefined)
      const request = createMockRequest('/')
      const response = proxy(request)
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectCall = vi.mocked(NextResponse.redirect).mock.calls[0]?.[0] as URL
      expect(redirectCall.pathname).toBe('/login')
    })

    it('redirects /my-list to /login when no session cookie', () => {
      vi.mocked(getSessionCookie).mockReturnValue(undefined)
      const request = createMockRequest('/my-list')
      proxy(request)
      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('redirects /search to /login when no session cookie', () => {
      vi.mocked(getSessionCookie).mockReturnValue(undefined)
      const request = createMockRequest('/search')
      proxy(request)
      expect(NextResponse.redirect).toHaveBeenCalled()
    })

    it('redirects arbitrary protected routes to /login', () => {
      vi.mocked(getSessionCookie).mockReturnValue(undefined)
      const request = createMockRequest('/any-route')
      proxy(request)
      expect(NextResponse.redirect).toHaveBeenCalled()
    })
  })

  describe('protected paths with session cookie', () => {
    it('allows / through when session cookie exists', () => {
      vi.mocked(getSessionCookie).mockReturnValue('session-token-value')
      const request = createMockRequest('/')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })

    it('allows /my-list through when session cookie exists', () => {
      vi.mocked(getSessionCookie).mockReturnValue('session-token-value')
      const request = createMockRequest('/my-list')
      proxy(request)
      expect(NextResponse.next).toHaveBeenCalled()
      expect(NextResponse.redirect).not.toHaveBeenCalled()
    })
  })

  describe('matcher config', () => {
    it('exports config with matcher that excludes static assets', async () => {
      const { config } = await import('@/proxy')
      expect(config).toBeDefined()
      expect(config.matcher).toBeDefined()
      expect(config.matcher[0]).toContain('_next/static')
      expect(config.matcher[0]).toContain('_next/image')
      expect(config.matcher[0]).toContain('favicon')
    })
  })
})
