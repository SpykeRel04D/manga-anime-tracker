export interface TrackingEntry {
  id: string
  userId: string
  anilistId: number
  mediaType: 'anime' | 'manga'
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
  progress: number
  rating: number | null
  notes: string | null
  titleEnglish: string | null
  titleRomaji: string | null
  coverImageUrl: string | null
  totalEpisodes: number | null
  totalChapters: number | null
  lastSyncedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
