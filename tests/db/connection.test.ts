import { getTableColumns } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { mediaTypeEnum, trackingEntries, trackingStatusEnum, users } from '@/db/schema'

describe('Drizzle schema exports', () => {
  it('exports users table', () => {
    expect(users).toBeDefined()
  })

  it('exports trackingEntries table', () => {
    expect(trackingEntries).toBeDefined()
  })

  it('exports trackingStatusEnum', () => {
    expect(trackingStatusEnum).toBeDefined()
  })

  it('exports mediaTypeEnum', () => {
    expect(mediaTypeEnum).toBeDefined()
  })
})

describe('users table schema shape', () => {
  const columns = getTableColumns(users)

  it('has id column', () => {
    expect(columns.id).toBeDefined()
  })

  it('has email column', () => {
    expect(columns.email).toBeDefined()
  })

  it('has passwordHash column', () => {
    expect(columns.passwordHash).toBeDefined()
  })

  it('has name column', () => {
    expect(columns.name).toBeDefined()
  })

  it('has createdAt column', () => {
    expect(columns.createdAt).toBeDefined()
  })

  it('has updatedAt column', () => {
    expect(columns.updatedAt).toBeDefined()
  })
})

describe('trackingEntries table schema shape', () => {
  const columns = getTableColumns(trackingEntries)

  it('has id column', () => {
    expect(columns.id).toBeDefined()
  })

  it('has userId column', () => {
    expect(columns.userId).toBeDefined()
  })

  it('has anilistId column', () => {
    expect(columns.anilistId).toBeDefined()
  })

  it('has mediaType column', () => {
    expect(columns.mediaType).toBeDefined()
  })

  it('has status column', () => {
    expect(columns.status).toBeDefined()
  })

  it('has progress column', () => {
    expect(columns.progress).toBeDefined()
  })

  it('has rating column', () => {
    expect(columns.rating).toBeDefined()
  })

  it('has notes column', () => {
    expect(columns.notes).toBeDefined()
  })

  it('has titleEnglish column', () => {
    expect(columns.titleEnglish).toBeDefined()
  })

  it('has titleRomaji column', () => {
    expect(columns.titleRomaji).toBeDefined()
  })

  it('has coverImageUrl column', () => {
    expect(columns.coverImageUrl).toBeDefined()
  })

  it('has totalEpisodes column', () => {
    expect(columns.totalEpisodes).toBeDefined()
  })

  it('has totalChapters column', () => {
    expect(columns.totalChapters).toBeDefined()
  })

  it('has createdAt column', () => {
    expect(columns.createdAt).toBeDefined()
  })

  it('has updatedAt column', () => {
    expect(columns.updatedAt).toBeDefined()
  })
})
