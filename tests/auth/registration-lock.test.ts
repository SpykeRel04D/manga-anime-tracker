import { afterEach, describe, expect, it, vi } from 'vitest'

import { checkRegistrationOpen } from '@/modules/auth/application/use-cases/check-registration-open'

describe('registration lock logic', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows registration when no users exist', async () => {
    const queryUserCount = vi.fn().mockResolvedValue([])
    const result = await checkRegistrationOpen(queryUserCount)
    expect(result).toBe(true)
  })

  it('blocks registration when a user already exists', async () => {
    const queryUserCount = vi.fn().mockResolvedValue([{ id: 'some-uuid' }])
    const result = await checkRegistrationOpen(queryUserCount)
    expect(result).toBe(false)
  })

  it('allows registration when ALLOW_REGISTRATION=true regardless of existing users', async () => {
    vi.stubEnv('ALLOW_REGISTRATION', 'true')
    const queryUserCount = vi.fn().mockResolvedValue([{ id: 'some-uuid' }])
    const result = await checkRegistrationOpen(queryUserCount)
    expect(result).toBe(true)
  })

  it('does not query the database when ALLOW_REGISTRATION=true', async () => {
    vi.stubEnv('ALLOW_REGISTRATION', 'true')
    const queryUserCount = vi.fn().mockResolvedValue([])
    await checkRegistrationOpen(queryUserCount)
    expect(queryUserCount).not.toHaveBeenCalled()
  })
})
