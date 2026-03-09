import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type UpdateRatingResult =
  | { success: true }
  | { success: false; error: 'not_found' | 'invalid_rating' }

export async function updateRating(
  userId: string,
  entryId: string,
  rating: number | null,
): Promise<UpdateRatingResult> {
  if (rating !== null && (rating < 1 || rating > 10)) {
    return { success: false, error: 'invalid_rating' }
  }

  const existing = await db
    .select({ id: trackingEntries.id })
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  if (existing.length === 0) {
    return { success: false, error: 'not_found' }
  }

  await db
    .update(trackingEntries)
    .set({ rating, updatedAt: new Date() })
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  return { success: true }
}
