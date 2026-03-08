export interface MediaSearchResult {
  id: number
  title: string
  titleEnglish: string | null
  titleRomaji: string
  type: 'ANIME' | 'MANGA'
  status: string
  episodes: number | null
  chapters: number | null
  coverImageUrl: string | null
  coverImageColor: string | null
}

export interface AniListMediaResponse {
  id: number
  title: { english: string | null; romaji: string }
  type: 'ANIME' | 'MANGA'
  status: string
  episodes: number | null
  chapters: number | null
  coverImage: { large: string; color: string | null } | null
}

export function mapAniListMedia(raw: AniListMediaResponse): MediaSearchResult {
  return {
    id: raw.id,
    title: raw.title.english ?? raw.title.romaji,
    titleEnglish: raw.title.english,
    titleRomaji: raw.title.romaji,
    type: raw.type,
    status: raw.status,
    episodes: raw.episodes,
    chapters: raw.chapters,
    coverImageUrl: raw.coverImage?.large ?? null,
    coverImageColor: raw.coverImage?.color ?? null,
  }
}
