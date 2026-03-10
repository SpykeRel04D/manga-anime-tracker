import { count, eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type StatusCounts = Record<string, number>

export async function getStatusCounts(userId: string): Promise<StatusCounts> {
  const rows = await db
    .select({ status: trackingEntries.status, count: count() })
    .from(trackingEntries)
    .where(eq(trackingEntries.userId, userId))
    .groupBy(trackingEntries.status)

  const result: StatusCounts = {}
  for (const row of rows) {
    result[row.status] = Number(row.count)
  }
  return result
}
