import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
  },
}))

vi.mock('@/db/schema', () => ({
  trackingEntries: {
    id: 'id',
    userId: 'user_id',
    anilistId: 'anilist_id',
    mediaType: 'media_type',
    status: 'status',
    progress: 'progress',
    rating: 'rating',
    notes: 'notes',
    titleEnglish: 'title_english',
    titleRomaji: 'title_romaji',
    coverImageUrl: 'cover_image_url',
    totalEpisodes: 'total_episodes',
    totalChapters: 'total_chapters',
    lastSyncedAt: 'last_synced_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { getTrackingEntry } from '@/modules/tracking/application/use-cases/get-tracking-entry'

const mockDb = vi.mocked(db)

const mockEntry = {
  id: 'entry-123',
  userId: 'user-123',
  anilistId: 20,
  mediaType: 'anime' as const,
  status: 'watching' as const,
  progress: 5,
  rating: 8,
  notes: 'Great show',
  titleEnglish: 'Naruto',
  titleRomaji: 'NARUTO',
  coverImageUrl: 'https://example.com/cover.jpg',
  totalEpisodes: 220,
  totalChapters: null,
  lastSyncedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

describe('getTrackingEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns entry when found by id and userId', async () => {
    const mockWhere = vi.fn().mockResolvedValue([mockEntry])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await getTrackingEntry('user-123', 'entry-123')

    expect(result).toEqual(mockEntry)
  })

  it('returns null when entry not found', async () => {
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await getTrackingEntry('user-123', 'nonexistent')

    expect(result).toBeNull()
  })

  it('returns null when entry belongs to different user', async () => {
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await getTrackingEntry('other-user', 'entry-123')

    expect(result).toBeNull()
  })
})
