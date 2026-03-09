import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import { getTrackingEntry } from '@/modules/tracking/application/use-cases/get-tracking-entry'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

export type RefreshMetadataResult =
  | { success: true; refreshed: boolean }
  | { success: false; error: 'not_found' }

export async function refreshMetadata(
  userId: string,
  entryId: string,
  force?: boolean,
): Promise<RefreshMetadataResult> {
  const entry = await getTrackingEntry(userId, entryId)

  if (!entry) {
    return { success: false, error: 'not_found' }
  }

  // Check cooldown: skip if recently synced (unless forced)
  if (!force && entry.lastSyncedAt !== null) {
    const elapsed = Date.now() - entry.lastSyncedAt.getTime()
    if (elapsed < COOLDOWN_MS) {
      return { success: true, refreshed: false }
    }
  }

  // Fetch fresh data from AniList
  const freshData = await anilistAdapter.getMediaById(entry.anilistId)

  if (!freshData) {
    return { success: true, refreshed: false } // Silent failure
  }

  // Update entry with fresh metadata
  await db
    .update(trackingEntries)
    .set({
      titleEnglish: freshData.titleEnglish,
      titleRomaji: freshData.titleRomaji,
      coverImageUrl: freshData.coverImageUrl,
      totalEpisodes: freshData.episodes,
      totalChapters: freshData.chapters,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  return { success: true, refreshed: true }
}
