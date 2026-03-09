import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type UpdateProgressResult =
  | { success: true; statusChanged: boolean }
  | { success: false; error: 'not_found' }

export async function updateProgress(
  userId: string,
  entryId: string,
  progress: number,
): Promise<UpdateProgressResult> {
  // First fetch the entry to get total for clamping
  const rows = await db
    .select()
    .from(trackingEntries)
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  if (rows.length === 0) {
    return { success: false, error: 'not_found' }
  }

  const entry = rows[0]
  const total = entry.mediaType === 'anime'
    ? entry.totalEpisodes
    : entry.totalChapters

  // Clamp: min 0, max total (or Infinity if total is null)
  const clamped = Math.max(0, Math.min(progress, total ?? Infinity))

  // Auto-complete: if clamped progress equals total and total is known
  const shouldAutoComplete = total !== null && clamped === total

  const updateData: Record<string, unknown> = {
    progress: clamped,
    updatedAt: new Date(),
  }

  if (shouldAutoComplete) {
    updateData.status = 'completed'
  }

  await db
    .update(trackingEntries)
    .set(updateData)
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )
    .returning({ id: trackingEntries.id })

  return { success: true, statusChanged: shouldAutoComplete }
}
