import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

export async function getTrackingEntry(
  userId: string,
  entryId: string,
): Promise<TrackingEntry | null> {
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
    return null
  }

  return rows[0] as TrackingEntry
}
