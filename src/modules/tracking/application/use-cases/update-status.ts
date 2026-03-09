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
  const result = await db
    .update(trackingEntries)
    .set({ status, updatedAt: new Date() })
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
