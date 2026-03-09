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
    notes: 'notes',
    updatedAt: 'updated_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col: unknown, val: unknown) => ({ column: _col, value: val })),
  and: vi.fn((...conditions: unknown[]) => ({ type: 'and', conditions })),
}))

import { db } from '@/db/drizzle'
import { updateNotes } from '@/modules/tracking/application/use-cases/update-notes'

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

describe('updateNotes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets notes to text string', async () => {
    mockEntryExists()
    const mockSet = mockUpdate()

    const result = await updateNotes('user-123', 'entry-123', 'Great anime!')

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Great anime!' }),
    )
  })

  it('sets notes to null when empty string provided', async () => {
    mockEntryExists()
    const mockSet = mockUpdate()

    const result = await updateNotes('user-123', 'entry-123', '')

    expect(result).toEqual({ success: true })
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ notes: null }),
    )
  })

  it('returns not_found when no matching row', async () => {
    mockEntryNotFound()

    const result = await updateNotes('user-123', 'nonexistent', 'Some notes')

    expect(result).toEqual({ success: false, error: 'not_found' })
    expect(mockDb.update).not.toHaveBeenCalled()
  })
})
