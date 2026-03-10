import { anilistRateLimiter } from '@/lib/anilist/rate-limiter'
import {
  type MediaDetails,
  USEFUL_RELATION_TYPES,
} from '@/modules/tracking/domain/entities/media-details'
import {
  type AniListMediaResponse,
  type MediaSearchResult,
  mapAniListMedia,
} from '@/modules/tracking/domain/entities/media-search-result'
import type { MediaSearchPort } from '@/modules/tracking/domain/ports/media-search-port'

const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

const SEARCH_QUERY = `query SearchMedia($search: String!, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, sort: POPULARITY_DESC, isAdult: false) {
      id
      title {
        english
        romaji
      }
      type
      status
      episodes
      chapters
      coverImage {
        large
        color
      }
    }
  }
}`

const MEDIA_BY_ID_QUERY = `query ($id: Int!) {
  Media(id: $id) {
    id
    title {
      english
      romaji
    }
    type
    status
    episodes
    chapters
    coverImage {
      large
      color
    }
  }
}`

const MEDIA_DETAILS_QUERY = `query ($id: Int!) {
  Media(id: $id) {
    description(asHtml: false)
    genres
    meanScore
    season
    seasonYear
    studios(isMain: true) { nodes { id name } }
    staff(sort: [RELEVANCE], perPage: 5) { edges { role node { name { full } } } }
    relations { edges { relationType node { id title { english romaji } type coverImage { large } } } }
  }
}`

interface AniListPageResponse {
  data: {
    Page: {
      media: AniListMediaResponse[]
    }
  }
  errors?: Array<{ message: string }>
}

interface AniListSingleMediaResponse {
  data: { Media: AniListMediaResponse | null }
  errors?: Array<{ message: string }>
}

interface AniListMediaDetailsResponse {
  data: {
    Media: {
      description: string | null
      genres: string[]
      meanScore: number | null
      season: string | null
      seasonYear: number | null
      studios: {
        nodes: Array<{ id: number; name: string }>
      }
      staff: {
        edges: Array<{
          role: string
          node: { name: { full: string } }
        }>
      }
      relations: {
        edges: Array<{
          relationType: string
          node: {
            id: number
            title: { english: string | null; romaji: string }
            type: 'ANIME' | 'MANGA'
            coverImage: { large: string | null } | null
          }
        }>
      }
    } | null
  }
  errors?: Array<{ message: string }>
}

export class AniListAdapter implements MediaSearchPort {
  async searchMedia(query: string, perPage = 15): Promise<MediaSearchResult[]> {
    if (!anilistRateLimiter.tryConsume()) {
      throw new Error('Rate limit exceeded. Please wait before searching again.')
    }

    const response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search: query, page: 1, perPage },
      }),
      next: { revalidate: 300 },
    })

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      throw new Error(
        `Rate limited. Retry after ${retryAfter ?? 'unknown'}s`,
      )
    }

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`)
    }

    const json = (await response.json()) as AniListPageResponse

    if (json.errors?.length) {
      throw new Error(json.errors[0].message ?? 'Unknown AniList error')
    }

    const media = json.data?.Page?.media ?? []
    return media.map(mapAniListMedia)
  }

  async getMediaById(anilistId: number): Promise<MediaSearchResult | null> {
    if (!anilistRateLimiter.tryConsume()) {
      return null // Silent failure for background refresh
    }

    try {
      const response = await fetch(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: MEDIA_BY_ID_QUERY,
          variables: { id: anilistId },
        }),
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        return null // Silent failure
      }

      const json = (await response.json()) as AniListSingleMediaResponse

      if (json.errors?.length || !json.data?.Media) {
        return null
      }

      return mapAniListMedia(json.data.Media)
    } catch {
      return null // Silent failure on network errors
    }
  }

  async getMediaDetails(anilistId: number): Promise<MediaDetails | null> {
    if (!anilistRateLimiter.tryConsume()) {
      return null // Silent failure for rate limiting
    }

    try {
      const response = await fetch(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: MEDIA_DETAILS_QUERY,
          variables: { id: anilistId },
        }),
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        return null // Silent failure
      }

      const json = (await response.json()) as AniListMediaDetailsResponse

      if (json.errors?.length || !json.data?.Media) {
        return null
      }

      const media = json.data.Media

      // Strip HTML tags and entities from description
      const description = media.description
        ? media.description
            .replace(/<[^>]*>/g, ' ')
            .replace(/&\w+;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
        : null

      // Filter relations to useful types only
      const usefulTypes: readonly string[] = USEFUL_RELATION_TYPES
      const relations = media.relations.edges
        .filter((edge) => usefulTypes.includes(edge.relationType))
        .map((edge) => ({
          id: edge.node.id,
          title: edge.node.title.english ?? edge.node.title.romaji,
          titleRomaji: edge.node.title.romaji,
          type: edge.node.type,
          coverImageUrl: edge.node.coverImage?.large ?? null,
          relationType: edge.relationType,
        }))

      return {
        description,
        genres: media.genres ?? [],
        meanScore: media.meanScore ?? null,
        season: media.season ?? null,
        seasonYear: media.seasonYear ?? null,
        studios: media.studios.nodes.map((s) => ({ id: s.id, name: s.name })),
        staff: media.staff.edges.map((e) => ({
          role: e.role,
          name: e.node.name.full,
        })),
        relations,
      }
    } catch {
      return null // Silent failure on network errors
    }
  }
}

export const anilistAdapter = new AniListAdapter()
