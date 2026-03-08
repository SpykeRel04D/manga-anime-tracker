import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the db module before importing the use case
vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

vi.mock('@/db/schema', () => ({
  trackingEntries: { id: 'id', userId: 'user_id', anilistId: 'anilist_id' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import {
  type AddTrackingEntryInput,
  addTrackingEntry,
} from '@/modules/tracking/application/use-cases/add-tracking-entry'

const mockDb = vi.mocked(db)

const validInput: AddTrackingEntryInput = {
  anilistId: 20,
  mediaType: 'anime',
  titleEnglish: 'Naruto',
  titleRomaji: 'NARUTO',
  coverImageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20.jpg',
  totalEpisodes: 220,
  totalChapters: null,
}

describe('addTrackingEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success on successful insert', async () => {
    // Mock: no existing entry found
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    // Mock: successful insert
    const mockValues = vi.fn().mockResolvedValue([])
    mockDb.insert.mockReturnValue({ values: mockValues } as never)

    const result = await addTrackingEntry('user-123', validInput)

    expect(result).toEqual({ success: true })
    expect(mockDb.insert).toHaveBeenCalled()
  })

  it('returns already_tracked error for duplicate entry', async () => {
    // Mock: existing entry found
    const mockWhere = vi.fn().mockResolvedValue([{ id: 'existing-id' }])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await addTrackingEntry('user-123', validInput)

    expect(result).toEqual({ success: false, error: 'already_tracked' })
    expect(mockDb.insert).not.toHaveBeenCalled()
  })

  it('passes correct fields to insert', async () => {
    // Mock: no existing entry found
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    // Mock: successful insert - capture the values
    const mockValues = vi.fn().mockResolvedValue([])
    mockDb.insert.mockReturnValue({ values: mockValues } as never)

    await addTrackingEntry('user-123', validInput)

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        anilistId: 20,
        mediaType: 'anime',
        titleEnglish: 'Naruto',
        titleRomaji: 'NARUTO',
        coverImageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20.jpg',
        totalEpisodes: 220,
        totalChapters: null,
        status: 'plan_to_watch',
      }),
    )
  })

  it('uses plan_to_watch status for manga as well', async () => {
    const mangaInput: AddTrackingEntryInput = {
      ...validInput,
      mediaType: 'manga',
      totalEpisodes: null,
      totalChapters: 700,
    }

    // Mock: no existing entry found
    const mockWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const mockValues = vi.fn().mockResolvedValue([])
    mockDb.insert.mockReturnValue({ values: mockValues } as never)

    await addTrackingEntry('user-123', mangaInput)

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaType: 'manga',
        status: 'plan_to_watch',
      }),
    )
  })
})
