import { and, asc, eq, or, sql } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

export interface GetSeriesCollectionInput {
  userId: string
  rootAnilistId: number
}

export interface GetSeriesCollectionResult {
  entries: TrackingEntry[]
}

export async function getSeriesCollection(
  input: GetSeriesCollectionInput,
): Promise<GetSeriesCollectionResult> {
  const { userId, rootAnilistId } = input

  const rows = await db
    .select()
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.userId, userId),
        or(
          eq(trackingEntries.franchiseRootAnilistId, rootAnilistId),
          eq(trackingEntries.anilistId, rootAnilistId),
        ),
      ),
    )
    .orderBy(
      sql`${trackingEntries.titleEnglish} ASC NULLS LAST`,
      asc(trackingEntries.createdAt),
    )

  return { entries: rows as TrackingEntry[] }
}
