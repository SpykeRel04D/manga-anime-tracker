import { headers } from 'next/headers'
import type { ReactElement } from 'react'

import { EmptyState } from '@/components/shared/empty-state'
import { auth } from '@/lib/auth'
import { getStatusCounts } from '@/modules/tracking/application/use-cases/get-status-counts'
import { getTrackingList } from '@/modules/tracking/application/use-cases/get-tracking-list'

import { FilterBar } from './filter-bar'
import { TrackingGrid } from './tracking-grid'

interface HomePageProps {
  searchParams: Promise<{ status?: string; type?: string; sort?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps): Promise<ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() })
  // Layout already handles redirect — session should always exist here
  if (!session) {
    return (
      <main className="mx-auto max-w-7xl">
        <EmptyState title="Not authenticated" description="Please log in to view your collection." />
      </main>
    )
  }

  const params = await searchParams
  const userId = session.user.id

  // Validate and parse URL params
  const rawStatus = params.status
  const validStatus =
    rawStatus === 'watching' ||
    rawStatus === 'completed' ||
    rawStatus === 'on_hold' ||
    rawStatus === 'dropped' ||
    rawStatus === 'plan_to_watch'
      ? (rawStatus as 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch')
      : undefined

  const rawType = params.type
  const validMediaType =
    rawType === 'anime' || rawType === 'manga'
      ? (rawType as 'anime' | 'manga')
      : undefined

  const rawSort = params.sort
  const validSort: 'rating' | 'title' | 'date_added' =
    rawSort === 'rating' || rawSort === 'title' || rawSort === 'date_added'
      ? rawSort
      : 'title'

  const [listResult, statusCounts] = await Promise.all([
    getTrackingList({
      userId,
      status: validStatus,
      mediaType: validMediaType,
      sort: validSort,
      page: 1,
    }),
    getStatusCounts(userId),
  ])

  const { entries, hasMore, total } = listResult
  const hasActiveFilters = Boolean(validStatus ?? validMediaType)
  const totalEntries = Object.values(statusCounts).reduce((sum, n) => sum + n, 0)

  return (
    <main className="mx-auto max-w-7xl">
      <FilterBar statusCounts={statusCounts} />

      {totalEntries === 0 && !hasActiveFilters ? (
        <EmptyState
          title="Your collection is empty"
          description="Start tracking anime and manga from the search page"
          actionLabel="Browse & Search"
          actionHref="/search"
        />
      ) : entries.length === 0 && hasActiveFilters ? (
        <EmptyState
          title="No results"
          description={`No ${validMediaType ?? ''} entries with ${validStatus?.replace(/_/g, ' ') ?? 'any'} status`.trim()}
        />
      ) : (
        <TrackingGrid
          key={`${validStatus}-${validMediaType}-${validSort}`}
          initialEntries={entries}
          initialHasMore={hasMore}
          currentFilters={{
            status: validStatus,
            mediaType: validMediaType,
            sort: validSort,
          }}
        />
      )}
    </main>
  )
}
