import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/db/schema', () => ({
  trackingEntries: {
    id: 'id',
    userId: 'user_id',
    mediaType: 'media_type',
    status: 'status',
    progress: 'progress',
    totalEpisodes: 'total_episodes',
    totalChapters: 'total_chapters',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { updateProgress } from '@/modules/tracking/application/use-cases/update-progress'

const mockDb = vi.mocked(db)

function mockSelectEntry(entry: Record<string, unknown> | null) {
  const mockWhere = vi.fn().mockResolvedValue(entry ? [entry] : [])
  const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
  mockDb.select.mockReturnValue({ from: mockFrom } as never)
}

function mockUpdate(rowsAffected: number) {
  const mockReturning = vi.fn().mockResolvedValue(
    rowsAffected > 0 ? [{ id: 'entry-123' }] : [],
  )
  const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
  mockDb.update.mockReturnValue({ set: mockSet } as never)
  return mockSet
}

describe('updateProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates progress to valid value', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'anime',
      totalEpisodes: 24,
      totalChapters: null,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', 10)

    expect(result).toEqual({ success: true, statusChanged: false })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 10 }),
    )
  })

  it('clamps progress to 0 minimum for negative values', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'anime',
      totalEpisodes: 24,
      totalChapters: null,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', -5)

    expect(result).toEqual({ success: true, statusChanged: false })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 0 }),
    )
  })

  it('clamps progress to totalEpisodes for anime', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'anime',
      totalEpisodes: 24,
      totalChapters: null,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', 100)

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 24 }),
    )
    // Since 24 === totalEpisodes, auto-complete triggers
    expect(result).toEqual({ success: true, statusChanged: true })
  })

  it('clamps progress to totalChapters for manga', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'manga',
      totalEpisodes: null,
      totalChapters: 200,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', 300)

    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 200 }),
    )
    // Since 200 === totalChapters, auto-complete triggers
    expect(result).toEqual({ success: true, statusChanged: true })
  })

  it('allows any positive value when total is null (ongoing series)', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'anime',
      totalEpisodes: null,
      totalChapters: null,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', 999)

    expect(result).toEqual({ success: true, statusChanged: false })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ progress: 999 }),
    )
  })

  it('auto-completes when progress reaches total', async () => {
    mockSelectEntry({
      id: 'entry-123',
      userId: 'user-123',
      mediaType: 'anime',
      totalEpisodes: 24,
      totalChapters: null,
    })
    const mockSet = mockUpdate(1)

    const result = await updateProgress('user-123', 'entry-123', 24)

    expect(result).toEqual({ success: true, statusChanged: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: 24,
        status: 'completed',
      }),
    )
  })

  it('returns not_found when no matching row', async () => {
    mockSelectEntry(null)

    const result = await updateProgress('user-123', 'nonexistent', 5)

    expect(result).toEqual({ success: false, error: 'not_found' })
  })
})
