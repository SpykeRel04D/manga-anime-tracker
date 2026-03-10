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

vi.mock('drizzle-orm', () => {
  const nullsLastFn = vi.fn().mockReturnValue({ type: 'nullsLast' })
  const sqlFn = vi.fn().mockReturnValue({ type: 'sql' })
  // Make sql act as a tagged template literal
  const sqlTag = (...args: unknown[]) => sqlFn(...args)
  return {
    eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
    and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
    desc: vi.fn((col: unknown) => ({ type: 'desc', col, nullsLast: nullsLastFn })),
    asc: vi.fn((col: unknown) => ({ type: 'asc', col, nullsLast: nullsLastFn })),
    count: vi.fn(() => ({ type: 'count' })),
    sql: sqlTag,
  }
})

import { db } from '@/db/drizzle'
import {
  type GetTrackingListInput,
  getTrackingList,
} from '@/modules/tracking/application/use-cases/get-tracking-list'

const mockDb = vi.mocked(db)

function makeEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'entry-1',
    userId: 'user-123',
    anilistId: 20,
    mediaType: 'anime' as const,
    status: 'watching' as const,
    progress: 5,
    rating: 8,
    notes: null,
    titleEnglish: 'Naruto',
    titleRomaji: 'NARUTO',
    coverImageUrl: 'https://example.com/cover.jpg',
    totalEpisodes: 220,
    totalChapters: null,
    lastSyncedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function setupListMock(entries: unknown[], total = entries.length) {
  // For the main query chain: select -> from -> where -> orderBy -> limit -> offset -> (resolve)
  const mockOffset = vi.fn().mockResolvedValue(entries)
  const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset })
  const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit })
  const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy })
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })

  // For count query: select -> from -> where -> (resolve)
  const mockCountWhere = vi.fn().mockResolvedValue([{ count: total }])
  const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere })

  let callCount = 0
  mockDb.select.mockImplementation(() => {
    callCount++
    if (callCount === 1) return { from: mockFrom } as never
    return { from: mockCountFrom } as never
  })

  return { mockOffset, mockLimit, mockOrderBy, mockWhere, mockFrom }
}

describe('getTrackingList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns entries, hasMore, and total for a user with entries', async () => {
    const entries = [makeEntry(), makeEntry({ id: 'entry-2' })]
    setupListMock(entries, 2)

    const result = await getTrackingList({ userId: 'user-123' })

    expect(result.entries).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.hasMore).toBe(false)
  })

  it('returns empty entries array when user has no entries', async () => {
    setupListMock([], 0)

    const result = await getTrackingList({ userId: 'user-123' })

    expect(result.entries).toEqual([])
    expect(result.total).toBe(0)
    expect(result.hasMore).toBe(false)
  })

  it('filters by status when status param provided', async () => {
    const entries = [makeEntry({ status: 'watching' })]
    const { mockWhere } = setupListMock(entries, 1)

    const input: GetTrackingListInput = { userId: 'user-123', status: 'watching' }
    await getTrackingList(input)

    expect(mockWhere).toHaveBeenCalled()
    const whereArg = mockWhere.mock.calls[0][0]
    // Should use and() combining userId + status conditions
    expect(whereArg).toHaveProperty('type', 'and')
  })

  it('filters by mediaType when type param provided', async () => {
    const entries = [makeEntry({ mediaType: 'manga' })]
    const { mockWhere } = setupListMock(entries, 1)

    const input: GetTrackingListInput = { userId: 'user-123', mediaType: 'manga' }
    await getTrackingList(input)

    expect(mockWhere).toHaveBeenCalled()
    const whereArg = mockWhere.mock.calls[0][0]
    expect(whereArg).toHaveProperty('type', 'and')
  })

  it('combines status + mediaType filters with AND logic', async () => {
    setupListMock([], 0)

    const input: GetTrackingListInput = {
      userId: 'user-123',
      status: 'completed',
      mediaType: 'anime',
    }
    await getTrackingList(input)

    const { and } = await import('drizzle-orm')
    expect(and).toHaveBeenCalled()
  })

  it('sorts by rating descending when sort=rating', async () => {
    const { mockOrderBy } = setupListMock([makeEntry({ rating: 10 }), makeEntry({ id: 'entry-2', rating: 5 })], 2)

    await getTrackingList({ userId: 'user-123', sort: 'rating' })

    expect(mockOrderBy).toHaveBeenCalled()
    const { desc } = await import('drizzle-orm')
    expect(desc).toHaveBeenCalled()
  })

  it('sorts by title ascending when sort=title', async () => {
    const { mockOrderBy } = setupListMock([makeEntry(), makeEntry({ id: 'e2', titleEnglish: 'Bleach' })], 2)

    await getTrackingList({ userId: 'user-123', sort: 'title' })

    // Verifies orderBy was called (with sql NULLS LAST ordering for title)
    expect(mockOrderBy).toHaveBeenCalled()
  })

  it('sorts by date_added descending by default', async () => {
    const { mockOrderBy } = setupListMock([makeEntry()], 1)

    await getTrackingList({ userId: 'user-123' })

    expect(mockOrderBy).toHaveBeenCalled()
    const { desc } = await import('drizzle-orm')
    expect(desc).toHaveBeenCalled()
  })

  it('returns hasMore=true when more entries exist beyond perPage', async () => {
    // Returning perPage + 1 entries simulates there are more
    const entries = Array.from({ length: 21 }, (_, i) => makeEntry({ id: `entry-${i}` }))
    setupListMock(entries, 50)

    const result = await getTrackingList({ userId: 'user-123', perPage: 20 })

    expect(result.hasMore).toBe(true)
    expect(result.entries).toHaveLength(20) // Sliced to perPage
  })

  it('returns hasMore=false when all entries fit in one page', async () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeEntry({ id: `entry-${i}` }))
    setupListMock(entries, 5)

    const result = await getTrackingList({ userId: 'user-123', perPage: 20 })

    expect(result.hasMore).toBe(false)
    expect(result.entries).toHaveLength(5)
  })

  it('paginates correctly with page parameter', async () => {
    const { mockLimit } = setupListMock([], 0)

    await getTrackingList({ userId: 'user-123', page: 2, perPage: 10 })

    expect(mockLimit).toHaveBeenCalledWith(11) // perPage + 1
    const { offset } = mockLimit.mock.results[0].value
    expect(offset).toHaveBeenCalledWith(10) // (page - 1) * perPage = (2-1)*10 = 10
  })
})
