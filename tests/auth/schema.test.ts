import { getTableColumns } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { accounts, sessions, verifications } from '@/db/schema'

describe('sessions table schema shape', () => {
  const columns = getTableColumns(sessions)

  it('has id column', () => {
    expect(columns.id).toBeDefined()
  })

  it('has userId column', () => {
    expect(columns.userId).toBeDefined()
  })

  it('has token column', () => {
    expect(columns.token).toBeDefined()
  })

  it('has expiresAt column', () => {
    expect(columns.expiresAt).toBeDefined()
  })

  it('has ipAddress column', () => {
    expect(columns.ipAddress).toBeDefined()
  })

  it('has userAgent column', () => {
    expect(columns.userAgent).toBeDefined()
  })

  it('has createdAt column', () => {
    expect(columns.createdAt).toBeDefined()
  })

  it('has updatedAt column', () => {
    expect(columns.updatedAt).toBeDefined()
  })
})

describe('accounts table schema shape', () => {
  const columns = getTableColumns(accounts)

  it('has id column', () => {
    expect(columns.id).toBeDefined()
  })

  it('has userId column', () => {
    expect(columns.userId).toBeDefined()
  })

  it('has accountId column', () => {
    expect(columns.accountId).toBeDefined()
  })

  it('has providerId column', () => {
    expect(columns.providerId).toBeDefined()
  })

  it('has accessToken column', () => {
    expect(columns.accessToken).toBeDefined()
  })

  it('has refreshToken column', () => {
    expect(columns.refreshToken).toBeDefined()
  })

  it('has idToken column', () => {
    expect(columns.idToken).toBeDefined()
  })

  it('has accessTokenExpiresAt column', () => {
    expect(columns.accessTokenExpiresAt).toBeDefined()
  })

  it('has refreshTokenExpiresAt column', () => {
    expect(columns.refreshTokenExpiresAt).toBeDefined()
  })

  it('has scope column', () => {
    expect(columns.scope).toBeDefined()
  })

  it('has password column', () => {
    expect(columns.password).toBeDefined()
  })

  it('has createdAt column', () => {
    expect(columns.createdAt).toBeDefined()
  })

  it('has updatedAt column', () => {
    expect(columns.updatedAt).toBeDefined()
  })
})

describe('verifications table schema shape', () => {
  const columns = getTableColumns(verifications)

  it('has id column', () => {
    expect(columns.id).toBeDefined()
  })

  it('has identifier column', () => {
    expect(columns.identifier).toBeDefined()
  })

  it('has value column', () => {
    expect(columns.value).toBeDefined()
  })

  it('has expiresAt column', () => {
    expect(columns.expiresAt).toBeDefined()
  })

  it('has createdAt column', () => {
    expect(columns.createdAt).toBeDefined()
  })

  it('has updatedAt column', () => {
    expect(columns.updatedAt).toBeDefined()
  })
})
