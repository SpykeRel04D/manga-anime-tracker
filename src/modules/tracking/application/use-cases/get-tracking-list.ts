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
  groupBySeries?: boolean
}

export interface TrackingListItem extends TrackingEntry {
  childCount: number
}

export interface GetTrackingListResult {
  entries: TrackingListItem[]
  hasMore: boolean
  total: number
}

export async function getTrackingList(
  input: GetTrackingListInput,
): Promise<GetTrackingListResult> {
  const {
    userId,
    status,
    mediaType,
    sort = 'date_added',
    page = 1,
    perPage = 20,
    groupBySeries = false,
  } = input

  const conditions = [eq(trackingEntries.userId, userId)]
  if (status) {
    conditions.push(eq(trackingEntries.status, status))
  }
  if (mediaType) {
    conditions.push(eq(trackingEntries.mediaType, mediaType))
  }
  const whereClause = and(...conditions)

  if (groupBySeries) {
    return getGroupedList({ whereClause, sort, page, perPage })
  }

  let orderByClause
  if (sort === 'rating') {
    orderByClause = desc(trackingEntries.rating)
  } else if (sort === 'title') {
    orderByClause = sql`${trackingEntries.titleEnglish} ASC NULLS LAST`
  } else {
    orderByClause = desc(trackingEntries.createdAt)
  }

  const offset = (page - 1) * perPage

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
  const sliced = hasMore ? rows.slice(0, perPage) : rows
  const entries = sliced.map(row => ({
    ...(row as TrackingEntry),
    childCount: 1,
  }))
  const total = Number(countRows[0]?.count ?? 0)

  return { entries, hasMore, total }
}

interface GroupedQueryInput {
  whereClause: ReturnType<typeof and>
  sort: 'rating' | 'title' | 'date_added'
  page: number
  perPage: number
}

async function getGroupedList(
  input: GroupedQueryInput,
): Promise<GetTrackingListResult> {
  const { whereClause, sort, page, perPage } = input

  // Fetch all rows matching the status/mediaType filters; group + paginate in JS.
  // Acceptable trade-off: a single user's collection is small (< few thousand).
  const rows = (await db
    .select()
    .from(trackingEntries)
    .where(whereClause)
    .orderBy(asc(trackingEntries.createdAt))) as TrackingEntry[]

  const groupsMap = new Map<number, TrackingEntry[]>()
  for (const row of rows) {
    const key = row.franchiseRootAnilistId ?? row.anilistId
    const list = groupsMap.get(key)
    if (list) {
      list.push(row)
    } else {
      groupsMap.set(key, [row])
    }
  }

  const groups = Array.from(groupsMap.entries()).map(([groupKey, members]) => {
    const rep =
      members.find(m => m.anilistId === groupKey) ??
      members.slice().sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0]
    return { rep, childCount: members.length, members }
  })

  groups.sort((a, b) => {
    if (sort === 'rating') {
      const ra = a.rep.rating ?? -1
      const rb = b.rep.rating ?? -1
      return rb - ra
    }
    if (sort === 'title') {
      const ta = (a.rep.titleEnglish ?? a.rep.titleRomaji ?? '').toLowerCase()
      const tb = (b.rep.titleEnglish ?? b.rep.titleRomaji ?? '').toLowerCase()
      return ta.localeCompare(tb)
    }
    return b.rep.createdAt.getTime() - a.rep.createdAt.getTime()
  })

  const total = groups.length
  const offset = (page - 1) * perPage
  const slice = groups.slice(offset, offset + perPage)
  const hasMore = offset + perPage < total

  const entries: TrackingListItem[] = slice.map(g => ({
    ...g.rep,
    childCount: g.childCount,
  }))

  return { entries, hasMore, total }
}
