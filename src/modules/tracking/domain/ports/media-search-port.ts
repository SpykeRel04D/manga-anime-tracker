import type { MediaSearchResult } from '@/modules/tracking/domain/entities/media-search-result'

export interface MediaSearchPort {
  searchMedia(query: string, perPage?: number): Promise<MediaSearchResult[]>
}
