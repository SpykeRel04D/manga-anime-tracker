'use client'

import { Loader2, Plus } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ReactElement } from 'react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MediaSearchResult } from '@/modules/tracking/domain/entities/media-search-result'

import { addToTrackingList } from './actions'

const STATUS_LABELS: Record<string, string> = {
  FINISHED: 'Finished',
  RELEASING: 'Airing',
  NOT_YET_RELEASED: 'Upcoming',
  CANCELLED: 'Cancelled',
  HIATUS: 'On Hiatus',
}

interface SearchResultCardProps {
  result: MediaSearchResult
  isTracked: boolean
}

export function SearchResultCard({
  result,
  isTracked,
}: SearchResultCardProps): ReactElement {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleAdd(): void {
    startTransition(async () => {
      const response = await addToTrackingList({
        anilistId: result.id,
        mediaType: result.type.toLowerCase() as 'anime' | 'manga',
        titleEnglish: result.titleEnglish,
        titleRomaji: result.titleRomaji,
        coverImageUrl: result.coverImageUrl,
        totalEpisodes: result.episodes,
        totalChapters: result.chapters,
      })

      if (response.success) {
        toast.success(`Added "${result.title}" to your list`)
        router.refresh()
      } else if (response.error === 'already_tracked') {
        toast.info(`"${result.title}" is already in your list`)
        router.refresh()
      } else {
        toast.error('You must be logged in to add items')
      }
    })
  }

  const showRomajiSubtitle =
    result.titleEnglish !== null && result.titleEnglish !== result.titleRomaji

  const statusLabel = STATUS_LABELS[result.status] ?? result.status
  const countLabel =
    result.type === 'ANIME'
      ? result.episodes !== null
        ? `${result.episodes} episodes`
        : null
      : result.chapters !== null
        ? `${result.chapters} chapters`
        : null

  return (
    <div className="border-border bg-card flex gap-4 overflow-hidden rounded-xl border p-3">
      <div className="relative h-[107px] w-[80px] shrink-0 overflow-hidden rounded-md">
        {result.coverImageUrl ? (
          <Image
            src={result.coverImageUrl}
            alt={result.title}
            width={80}
            height={107}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-muted to-muted/60 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <span className="text-muted-foreground text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        <h3 className="text-foreground truncate text-sm font-semibold">{result.title}</h3>

        {showRomajiSubtitle && (
          <p className="text-muted-foreground truncate text-xs">{result.titleRomaji}</p>
        )}

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={
              result.type === 'ANIME'
                ? 'border-chart-3/30 bg-chart-3/20 text-chart-3'
                : 'border-chart-2/30 bg-chart-2/20 text-chart-2'
            }
          >
            {result.type}
          </Badge>
          <span className="text-muted-foreground text-xs">{statusLabel}</span>
        </div>

        {countLabel && <p className="text-muted-foreground text-xs">{countLabel}</p>}

        <div className="mt-auto pt-1">
          {isTracked ? (
            <Badge variant="secondary">Plan to Watch</Badge>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              {isPending ? 'Adding...' : 'Add to list'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
