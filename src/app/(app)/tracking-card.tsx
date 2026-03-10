'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { ReactElement } from 'react'

import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

interface TrackingCardProps {
  entry: TrackingEntry
}

const STATUS_LABELS: Record<TrackingEntry['status'], string> = {
  watching: 'Watching',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
  plan_to_watch: 'Plan to Watch',
}

const STATUS_COLORS: Record<TrackingEntry['status'], string> = {
  watching: 'bg-chart-3',
  completed: 'bg-chart-1',
  on_hold: 'bg-amber-500',
  dropped: 'bg-destructive',
  plan_to_watch: 'bg-muted-foreground',
}

function getProgressPercent(entry: TrackingEntry): number | null {
  const { status, progress, totalEpisodes, totalChapters } = entry

  if (status === 'dropped' || status === 'plan_to_watch') return null
  if (status === 'completed') return 100

  const total = totalEpisodes ?? totalChapters
  if (!total || total === 0) return null

  return Math.min(100, Math.round((progress / total) * 100))
}

export function TrackingCard({ entry }: TrackingCardProps): ReactElement {
  const title = entry.titleEnglish ?? entry.titleRomaji ?? 'Unknown Title'
  const progressPercent = getProgressPercent(entry)

  return (
    <Link
      href={`/tracking/${entry.id}`}
      className="group block"
    >
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm transition-shadow group-hover:shadow-md">
        {/* Cover image area */}
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

          {/* Status badge — corner-integrated, opaque */}
          <div className={`absolute top-0 left-0 rounded-br-lg px-2 py-1 ${STATUS_COLORS[entry.status]}`}>
            <span className="text-[10px] font-semibold text-white">
              {STATUS_LABELS[entry.status]}
            </span>
          </div>

          {/* Progress bar */}
          {progressPercent !== null && (
            <div className="absolute right-0 bottom-0 left-0 h-1 bg-black/30">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Title below cover — fixed height for grid alignment */}
        <p className="text-foreground line-clamp-2 h-10 p-2 text-xs font-medium">
          {title}
        </p>
      </div>
    </Link>
  )
}
