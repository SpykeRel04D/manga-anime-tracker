import { Suspense } from 'react'
import type { ReactElement } from 'react'

import { searchMedia } from '@/modules/tracking/application/use-cases/search-media'

import { getUserTrackedIds } from './actions'
import { SearchInput } from './search-input'
import { SearchResults } from './search-results'
import { SearchSkeleton } from './search-skeleton'

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function SearchResultsLoader({ query }: { query: string }): Promise<ReactElement> {
  const [results, trackedIds] = await Promise.all([
    searchMedia(query),
    getUserTrackedIds(),
  ])

  return <SearchResults results={results} query={query} trackedIds={trackedIds} />
}

export default async function SearchPage(props: SearchPageProps): Promise<ReactElement> {
  const searchParams = await props.searchParams
  const q = typeof searchParams.q === 'string' ? searchParams.q.trim() : ''

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      <Suspense>
        <SearchInput />
      </Suspense>
      <div className="mt-4">
        {q ? (
          <Suspense key={q} fallback={<SearchSkeleton />}>
            <SearchResultsLoader query={q} />
          </Suspense>
        ) : (
          <SearchResults results={[]} query="" trackedIds={[]} />
        )}
      </div>
    </main>
  )
}
