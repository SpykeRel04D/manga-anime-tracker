import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
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
    // Mock select: entry exists
    const mockSelectWhere = vi.fn().mockResolvedValue([{ id: 'entry-123' }])
    const mockFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    // Mock delete
    const mockDeleteWhere = vi.fn().mockResolvedValue([])
    mockDb.delete.mockReturnValue({ where: mockDeleteWhere } as never)

    const result = await removeEntry('user-123', 'entry-123')

    expect(result).toEqual({ success: true })
  })

  it('returns not_found when no matching row', async () => {
    // Mock select: entry not found
    const mockSelectWhere = vi.fn().mockResolvedValue([])
    const mockFrom = vi.fn().mockReturnValue({ where: mockSelectWhere })
    mockDb.select.mockReturnValue({ from: mockFrom } as never)

    const result = await removeEntry('user-123', 'nonexistent')

    expect(result).toEqual({ success: false, error: 'not_found' })
    expect(mockDb.delete).not.toHaveBeenCalled()
  })
})
