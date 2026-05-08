import { describe, expect, it, vi } from 'vitest'

import { computeFranchiseRoot } from '@/modules/tracking/application/use-cases/compute-franchise-root'
import type { MediaRelations } from '@/modules/tracking/domain/entities/media-relations'

function makePort(
  graph: Record<number, MediaRelations | null>,
): { getMediaRelations: ReturnType<typeof vi.fn> } {
  return {
    getMediaRelations: vi.fn(async (id: number) => graph[id] ?? null),
  }
}

describe('computeFranchiseRoot', () => {
  it('returns null when first call fails (rate limit / failure on first hop)', async () => {
    const port = makePort({})

    const root = await computeFranchiseRoot({ anilistId: 100, port })

    expect(root).toBeNull()
  })

  it('returns partial result when fetch fails mid-walk', async () => {
    const port = makePort({
      300: { id: 300, relations: [{ id: 200, relationType: 'PREQUEL' }] },
      // 200 has no entry → returns null mid-walk
    })

    const root = await computeFranchiseRoot({ anilistId: 300, port })

    expect(root).toBe(200)
  })

  it('returns input when no relations exist', async () => {
    const port = makePort({
      100: { id: 100, relations: [] },
    })

    const root = await computeFranchiseRoot({ anilistId: 100, port })

    expect(root).toBe(100)
  })

  it('walks single PREQUEL link', async () => {
    const port = makePort({
      200: { id: 200, relations: [{ id: 100, relationType: 'PREQUEL' }] },
      100: { id: 100, relations: [{ id: 200, relationType: 'SEQUEL' }] },
    })

    const root = await computeFranchiseRoot({ anilistId: 200, port })

    expect(root).toBe(100)
  })

  it('walks chain of PREQUELs to oldest ancestor', async () => {
    const port = makePort({
      300: { id: 300, relations: [{ id: 200, relationType: 'PREQUEL' }] },
      200: {
        id: 200,
        relations: [
          { id: 100, relationType: 'PREQUEL' },
          { id: 300, relationType: 'SEQUEL' },
        ],
      },
      100: { id: 100, relations: [{ id: 200, relationType: 'SEQUEL' }] },
    })

    const root = await computeFranchiseRoot({ anilistId: 300, port })

    expect(root).toBe(100)
  })

  it('falls back to PARENT when no PREQUEL exists', async () => {
    const port = makePort({
      500: { id: 500, relations: [{ id: 400, relationType: 'PARENT' }] },
      400: { id: 400, relations: [] },
    })

    const root = await computeFranchiseRoot({ anilistId: 500, port })

    expect(root).toBe(400)
  })

  it('only follows PARENT once, then stays', async () => {
    const port = makePort({
      500: { id: 500, relations: [{ id: 400, relationType: 'PARENT' }] },
      400: { id: 400, relations: [{ id: 300, relationType: 'PARENT' }] },
    })

    const root = await computeFranchiseRoot({ anilistId: 500, port })

    expect(root).toBe(400)
  })

  it('stops on cycle detection', async () => {
    const port = makePort({
      100: { id: 100, relations: [{ id: 200, relationType: 'PREQUEL' }] },
      200: { id: 200, relations: [{ id: 100, relationType: 'PREQUEL' }] },
    })

    const root = await computeFranchiseRoot({ anilistId: 100, port })

    expect(root).toBe(200)
  })

  it('ignores SIDE_STORY and SPIN_OFF relations', async () => {
    const port = makePort({
      100: {
        id: 100,
        relations: [
          { id: 999, relationType: 'SIDE_STORY' },
          { id: 888, relationType: 'SPIN_OFF' },
        ],
      },
    })

    const root = await computeFranchiseRoot({ anilistId: 100, port })

    expect(root).toBe(100)
  })
})
