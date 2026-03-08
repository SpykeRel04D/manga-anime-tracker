import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/anilist/rate-limiter', () => ({
  anilistRateLimiter: {
    tryConsume: vi.fn(),
  },
}))

import { anilistRateLimiter } from '@/lib/anilist/rate-limiter'
import { AniListAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

const mockRateLimiter = vi.mocked(anilistRateLimiter)

function createMockResponse(data: unknown, status = 200, headers?: Record<string, string>) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    json: async () => data,
  } as Response
}

const mockApiResponse = {
  data: {
    Page: {
      media: [
        {
          id: 20,
          title: { english: 'Naruto', romaji: 'NARUTO' },
          type: 'ANIME',
          status: 'FINISHED',
          episodes: 220,
          chapters: null,
          coverImage: {
            large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20.jpg',
            color: '#e47850',
          },
        },
        {
          id: 21,
          title: { english: null, romaji: 'ONE PIECE' },
          type: 'MANGA',
          status: 'RELEASING',
          episodes: null,
          chapters: 1100,
          coverImage: {
            large: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx21.jpg',
            color: null,
          },
        },
      ],
    },
  },
}

describe('AniListAdapter', () => {
  let adapter: AniListAdapter
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    adapter = new AniListAdapter()
    fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    mockRateLimiter.tryConsume.mockReturnValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns mapped search results for anime', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    const results = await adapter.searchMedia('Naruto')

    expect(results).toHaveLength(2)
    expect(results[0].id).toBe(20)
    expect(results[0].title).toBe('Naruto')
    expect(results[0].type).toBe('ANIME')
    expect(results[0].episodes).toBe(220)
  })

  it('returns mapped search results for manga', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    const results = await adapter.searchMedia('One Piece')

    expect(results[1].id).toBe(21)
    expect(results[1].title).toBe('ONE PIECE') // Fallback to romaji
    expect(results[1].titleEnglish).toBeNull()
    expect(results[1].type).toBe('MANGA')
    expect(results[1].chapters).toBe(1100)
  })

  it('throws before fetch when rate limited', async () => {
    mockRateLimiter.tryConsume.mockReturnValue(false)

    await expect(adapter.searchMedia('test')).rejects.toThrow(
      'Rate limit exceeded. Please wait before searching again.',
    )
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('throws with retry info on HTTP 429', async () => {
    fetchSpy.mockResolvedValueOnce(
      createMockResponse({}, 429, { 'Retry-After': '60' }),
    )

    await expect(adapter.searchMedia('test')).rejects.toThrow('Rate limited')
  })

  it('throws on GraphQL errors in response body', async () => {
    const errorResponse = {
      errors: [{ message: 'Invalid query' }],
    }
    fetchSpy.mockResolvedValueOnce(createMockResponse(errorResponse))

    await expect(adapter.searchMedia('test')).rejects.toThrow('Invalid query')
  })

  it('throws on network failure', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'))

    await expect(adapter.searchMedia('test')).rejects.toThrow('Network error')
  })

  it('returns empty array for empty results', async () => {
    const emptyResponse = {
      data: {
        Page: {
          media: [],
        },
      },
    }
    fetchSpy.mockResolvedValueOnce(createMockResponse(emptyResponse))

    const results = await adapter.searchMedia('nonexistent')

    expect(results).toEqual([])
  })

  it('sends correct GraphQL query to AniList endpoint', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    await adapter.searchMedia('Naruto', 10)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://graphql.anilist.co')
    expect(options.method).toBe('POST')

    const body = JSON.parse(options.body)
    expect(body.variables.search).toBe('Naruto')
    expect(body.variables.perPage).toBe(10)
    expect(body.query).toContain('POPULARITY_DESC')
    expect(body.query).toContain('isAdult: false')
  })

  it('uses default perPage of 15', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockApiResponse))

    await adapter.searchMedia('test')

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.variables.perPage).toBe(15)
  })

  it('throws descriptive error on non-200 status', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse({}, 500))

    await expect(adapter.searchMedia('test')).rejects.toThrow('AniList API error: 500')
  })
})
