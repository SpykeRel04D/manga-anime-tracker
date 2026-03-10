import { and, asc, count, desc, eq, sql } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

export interface GetTrackingListInput {
  userId: string
  status?: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
  mediaType?: 'anime' | 'manga'
  sort?: 'rating' | 'title' | 'date_added'
  page?: number
  perPage?: number
}

export interface GetTrackingListResult {
  entries: TrackingEntry[]
  hasMore: boolean
  total: number
}

export async function getTrackingList(
  input: GetTrackingListInput,
): Promise<GetTrackingListResult> {
  const { userId, status, mediaType, sort = 'date_added', page = 1, perPage = 20 } = input

  // Build where conditions
  const conditions = [eq(trackingEntries.userId, userId)]
  if (status) {
    conditions.push(eq(trackingEntries.status, status))
  }
  if (mediaType) {
    conditions.push(eq(trackingEntries.mediaType, mediaType))
  }
  const whereClause = and(...conditions)

  // Build order by
  let orderByClause
  if (sort === 'rating') {
    orderByClause = desc(trackingEntries.rating)
  } else if (sort === 'title') {
    orderByClause = sql`${trackingEntries.titleEnglish} ASC NULLS LAST`
  } else {
    // date_added (default)
    orderByClause = desc(trackingEntries.createdAt)
  }

  const offset = (page - 1) * perPage

  // Run entries query and count query in parallel
  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(trackingEntries)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(perPage + 1)
      .offset(offset),
    db
      .select({ count: count() })
      .from(trackingEntries)
      .where(whereClause),
  ])

  const hasMore = rows.length > perPage
  const entries = (hasMore ? rows.slice(0, perPage) : rows) as TrackingEntry[]
  const total = Number(countRows[0]?.count ?? 0)

  return { entries, hasMore, total }
}
