import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

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
  | { success: true }
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

  return { success: true }
}
