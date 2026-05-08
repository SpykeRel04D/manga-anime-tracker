import type { MediaDetails } from '@/modules/tracking/domain/entities/media-details'
import type { MediaRelations } from '@/modules/tracking/domain/entities/media-relations'
import type { MediaSearchResult } from '@/modules/tracking/domain/entities/media-search-result'

export interface MediaSearchPort {
  searchMedia(query: string, perPage?: number): Promise<MediaSearchResult[]>
  getMediaDetails(anilistId: number): Promise<MediaDetails | null>
  getMediaRelations(anilistId: number): Promise<MediaRelations | null>
}
