'use client'

import { Layers } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactElement } from 'react'

import type { TrackingListItem } from '@/modules/tracking/application/use-cases/get-tracking-list'

interface SeriesGroupCardProps {
  entry: TrackingListItem
}

export function SeriesGroupCard({ entry }: SeriesGroupCardProps): ReactElement {
  const title = entry.titleEnglish ?? entry.titleRomaji ?? 'Unknown Title'
  const rootAnilistId = entry.franchiseRootAnilistId ?? entry.anilistId

  return (
    <Link
      href={`/tracking/series/${rootAnilistId}`}
      className="group relative block"
    >
      {/* Stacked card layers — visible offsets to communicate "multiple entries" */}
      <div className="border-border bg-muted pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-xl border shadow-sm" />
      <div className="border-border bg-card pointer-events-none absolute inset-0 translate-x-1 translate-y-1 rounded-xl border shadow-sm" />

      <div className="border-border bg-card relative overflow-hidden rounded-xl border shadow-md transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {entry.coverImageUrl ? (
            <Image
              src={entry.coverImageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br p-3">
              <span className="text-muted-foreground line-clamp-3 text-center text-xs">
                {title}
              </span>
            </div>
          )}

          {/* Series badge — top right */}
          <div className="bg-primary text-primary-foreground absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 shadow-md">
            <Layers className="size-3" />
            <span className="text-[11px] font-bold leading-none">
              {entry.childCount}
            </span>
          </div>

          {/* "Series" label — top left */}
          <div className="bg-primary/90 text-primary-foreground absolute top-0 left-0 rounded-br-lg px-2 py-1 backdrop-blur">
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              Series
            </span>
          </div>
        </div>

        <p className="text-foreground line-clamp-2 h-10 p-2 text-xs font-medium">
          {title}
        </p>
      </div>
    </Link>
  )
}
