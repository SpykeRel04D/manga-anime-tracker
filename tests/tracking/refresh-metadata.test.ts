import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock getTrackingEntry
vi.mock('@/modules/tracking/application/use-cases/get-tracking-entry', () => ({
  getTrackingEntry: vi.fn(),
}))

// Mock the anilist adapter
vi.mock('@/modules/tracking/infrastructure/adapters/anilist-adapter', () => ({
  anilistAdapter: {
    getMediaById: vi.fn(),
  },
}))

// Mock db for the update query
vi.mock('@/db/drizzle', () => ({
  db: {
    update: vi.fn(),
  },
}))

vi.mock('@/db/schema', () => ({
  trackingEntries: {
    id: 'id',
    userId: 'user_id',
    titleEnglish: 'title_english',
    titleRomaji: 'title_romaji',
    coverImageUrl: 'cover_image_url',
    totalEpisodes: 'total_episodes',
    totalChapters: 'total_chapters',
    lastSyncedAt: 'last_synced_at',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { getTrackingEntry } from '@/modules/tracking/application/use-cases/get-tracking-entry'
import { refreshMetadata } from '@/modules/tracking/application/use-cases/refresh-metadata'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

const mockGetEntry = vi.mocked(getTrackingEntry)
const mockAdapter = vi.mocked(anilistAdapter)
const mockDb = vi.mocked(db)

function mockUpdate() {
  const mockReturning = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
  const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
  mockDb.update.mockReturnValue({ set: mockSet } as never)
  return mockSet
}

const freshMediaData = {
  id: 20,
  title: 'Naruto',
  titleEnglish: 'Naruto',
  titleRomaji: 'NARUTO',
  type: 'ANIME' as const,
  status: 'FINISHED',
  episodes: 220,
  chapters: null,
  coverImageUrl: 'https://example.com/new-cover.jpg',
  coverImageColor: null,
}

describe('refreshMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-09T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refreshes when lastSyncedAt is null (never synced)', async () => {
    mockGetEntry.mockResolvedValue({
      id: 'entry-123',
      userId: 'user-123',
      anilistId: 20,
      mediaType: 'anime',
      status: 'watching',
      progress: 5,
      rating: null,
      notes: null,
      titleEnglish: 'Naruto',
      titleRomaji: 'NARUTO',
      coverImageUrl: 'https://example.com/cover.jpg',
      totalEpisodes: 220,
      totalChapters: null,
      lastSyncedAt: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    })

    mockAdapter.getMediaById.mockResolvedValue(freshMediaData)
    mockUpdate()

    const result = await refreshMetadata('user-123', 'entry-123')

    expect(result).toEqual({ success: true, refreshed: true })
    expect(mockAdapter.getMediaById).toHaveBeenCalledWith(20)
  })

  it('refreshes when lastSyncedAt is older than 24 hours', async () => {
    const staleDate = new Date('2026-03-07T12:00:00Z') // 2 days ago

    mockGetEntry.mockResolvedValue({
      id: 'entry-123',
      userId: 'user-123',
      anilistId: 20,
      mediaType: 'anime',
      status: 'watching',
      progress: 5,
      rating: null,
      notes: null,
      titleEnglish: 'Naruto',
      titleRomaji: 'NARUTO',
      coverImageUrl: 'https://example.com/cover.jpg',
      totalEpisodes: 220,
      totalChapters: null,
      lastSyncedAt: staleDate,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    })

    mockAdapter.getMediaById.mockResolvedValue(freshMediaData)
    mockUpdate()

    const result = await refreshMetadata('user-123', 'entry-123')

    expect(result).toEqual({ success: true, refreshed: true })
  })

  it('skips refresh when lastSyncedAt is within 24 hours', async () => {
    const recentDate = new Date('2026-03-09T06:00:00Z') // 6 hours ago

    mockGetEntry.mockResolvedValue({
      id: 'entry-123',
      userId: 'user-123',
      anilistId: 20,
      mediaType: 'anime',
      status: 'watching',
      progress: 5,
      rating: null,
      notes: null,
      titleEnglish: 'Naruto',
      titleRomaji: 'NARUTO',
      coverImageUrl: 'https://example.com/cover.jpg',
      totalEpisodes: 220,
      totalChapters: null,
      lastSyncedAt: recentDate,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    })

    const result = await refreshMetadata('user-123', 'entry-123')

    expect(result).toEqual({ success: true, refreshed: false })
    expect(mockAdapter.getMediaById).not.toHaveBeenCalled()
  })

  it('always refreshes when force=true regardless of cooldown', async () => {
    const recentDate = new Date('2026-03-09T06:00:00Z') // 6 hours ago (within cooldown)

    mockGetEntry.mockResolvedValue({
      id: 'entry-123',
      userId: 'user-123',
      anilistId: 20,
      mediaType: 'anime',
      status: 'watching',
      progress: 5,
      rating: null,
      notes: null,
      titleEnglish: 'Naruto',
      titleRomaji: 'NARUTO',
      coverImageUrl: 'https://example.com/cover.jpg',
      totalEpisodes: 220,
      totalChapters: null,
      lastSyncedAt: recentDate,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    })

    mockAdapter.getMediaById.mockResolvedValue(freshMediaData)
    mockUpdate()

    const result = await refreshMetadata('user-123', 'entry-123', true)

    expect(result).toEqual({ success: true, refreshed: true })
    expect(mockAdapter.getMediaById).toHaveBeenCalledWith(20)
  })

  it('returns refreshed false when AniList fetch fails (silent failure)', async () => {
    mockGetEntry.mockResolvedValue({
      id: 'entry-123',
      userId: 'user-123',
      anilistId: 20,
      mediaType: 'anime',
      status: 'watching',
      progress: 5,
      rating: null,
      notes: null,
      titleEnglish: 'Naruto',
      titleRomaji: 'NARUTO',
      coverImageUrl: 'https://example.com/cover.jpg',
      totalEpisodes: 220,
      totalChapters: null,
      lastSyncedAt: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    })

    mockAdapter.getMediaById.mockResolvedValue(null)

    const result = await refreshMetadata('user-123', 'entry-123')

    expect(result).toEqual({ success: true, refreshed: false })
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('returns not_found when entry does not exist', async () => {
    mockGetEntry.mockResolvedValue(null)

    const result = await refreshMetadata('user-123', 'nonexistent')

    expect(result).toEqual({ success: false, error: 'not_found' })
  })
})
