import type { MediaDetails } from '@/modules/tracking/domain/entities/media-details'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

export async function getMediaDetails(anilistId: number): Promise<MediaDetails | null> {
  return anilistAdapter.getMediaDetails(anilistId)
}
