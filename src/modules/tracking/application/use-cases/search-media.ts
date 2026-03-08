import type { MediaSearchResult } from '@/modules/tracking/domain/entities/media-search-result'
import { anilistAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

export async function searchMedia(query: string): Promise<MediaSearchResult[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }
  return anilistAdapter.searchMedia(trimmed)
}
