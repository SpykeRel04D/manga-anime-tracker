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
  const result = await db
    .delete(trackingEntries)
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )
    .returning({ id: trackingEntries.id })

  if (result.length === 0) {
    return { success: false, error: 'not_found' }
  }

  return { success: true }
}
