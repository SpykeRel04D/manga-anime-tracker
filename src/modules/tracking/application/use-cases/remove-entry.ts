import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type RemoveEntryResult =
  | { success: true }
  | { success: false; error: 'not_found' }

export async function removeEntry(
  userId: string,
  entryId: string,
): Promise<RemoveEntryResult> {
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
    .delete(trackingEntries)
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  return { success: true }
}
