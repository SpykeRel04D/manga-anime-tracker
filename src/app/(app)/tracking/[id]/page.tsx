import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { ReactElement } from 'react'

import { auth } from '@/lib/auth'
import { getMediaDetails } from '@/modules/tracking/application/use-cases/get-media-details'
import { getTrackingEntry } from '@/modules/tracking/application/use-cases/get-tracking-entry'
import { getUserTrackedEntries } from '@/app/(app)/search/actions'

import { BackToListLink } from './back-to-list-link'
import { MediaDetailSection } from './media-detail-section'
import { TrackingEditForm } from './tracking-edit-form'

export default async function TrackingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactElement> {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect('/login')
  }

  const entry = await getTrackingEntry(session.user.id, id)

  if (!entry) {
    notFound()
  }

  // Fetch extended metadata; may return null on rate limit or error
  const details = await getMediaDetails(entry.anilistId)

  // Build tracked IDs map only if we have details with relations to resolve
  let trackedAnilistIds = new Map<number, string>()
  if (details !== null && details.relations.length > 0) {
    const trackedEntries = await getUserTrackedEntries()
    trackedAnilistIds = new Map(trackedEntries.map(t => [t.anilistId, t.entryId]))
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4">
        <BackToListLink />
      </div>

      {details !== null && (
        <div className="mb-6">
          <MediaDetailSection
            details={details}
            entry={entry}
            trackedAnilistIds={trackedAnilistIds}
          />
        </div>
      )}

      <div className="border-border mb-6 border-t" />

      <TrackingEditForm entry={entry} />
    </main>
  )
}
