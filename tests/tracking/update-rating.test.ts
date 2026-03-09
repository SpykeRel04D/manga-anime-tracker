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
    rating: 'rating',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { updateRating } from '@/modules/tracking/application/use-cases/update-rating'

const mockDb = vi.mocked(db)

function mockEntryExists(): void {
  const mockSelectWhere = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
  const mockFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
  mockDb.select.mockReturnValue({ from: mockFrom } as never)
}

function mockEntryNotFound(): void {
  const mockSelectWhere = vi.fn().mockResolvedValue([])
  const mockFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
  mockDb.select.mockReturnValue({ from: mockFrom } as never)
}

function mockUpdate(): ReturnType<typeof vi.fn> {
  const mockUpdateWhere = vi.fn().mockResolvedValue([])
  const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere })
  mockDb.update.mockReturnValue({ set: mockSet } as never)
  return mockSet
}

describe('updateRating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets rating to valid integer 1-10', async () => {
    mockEntryExists()
    const mockSet = mockUpdate()

    const result = await updateRating('user-123', 'entry-123', 7)

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 7 }),
    )
  })

  it('sets rating to null (removes rating)', async () => {
    mockEntryExists()
    const mockSet = mockUpdate()

    const result = await updateRating('user-123', 'entry-123', null)

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ rating: null }),
    )
  })

  it('rejects values outside 1-10 range', async () => {
    const result1 = await updateRating('user-123', 'entry-123', 0)
    expect(result1).toEqual({ success: false, error: 'invalid_rating' })

    const result2 = await updateRating('user-123', 'entry-123', 11)
    expect(result2).toEqual({ success: false, error: 'invalid_rating' })

    // Ensure no db call was made
    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('returns not_found when no matching row', async () => {
    mockEntryNotFound()

    const result = await updateRating('user-123', 'nonexistent', 5)

    expect(result).toEqual({ success: false, error: 'not_found' })
    expect(mockDb.update).not.toHaveBeenCalled()
  })
})
