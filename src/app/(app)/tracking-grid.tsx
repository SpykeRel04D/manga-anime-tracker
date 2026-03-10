'use client'

import { useEffect, useRef, useTransition } from 'react'
import type { ReactElement } from 'react'
import { useState } from 'react'

import { SkeletonCard } from '@/components/shared/skeleton-card'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

import { fetchTrackingPage } from './actions'
import { TrackingCard } from './tracking-card'

interface CurrentFilters {
  status?: string
  mediaType?: string
  sort?: string
}

interface TrackingGridProps {
  initialEntries: TrackingEntry[]
  initialHasMore: boolean
  currentFilters: CurrentFilters
}

export function TrackingGrid({
  initialEntries,
  initialHasMore,
  currentFilters,
}: TrackingGridProps): ReactElement {
  const [entries, setEntries] = useState<TrackingEntry[]>(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !isPending) {
          startTransition(async () => {
            const result = await fetchTrackingPage({
              status: currentFilters.status,
              mediaType: currentFilters.mediaType,
              sort: currentFilters.sort,
              page: page + 1,
            })
            setEntries(prev => [...prev, ...result.entries])
            setHasMore(result.hasMore)
            setPage(prev => prev + 1)
          })
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [page, hasMore, isPending, currentFilters])

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {entries.map(entry => (
        <TrackingCard key={entry.id} entry={entry} />
      ))}
      {isPending &&
        Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      <div ref={sentinelRef} className="col-span-full h-4" />
    </div>
  )
}
