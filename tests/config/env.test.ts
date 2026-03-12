import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getAuthBaseUrl,
  getAuthSecret,
  getDatabaseUrl,
  isProduction,
  isRegistrationAllowed,
} from '@/lib/env'

describe('env helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('detects production mode from NODE_ENV', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(isProduction()).toBe(true)
  })

  it('defaults auth URL to localhost outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(getAuthBaseUrl()).toBe('http://localhost:3000')
  })

  it('requires BETTER_AUTH_URL in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getAuthBaseUrl()).toThrowError('BETTER_AUTH_URL is required in production')
  })

  it('requires BETTER_AUTH_SECRET in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getAuthSecret()).toThrowError(
      'BETTER_AUTH_SECRET is required in production',
    )
  })

  it('requires NEON_DATABASE_URL in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(() => getDatabaseUrl()).toThrowError(
      'NEON_DATABASE_URL is required in production',
    )
  })

  it('requires LOCAL_DATABASE_URL outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(() => getDatabaseUrl()).toThrowError(
      'LOCAL_DATABASE_URL is required for local development',
    )
  })

  it('detects registration override flag', () => {
    vi.stubEnv('ALLOW_REGISTRATION', 'true')
    expect(isRegistrationAllowed()).toBe(true)
  })
})
