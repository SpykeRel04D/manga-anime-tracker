import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const trackingStatusEnum = pgEnum('tracking_status', [
  'watching',
  'completed',
  'on_hold',
  'dropped',
  'plan_to_watch',
])

export const mediaTypeEnum = pgEnum('media_type', ['anime', 'manga'])

export const trackingEntries = pgTable('tracking_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  anilistId: integer('anilist_id').notNull(),
  mediaType: mediaTypeEnum('media_type').notNull(),
  status: trackingStatusEnum('status').notNull().default('plan_to_watch'),
  progress: integer('progress').notNull().default(0),
  rating: integer('rating'),
  notes: text('notes'),
  titleEnglish: text('title_english'),
  titleRomaji: text('title_romaji'),
  coverImageUrl: text('cover_image_url'),
  totalEpisodes: integer('total_episodes'),
  totalChapters: integer('total_chapters'),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
