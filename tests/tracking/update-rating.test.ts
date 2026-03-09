import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/drizzle', () => ({
  db: {
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

describe('updateRating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets rating to valid integer 1-10', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.update.mockReturnValue({ set: mockSet } as never)

    const result = await updateRating('user-123', 'entry-123', 7)

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 7 }),
    )
  })

  it('sets rating to null (removes rating)', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.update.mockReturnValue({ set: mockSet } as never)

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
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('returns not_found when no matching row', async () => {
    const mockReturning = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.update.mockReturnValue({ set: mockSet } as never)

    const result = await updateRating('user-123', 'nonexistent', 5)

    expect(result).toEqual({ success: false, error: 'not_found' })
  })
})
