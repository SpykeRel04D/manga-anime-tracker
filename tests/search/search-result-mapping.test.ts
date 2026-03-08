import { describe, expect, it } from 'vitest'

import {
  type AniListMediaResponse,
  mapAniListMedia,
} from '@/modules/tracking/domain/entities/media-search-result'

describe('mapAniListMedia', () => {
  const baseMedia: AniListMediaResponse = {
    id: 20,
    title: { english: 'Naruto', romaji: 'NARUTO' },
    type: 'ANIME',
    status: 'FINISHED',
    episodes: 220,
    chapters: null,
    coverImage: {
      large:
        'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20.jpg',
      color: '#e47850',
    },
  }

  it('maps all fields correctly', () => {
    const result = mapAniListMedia(baseMedia)

    expect(result.id).toBe(20)
    expect(result.title).toBe('Naruto')
    expect(result.titleEnglish).toBe('Naruto')
    expect(result.titleRomaji).toBe('NARUTO')
    expect(result.type).toBe('ANIME')
    expect(result.status).toBe('FINISHED')
    expect(result.episodes).toBe(220)
    expect(result.chapters).toBeNull()
    expect(result.coverImageUrl).toBe(
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20.jpg',
    )
    expect(result.coverImageColor).toBe('#e47850')
  })

  it('falls back to romaji when english title is null', () => {
    const media: AniListMediaResponse = {
      ...baseMedia,
      title: { english: null, romaji: 'NARUTO' },
    }
    const result = mapAniListMedia(media)

    expect(result.title).toBe('NARUTO')
    expect(result.titleEnglish).toBeNull()
    expect(result.titleRomaji).toBe('NARUTO')
  })

  it('handles null coverImage', () => {
    const media: AniListMediaResponse = {
      ...baseMedia,
      coverImage: null,
    }
    const result = mapAniListMedia(media)

    expect(result.coverImageUrl).toBeNull()
    expect(result.coverImageColor).toBeNull()
  })

  it('handles null episodes and chapters', () => {
    const media: AniListMediaResponse = {
      ...baseMedia,
      episodes: null,
      chapters: null,
    }
    const result = mapAniListMedia(media)

    expect(result.episodes).toBeNull()
    expect(result.chapters).toBeNull()
  })

  it('maps manga type correctly', () => {
    const manga: AniListMediaResponse = {
      ...baseMedia,
      type: 'MANGA',
      episodes: null,
      chapters: 700,
    }
    const result = mapAniListMedia(manga)

    expect(result.type).toBe('MANGA')
    expect(result.chapters).toBe(700)
    expect(result.episodes).toBeNull()
  })
})
