export interface RelatedMedia {
  id: number
  title: string
  titleRomaji: string | null
  type: 'ANIME' | 'MANGA'
  coverImageUrl: string | null
  relationType: string
}

export interface MediaDetails {
  description: string | null
  genres: string[]
  meanScore: number | null
  season: string | null
  seasonYear: number | null
  studios: Array<{ id: number; name: string }>
  staff: Array<{ role: string; name: string }>
  relations: RelatedMedia[]
}

export const USEFUL_RELATION_TYPES = [
  'SEQUEL',
  'PREQUEL',
  'SIDE_STORY',
  'SPIN_OFF',
  'PARENT',
  'ADAPTATION',
  'SOURCE',
] as const
