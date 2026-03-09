'use server'

import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { refreshMetadata } from '@/modules/tracking/application/use-cases/refresh-metadata'
import { removeEntry } from '@/modules/tracking/application/use-cases/remove-entry'
import { updateNotes } from '@/modules/tracking/application/use-cases/update-notes'
import { updateProgress } from '@/modules/tracking/application/use-cases/update-progress'
import { updateRating } from '@/modules/tracking/application/use-cases/update-rating'
import { updateStatus } from '@/modules/tracking/application/use-cases/update-status'

type AuthError = { success: false; error: 'not_authenticated' }

async function getSessionUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function changeStatus(
  entryId: string,
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch',
): Promise<Awaited<ReturnType<typeof updateStatus>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return updateStatus(userId, entryId, status)
}

export async function changeProgress(
  entryId: string,
  progress: number,
): Promise<Awaited<ReturnType<typeof updateProgress>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return updateProgress(userId, entryId, progress)
}

export async function changeRating(
  entryId: string,
  rating: number | null,
): Promise<Awaited<ReturnType<typeof updateRating>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return updateRating(userId, entryId, rating)
}

export async function changeNotes(
  entryId: string,
  notes: string | null,
): Promise<Awaited<ReturnType<typeof updateNotes>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return updateNotes(userId, entryId, notes)
}

export async function removeFromList(
  entryId: string,
): Promise<Awaited<ReturnType<typeof removeEntry>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return removeEntry(userId, entryId)
}

export async function refreshEntryMetadata(
  entryId: string,
  force?: boolean,
): Promise<Awaited<ReturnType<typeof refreshMetadata>> | AuthError> {
  const userId = await getSessionUserId()
  if (!userId) return { success: false, error: 'not_authenticated' }
  return refreshMetadata(userId, entryId, force)
}
