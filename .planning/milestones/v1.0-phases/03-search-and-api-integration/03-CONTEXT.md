# Phase 3: Search and API Integration - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can search for any anime or manga by title via AniList GraphQL API and see rich search results with cover art, title, type, airing/publishing status, and episode/chapter count. Establishes the AniList API adapter with rate limiting that all future features depend on. Includes basic "add to tracking list" action on search results. Full tracking management (status changes, progress, ratings, notes, removal) belongs to Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Search Result Cards
- Horizontal card layout: cover image on the left, text info on the right
- Medium cover thumbnail (~80-100px wide) — visible but leaves room for metadata
- Required fields only: cover art, title, type badge, airing/publishing status, episode/chapter count
- Show both English and Romaji titles — English as primary (larger), Romaji as secondary (smaller) underneath
- No extra metadata (no genres, no AniList score)

### Search Interaction
- Prominent full-width search input at the top of the /search page, results listed below
- Empty state: just the search bar with placeholder text ("Search anime or manga..."), empty space below — minimal prompt
- Loading state: skeleton cards matching the horizontal card layout (reuse shimmer pattern from skeleton-card.tsx)
- No results: simple text message — "No results found for '[query]'" with spelling suggestion
- Search URL syncs with query param (e.g., /search?q=naruto) — page is refreshable and deep-linkable

### Result Actions
- Each card has an "Add to list" button — one click adds with default status ("Plan to Watch" for anime, "Plan to Read" for manga)
- Success feedback via toast notification
- If series is already tracked, replace Add button with a status badge (e.g., "Watching", "Completed") — prevents duplicates and gives instant context
- Cards are not clickable as a whole — only the Add button / status badge is interactive
- Detail pages come in Phase 5 (LIST-04)

### Search Scope
- Unified search: single query returns both anime and manga results mixed together
- Type badge: colored pill badge ("ANIME" in one color, "MANGA" in another) for instant visual distinction
- ~10-15 results per search, single page, no pagination — keeps API calls low within 30 req/min limit
- No filter tabs or toggles — unified results only

### Claude's Discretion
- AniList GraphQL query design and field selection
- Rate limiting implementation (token bucket, sliding window, etc.)
- Debounce timing (300-500ms range)
- Toast notification library/component choice
- Exact badge colors for anime vs manga type
- Error handling for API failures (network errors, rate limit hits)
- Caching strategy for search results
- Hexagonal architecture placement (ports, adapters, use cases)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skeleton-card.tsx` (src/components/shared/): Shimmer skeleton card for loading states — adapt for horizontal search result skeleton
- `card.tsx` (src/components/ui/): shadcn Card component — base for search result cards
- `input.tsx` (src/components/ui/): shadcn Input component — base for search input field
- `button.tsx` (src/components/ui/): shadcn Button component — for "Add to list" action
- `nav-bar.tsx` (src/components/layout/): Already has "Search" nav link pointing to `/search`

### Established Patterns
- shadcn/ui + Tailwind CSS with warm dark theme (oklch colors)
- Next.js 16 App Router with `(app)` route group for authenticated routes
- Hexagonal DDD: `src/modules/{domain}/` with `domain/entities`, `domain/ports`, `application/use-cases`, `infrastructure/adapters`
- `tracking` module already scaffolded — AniList adapter fits in `infrastructure/adapters`
- Drizzle ORM for database access
- Auth check in `(app)/layout.tsx` via `auth.api.getSession()`

### Integration Points
- `/search` route inside `(app)` route group (behind auth)
- `trackingEntries` table: stores `anilistId`, `mediaType`, `titleEnglish`, `titleRomaji`, `coverImageUrl`, `totalEpisodes`, `totalChapters` — API adapter must provide these fields
- `siteConfig.navLinks` already has `{ label: 'Search', href: '/search' }`
- `authClient.useSession()` available for user context in client components

</code_context>

<specifics>
## Specific Ideas

- Cover art is the visual star — UI frames it elegantly (carried from Phase 1 design philosophy)
- Both English and Romaji titles shown because user wants to see both forms
- Quick-add flow: absolute minimum friction to get a series into the tracking list from search
- AniList API currently degraded to 30 req/min — design for this as baseline (STATE.md note)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-search-and-api-integration*
*Context gathered: 2026-03-08*
