import { ChevronLeft } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { ReactElement } from 'react'

import { EmptyState } from '@/components/shared/empty-state'
import { auth } from '@/lib/auth'
import { getSeriesCollection } from '@/modules/tracking/application/use-cases/get-series-collection'

import { TrackingCard } from '../../../tracking-card'

export default async function SeriesCollectionPage({
  params,
}: {
  params: Promise<{ anilistId: string }>
}): Promise<ReactElement> {
  const { anilistId: rawAnilistId } = await params
  const rootAnilistId = Number(rawAnilistId)

  if (!Number.isInteger(rootAnilistId) || rootAnilistId <= 0) {
    notFound()
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect('/login')
  }

  const { entries } = await getSeriesCollection({
    userId: session.user.id,
    rootAnilistId,
  })

  if (entries.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <Link
            href="/?groupBySeries=true"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ChevronLeft className="size-4" />
            Back to my list
          </Link>
        </div>
        <EmptyState
          title="No entries"
          description="No tracked entries belong to this series."
        />
      </main>
    )
  }

  const rep = entries.find(e => e.anilistId === rootAnilistId) ?? entries[0]
  const seriesTitle = rep.titleEnglish ?? rep.titleRomaji ?? 'Series'

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <Link
          href="/?groupBySeries=true"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to my list
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">{seriesTitle}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {entries.map(entry => (
          <TrackingCard key={entry.id} entry={entry} />
        ))}
      </div>
    </main>
  )
}
