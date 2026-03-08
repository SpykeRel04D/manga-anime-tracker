import { anilistRateLimiter } from '@/lib/anilist/rate-limiter'
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

interface AniListPageResponse {
  data: {
    Page: {
      media: AniListMediaResponse[]
    }
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
}

export const anilistAdapter = new AniListAdapter()
