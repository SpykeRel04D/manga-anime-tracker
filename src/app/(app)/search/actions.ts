'use server'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import { auth } from '@/lib/auth'
import {
  type AddTrackingEntryInput,
  type AddTrackingEntryResult,
  addTrackingEntry,
} from '@/modules/tracking/application/use-cases/add-tracking-entry'

export async function addToTrackingList(
  data: AddTrackingEntryInput,
): Promise<AddTrackingEntryResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return { success: false, error: 'not_authenticated' }
  }

  return addTrackingEntry(session.user.id, data)
}

export interface TrackedEntry {
  anilistId: number
  entryId: string
}

export async function getUserTrackedEntries(): Promise<TrackedEntry[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return []
  }

  const rows = await db
    .select({
      anilistId: trackingEntries.anilistId,
      entryId: trackingEntries.id,
    })
    .from(trackingEntries)
    .where(eq(trackingEntries.userId, session.user.id))

  return rows
}
