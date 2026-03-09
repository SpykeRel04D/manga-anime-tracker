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
    status: 'status',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { updateStatus } from '@/modules/tracking/application/use-cases/update-status'

const mockDb = vi.mocked(db)

describe('updateStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates status and returns success', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.update.mockReturnValue({ set: mockSet } as never)

    const result = await updateStatus('user-123', 'entry-123', 'watching')

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'watching' }),
    )
  })

  it('returns not_found when no matching row', async () => {
    const mockReturning = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.update.mockReturnValue({ set: mockSet } as never)

    const result = await updateStatus('user-123', 'nonexistent', 'completed')

    expect(result).toEqual({ success: false, error: 'not_found' })
  })
})
