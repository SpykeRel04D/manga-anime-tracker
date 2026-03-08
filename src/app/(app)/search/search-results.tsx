import type { ReactElement } from 'react'

import type { MediaSearchResult } from '@/modules/tracking/domain/entities/media-search-result'

import { SearchResultCard } from './search-result-card'

interface SearchResultsProps {
  results: MediaSearchResult[]
  query: string
  trackedIds: number[]
}

export function SearchResults({
  results,
  query,
  trackedIds,
}: SearchResultsProps): ReactElement | null {
  if (!query) {
    return null
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">
          No results found for &ldquo;{query}&rdquo;
        </p>
        <p className="text-muted-foreground/70 mt-1 text-xs">
          Check your spelling or try a different term
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map(result => (
        <SearchResultCard
          key={result.id}
          result={result}
          isTracked={trackedIds.includes(result.id)}
        />
      ))}
    </div>
  )
}
