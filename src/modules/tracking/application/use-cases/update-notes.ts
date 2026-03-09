import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type UpdateNotesResult =
  | { success: true }
  | { success: false; error: 'not_found' }

export async function updateNotes(
  userId: string,
  entryId: string,
  notes: string | null,
): Promise<UpdateNotesResult> {
  // Clean empty state: store empty string as null
  const cleanedNotes = notes === '' ? null : notes

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
    .set({ notes: cleanedNotes, updatedAt: new Date() })
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  return { success: true }
}
