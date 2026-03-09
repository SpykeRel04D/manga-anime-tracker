import { and, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type UpdateStatusResult =
  | { success: true }
  | { success: false; error: 'not_found' }

export async function updateStatus(
  userId: string,
  entryId: string,
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch',
): Promise<UpdateStatusResult> {
  // Check entry exists first (avoids union type issue with .returning() on db)
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
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )

  return { success: true }
}
