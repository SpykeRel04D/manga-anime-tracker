'use client'

import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import type { MediaDetails } from '@/modules/tracking/domain/entities/media-details'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

interface MediaDetailSectionProps {
  details: MediaDetails
  entry: TrackingEntry
  trackedAnilistIds: Map<number, string>
}

function formatRelationType(relationType: string): string {
  return relationType
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
}

export function MediaDetailSection({
  details,
  entry,
  trackedAnilistIds,
}: MediaDetailSectionProps): ReactElement {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)

  const hasLongDescription =
    details.description !== null && details.description.length > 300

  const totalCount =
    entry.mediaType === 'anime' ? entry.totalEpisodes : entry.totalChapters
  const totalLabel = entry.mediaType === 'anime' ? 'episodes' : 'chapters'

  const studiosOrAuthors: string =
    entry.mediaType === 'anime'
      ? details.studios.map(s => s.name).join(', ')
      : details.staff
          .filter(
            s => s.role.toLowerCase().includes('story') || s.role.toLowerCase().includes('art'),
          )
          .map(s => s.name)
          .join(', ')

  return (
    <div className="flex flex-col gap-5">
      {/* Synopsis */}
      {details.description !== null && (
        <div className="flex flex-col gap-1.5">
          <p
            className={`text-muted-foreground text-sm ${synopsisExpanded ? '' : 'line-clamp-4'}`}
            dangerouslySetInnerHTML={{ __html: details.description }}
          />
          {hasLongDescription && (
            <button
              type="button"
              className="text-primary cursor-pointer self-start text-xs"
              onClick={() => setSynopsisExpanded(prev => !prev)}
            >
              {synopsisExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Metadata pills */}
      {(details.season !== null ||
        details.seasonYear !== null ||
        details.meanScore !== null ||
        totalCount !== null) && (
        <div className="flex flex-wrap gap-1.5">
          {details.season !== null && details.seasonYear !== null && (
            <Badge variant="secondary" className="text-xs">
              {details.season} {details.seasonYear}
            </Badge>
          )}
          {details.meanScore !== null && (
            <Badge variant="secondary" className="text-xs">
              <Star className="size-3" />
              {details.meanScore}%
            </Badge>
          )}
          {totalCount !== null && (
            <Badge variant="secondary" className="text-xs">
              {totalCount} {totalLabel}
            </Badge>
          )}
        </div>
      )}

      {/* Genres */}
      {details.genres.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Genres</span>
          <div className="flex flex-wrap gap-1.5">
            {details.genres.map(genre => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Studios / Authors */}
      {studiosOrAuthors.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs font-medium">
            {entry.mediaType === 'anime' ? 'Studios' : 'Authors'}
          </span>
          <p className="text-foreground text-sm">{studiosOrAuthors}</p>
        </div>
      )}

      {/* Related series */}
      {details.relations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Related</span>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {details.relations.map(relation => {
              const isTracked = trackedAnilistIds.has(relation.id)
              const href = isTracked
                ? `/tracking/${trackedAnilistIds.get(relation.id)}`
                : `https://anilist.co/${relation.type.toLowerCase()}/${relation.id}`
              const linkProps = isTracked
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' }

              return (
                <Link
                  key={`${relation.id}-${relation.relationType}`}
                  href={href}
                  className="flex w-20 shrink-0 flex-col gap-1"
                  {...linkProps}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
                    {relation.coverImageUrl !== null ? (
                      <Image
                        src={relation.coverImageUrl}
                        alt={relation.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
                        <span className="text-muted-foreground text-[10px]">No img</span>
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground text-[10px] capitalize">
                    {formatRelationType(relation.relationType)}
                  </span>
                  <span className="text-foreground line-clamp-2 text-xs leading-tight">
                    {relation.title}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
