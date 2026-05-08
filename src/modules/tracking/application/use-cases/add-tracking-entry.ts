import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import { computeFranchiseRoot } from '@/modules/tracking/application/use-cases/compute-franchise-root'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

export interface AddTrackingEntryInput {
  anilistId: number
  mediaType: 'anime' | 'manga'
  titleEnglish: string | null
  titleRomaji: string | null
  coverImageUrl: string | null
  totalEpisodes: number | null
  totalChapters: number | null
}

export type AddTrackingEntryResult =
  | { success: true; entryId: string }
  | { success: false; error: 'already_tracked' | 'not_authenticated' }

export async function addTrackingEntry(
  userId: string,
  data: AddTrackingEntryInput,
): Promise<AddTrackingEntryResult> {
  const existing = await db
    .select({ id: trackingEntries.id })
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.userId, userId),
        eq(trackingEntries.anilistId, data.anilistId),
      ),
    )

  if (existing.length > 0) {
    return { success: false, error: 'already_tracked' }
  }

  await db.insert(trackingEntries).values({
    userId,
    anilistId: data.anilistId,
    mediaType: data.mediaType,
    status: 'plan_to_watch',
    titleEnglish: data.titleEnglish,
    titleRomaji: data.titleRomaji,
    coverImageUrl: data.coverImageUrl,
    totalEpisodes: data.totalEpisodes,
    totalChapters: data.totalChapters,
  })

  // Query back for the ID (insert doesn't chain .returning() cleanly with union db type)
  const inserted = await db
    .select({ id: trackingEntries.id })
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.userId, userId),
        eq(trackingEntries.anilistId, data.anilistId),
      ),
    )

  const entryId = inserted[0].id

  // Compute franchise root. On null (rate-limit or fetch failure on the first
  // hop) leave franchiseRootAnilistId NULL so a later backfill can retry.
  try {
    const rootAnilistId = await computeFranchiseRoot({
      anilistId: data.anilistId,
      port: anilistAdapter,
    })
    if (rootAnilistId !== null) {
      await db
        .update(trackingEntries)
        .set({ franchiseRootAnilistId: rootAnilistId })
        .where(eq(trackingEntries.id, entryId))
    }
  } catch {
    // Silent failure — entry stays ungrouped until next refresh.
  }

  return { success: true, entryId }
}
