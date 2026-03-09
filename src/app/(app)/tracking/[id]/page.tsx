import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { ReactElement } from 'react'

import { auth } from '@/lib/auth'
import { getTrackingEntry } from '@/modules/tracking/application/use-cases/get-tracking-entry'

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

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <TrackingEditForm entry={entry} />
    </main>
  )
}
