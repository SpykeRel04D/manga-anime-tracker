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
    status: 'status',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  count: vi.fn(() => ({ type: 'count' })),
}))

import { db } from '@/db/drizzle'
import { getStatusCounts } from '@/modules/tracking/application/use-cases/get-status-counts'

const mockDb = vi.mocked(db)

describe('getStatusCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns count per status grouped from user entries', async () => {
    const rows = [
      { status: 'watching', count: 3 },
      { status: 'completed', count: 10 },
      { status: 'plan_to_watch', count: 5 },
    ]
    const mockGroupBy = vi.fn().mockResolvedValue(rows)
    const mockWhere = vi.fn().mockReturnValue({ groupBy: mockGroupBy })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await getStatusCounts('user-123')

    expect(result).toEqual({
      watching: 3,
      completed: 10,
      plan_to_watch: 5,
    })
  })

  it('returns empty object for user with no entries', async () => {
    const mockGroupBy = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn().mockReturnValue({ groupBy: mockGroupBy })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await getStatusCounts('user-456')

    expect(result).toEqual({})
  })

  it('only counts entries belonging to the given userId', async () => {
    const mockGroupBy = vi.fn().mockResolvedValue([{ status: 'dropped', count: 2 }])
    const mockWhere = vi.fn().mockReturnValue({ groupBy: mockGroupBy })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    await getStatusCounts('user-789')

    expect(mockWhere).toHaveBeenCalledWith(
      expect.objectContaining({ column: 'user_id', value: 'user-789' }),
    )
  })
})
