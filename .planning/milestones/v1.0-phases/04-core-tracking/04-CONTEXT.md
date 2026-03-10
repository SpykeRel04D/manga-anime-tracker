# Phase 4: Core Tracking - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can build and manage their personal anime/manga tracking list — adding series from search, setting statuses, updating episode/chapter progress, rating on a 1-10 scale, taking personal notes, refreshing metadata for ongoing series, and removing entries. The primary daily list UI (grid view, filtering, sorting, detail pages) belongs to Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Entry Management Surface
- Dedicated edit page per tracked entry at `/tracking/[id]`
- Layout: cover image + titles at top, then status dropdown, progress stepper, star rating, notes textarea, remove button
- Navigation: from search results — already-tracked entries show status badge (Phase 3), clicking badge navigates to edit page; after adding a new entry, toast includes "Manage" link
- No temporary list page — search is the entry point for Phase 4; Phase 5 adds the grid browse surface

### Save Behavior
- Auto-save per field — each change persists immediately (status dropdown change, progress +/-, rating click, notes blur)
- No Save button needed
- Toast confirms each save action

### Progress Input
- Stepper + direct input combo: +/- buttons for quick increments, clickable number becomes editable input for jumping to specific episode/chapter
- Clamped to total: cannot go above totalEpisodes/totalChapters or below 0; if total is null (ongoing, unknown count), allow any positive number
- Labels: "eps" for anime, "ch" for manga
- Auto-complete: when progress reaches totalEpisodes/totalChapters, automatically set status to "completed" (only when total is known/not null)

### Rating Interaction
- 10 amber/gold star icons in a row (amber-500 filled, muted warm gray empty)
- Hover preview: hovering over star N fills stars 1–N in a lighter shade
- Click to set rating; click same star again to remove rating (toggle behavior)
- Numeric display: "7/10" shown next to stars

### Notes Editing
- Always-visible inline textarea below other fields
- Auto-resizes as content grows
- Auto-saves on blur (click away)
- Plain text only — no markdown or rich formatting
- No character limit (DB column is text type, personal app)
- Placeholder: "Add personal notes..."

### Metadata Refresh
- Auto-refresh on edit page visit: background fetch from AniList updates all metadata (totalEpisodes, totalChapters, coverImageUrl, titleEnglish, titleRomaji, airing status)
- 24-hour cooldown: only auto-refresh if `lastSyncedAt` > 24 hours ago (requires new timestamp column)
- Manual refresh button always available regardless of cooldown
- Show cached data immediately, update UI silently when fresh data arrives

### Remove Entry
- Confirmation dialog: "Remove [title] from your list?" with Cancel/Remove buttons
- After removal, redirect back to search page

### Claude's Discretion
- Hexagonal architecture placement of new use cases (update-status, update-progress, update-rating, update-notes, remove-entry, refresh-metadata)
- AniList GraphQL query for single-media metadata refresh
- Edit page layout details (spacing, responsive behavior, component composition)
- Error handling for failed saves and API failures
- Status dropdown component choice (shadcn Select, custom, etc.)
- Confirmation dialog component (shadcn AlertDialog or similar)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `addTrackingEntry` use case (src/modules/tracking/application/use-cases/): Pattern for new use cases (update-status, update-progress, etc.)
- `trackingEntries` table (src/db/schema/tracking.ts): Already has status, progress, rating, notes columns — no new columns needed except `lastSyncedAt` for refresh cooldown
- `trackingStatusEnum`: ['watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'] — ready for status dropdown
- `anilist-adapter.ts` (src/modules/tracking/infrastructure/adapters/): AniList GraphQL client with rate limiting — reuse for metadata refresh query
- `Card`, `Button`, `Input`, `Badge`, `Sonner` (src/components/ui/): Available for edit page UI
- `DropdownMenu` (src/components/ui/): Could be used for status selection
- Server action pattern (src/app/(app)/search/actions.ts): `auth.api.getSession()` check + use case call — replicate for tracking mutations

### Established Patterns
- Hexagonal DDD: `src/modules/tracking/` with domain/entities, domain/ports, application/use-cases, infrastructure/adapters
- Server actions with `'use server'` directive for client-server mutations
- Toast notifications via Sonner for user feedback
- shadcn/ui + Tailwind CSS with warm dark oklch theme

### Integration Points
- Search result cards: already show status badge for tracked entries — need to make badge clickable → `/tracking/[id]`
- `getUserTrackedIds()` server action exists — may need `getUserTrackedEntry(anilistId)` to get the tracking entry ID for navigation
- Nav bar: no changes needed for Phase 4
- AniList adapter: extend with single-media query for metadata refresh

</code_context>

<specifics>
## Specific Ideas

- Cover art remains the visual star on the edit page (carried from Phase 1 design philosophy)
- Amber/gold stars match the app's warm accent color for a cohesive feel
- The edit page should feel like a cozy "entry card" — not a form, but a place to manage your relationship with the series
- Auto-save makes the page feel responsive and modern — no friction between wanting to update and doing it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-core-tracking*
*Context gathered: 2026-03-08*
