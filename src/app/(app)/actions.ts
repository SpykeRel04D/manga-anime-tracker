'use server'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { getTrackingList } from '@/modules/tracking/application/use-cases/get-tracking-list'
import type { GetTrackingListResult } from '@/modules/tracking/application/use-cases/get-tracking-list'

interface FetchTrackingPageParams {
  status?: string
  mediaType?: string
  sort?: string
  page: number
}

export async function fetchTrackingPage(
  params: FetchTrackingPageParams,
): Promise<GetTrackingListResult> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { entries: [], hasMore: false, total: 0 }
  }

  const { status, mediaType, sort, page } = params

  const validStatus =
    status === 'watching' ||
    status === 'completed' ||
    status === 'on_hold' ||
    status === 'dropped' ||
    status === 'plan_to_watch'
      ? (status as 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch')
      : undefined

  const validMediaType =
    mediaType === 'anime' || mediaType === 'manga'
      ? (mediaType as 'anime' | 'manga')
      : undefined

  const validSort =
    sort === 'rating' || sort === 'title' || sort === 'date_added'
      ? (sort as 'rating' | 'title' | 'date_added')
      : undefined

  return getTrackingList({
    userId: session.user.id,
    status: validStatus,
    mediaType: validMediaType,
    sort: validSort,
    page,
  })
}
