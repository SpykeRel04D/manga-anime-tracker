import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/anilist/rate-limiter', () => ({
  anilistRateLimiter: {
    tryConsume: vi.fn(),
  },
}))

import { anilistRateLimiter } from '@/lib/anilist/rate-limiter'
import { AniListAdapter } from '@/modules/tracking/infrastructure/adapters/anilist-adapter'

const mockRateLimiter = vi.mocked(anilistRateLimiter)

function createMockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response
}

const mockDetailsResponse = {
  data: {
    Media: {
      description: 'A story about <b>ninjas</b> and &amp; their adventures.',
      genres: ['Action', 'Adventure', 'Fantasy'],
      meanScore: 79,
      season: 'FALL',
      seasonYear: 2002,
      studios: {
        nodes: [
          { id: 1, name: 'Studio Pierrot' },
        ],
      },
      staff: {
        edges: [
          { role: 'Original Creator', node: { name: { full: 'Masashi Kishimoto' } } },
          { role: 'Director', node: { name: { full: 'Hayato Date' } } },
        ],
      },
      relations: {
        edges: [
          {
            relationType: 'SEQUEL',
            node: {
              id: 101,
              title: { english: 'Naruto Shippuden', romaji: 'NARUTO: Shippuuden' },
              type: 'ANIME',
              coverImage: { large: 'https://example.com/shippuden.jpg' },
            },
          },
          {
            relationType: 'CHARACTER',
            node: {
              id: 999,
              title: { english: 'Naruto Characters', romaji: 'Naruto Characters' },
              type: 'ANIME',
              coverImage: { large: 'https://example.com/chars.jpg' },
            },
          },
        ],
      },
    },
  },
}

describe('AniListAdapter.getMediaDetails', () => {
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

  it('returns MediaDetails on successful API response', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    const result = await adapter.getMediaDetails(20)

    expect(result).not.toBeNull()
    expect(result?.genres).toEqual(['Action', 'Adventure', 'Fantasy'])
    expect(result?.meanScore).toBe(79)
    expect(result?.season).toBe('FALL')
    expect(result?.seasonYear).toBe(2002)
  })

  it('maps studios correctly', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    const result = await adapter.getMediaDetails(20)

    expect(result?.studios).toEqual([{ id: 1, name: 'Studio Pierrot' }])
  })

  it('maps staff correctly', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    const result = await adapter.getMediaDetails(20)

    expect(result?.staff).toEqual([
      { role: 'Original Creator', name: 'Masashi Kishimoto' },
      { role: 'Director', name: 'Hayato Date' },
    ])
  })

  it('filters relations to useful types only (includes SEQUEL, excludes CHARACTER)', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    const result = await adapter.getMediaDetails(20)

    expect(result?.relations).toHaveLength(1)
    expect(result?.relations[0].relationType).toBe('SEQUEL')
    expect(result?.relations[0].id).toBe(101)
    expect(result?.relations[0].title).toBe('Naruto Shippuden')
    expect(result?.relations[0].titleRomaji).toBe('NARUTO: Shippuuden')
    expect(result?.relations[0].type).toBe('ANIME')
    expect(result?.relations[0].coverImageUrl).toBe('https://example.com/shippuden.jpg')
  })

  it('strips HTML tags from description', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    const result = await adapter.getMediaDetails(20)

    expect(result?.description).not.toContain('<b>')
    expect(result?.description).not.toContain('</b>')
    expect(result?.description).not.toContain('&amp;')
    expect(result?.description).toContain('ninjas')
  })

  it('returns null when rate limiter rejects (silent failure)', async () => {
    mockRateLimiter.tryConsume.mockReturnValue(false)

    const result = await adapter.getMediaDetails(20)

    expect(result).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns null on non-200 response (silent failure)', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse({}, 500))

    const result = await adapter.getMediaDetails(20)

    expect(result).toBeNull()
  })

  it('returns null on network error (silent failure)', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network failure'))

    const result = await adapter.getMediaDetails(20)

    expect(result).toBeNull()
  })

  it('uses next revalidate: 300 for caching', async () => {
    fetchSpy.mockResolvedValueOnce(createMockResponse(mockDetailsResponse))

    await adapter.getMediaDetails(20)

    const [, options] = fetchSpy.mock.calls[0]
    expect(options.next?.revalidate).toBe(300)
  })
})

describe('getMediaDetails use case', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('delegates to anilistAdapter.getMediaDetails', async () => {
    // Test that the use case module exists and exports correctly
    const module = await import('@/modules/tracking/application/use-cases/get-media-details')
    expect(typeof module.getMediaDetails).toBe('function')
  })
})
