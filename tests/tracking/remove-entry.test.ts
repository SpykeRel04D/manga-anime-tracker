import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/drizzle', () => ({
  db: {
    delete: vi.fn(),
  },
}))

vi.mock('@/db/schema', () => ({
  trackingEntries: {
    id: 'id',
    userId: 'user_id',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { removeEntry } from '@/modules/tracking/application/use-cases/remove-entry'

const mockDb = vi.mocked(db)

describe('removeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes entry and returns success', async () => {
    const mockReturning = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    mockDb.delete.mockReturnValue({ where: mockWhere } as never)

    const result = await removeEntry('user-123', 'entry-123')

    expect(result).toEqual({ success: true })
  })

  it('returns not_found when no matching row', async () => {
    const mockReturning = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning })
    mockDb.delete.mockReturnValue({ where: mockWhere } as never)

    const result = await removeEntry('user-123', 'nonexistent')

    expect(result).toEqual({ success: false, error: 'not_found' })
  })
})
