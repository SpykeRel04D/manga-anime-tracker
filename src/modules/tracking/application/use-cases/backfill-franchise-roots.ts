import { and, eq, isNull } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import { computeFranchiseRoot } from '@/modules/tracking/application/use-cases/compute-franchise-root'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

export interface BackfillResult {
  attempted: number
  updated: number
}

export async function backfillFranchiseRoots(
  userId: string,
): Promise<BackfillResult> {
  const rows = await db
    .select({ id: trackingEntries.id, anilistId: trackingEntries.anilistId })
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.userId, userId),
        isNull(trackingEntries.franchiseRootAnilistId),
      ),
    )

  let updated = 0
  for (const row of rows) {
    try {
      const rootAnilistId = await computeFranchiseRoot({
        anilistId: row.anilistId,
        port: anilistAdapter,
      })
      if (rootAnilistId === null) {
        continue // Rate-limited or fetch failed; leave NULL for next retry.
      }
      await db
        .update(trackingEntries)
        .set({ franchiseRootAnilistId: rootAnilistId })
        .where(eq(trackingEntries.id, row.id))
      updated++
    } catch {
      // Skip on failure; next run can retry.
    }
  }

  return { attempted: rows.length, updated }
}
