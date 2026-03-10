# Phase 5: List UI and Browsing - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can visually browse, filter, sort, and inspect their tracked collection. The cover image grid is the primary daily interface — replacing the placeholder grid on the home page (`/`). Includes detail page with full metadata merged into the existing edit page. No new tracking capabilities (those were Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Grid Card Design
- Cover-only cards: large cover image dominates with 3:4 aspect ratio
- Status badge: colored pill overlay in top-left corner, distinct color per status (Watching=blue, Completed=green, On Hold=amber, Dropped=red, Plan to Watch=gray)
- Progress bar: thin bar at bottom edge of cover, only visible for Watching and On Hold entries (where progress matters). Completed shows full bar or checkmark. Plan to Watch and Dropped show no bar
- Title shown below the cover image (not overlaid)
- Clicking a card navigates to the detail/edit page at `/tracking/[id]`

### Filter & Sort Controls
- Status filter: horizontal tab bar at top — All | Watching | Completed | On Hold | Dropped | Plan to Watch
- Each tab shows entry count (e.g., "Watching(8)")
- Total counts fetched upfront in a lightweight query
- On mobile: tabs scroll horizontally (swipeable), not collapsed to dropdown
- Second toolbar row below tabs: type toggle (All/Anime/Manga) on the left, sort dropdown on the right
- Sort options: Rating, Title, Date Added
- All filter/sort state persisted in URL params (e.g., `/?status=watching&type=anime&sort=rating`) — refreshable and deep-linkable, consistent with Phase 3 search URL sync pattern

### Detail Page (merged with edit)
- Expand existing `/tracking/[id]` page — no new route
- Layout: cover + titles + full metadata at top, then "My Tracking" section with existing edit controls (status, progress, rating, notes)
- Full metadata fields: synopsis, genres (as pill tags), studio(s) for anime / author(s) for manga, airing/publishing status, total episodes/chapters, season/year, average AniList score
- Synopsis: collapsed to 3-4 lines with "Show more" toggle (long synopses won't push tracking controls down)
- Related series: horizontal scrollable row of small cover thumbnails at the bottom, clicking navigates to detail page (if tracked) or shows basic info
- Requires extended AniList GraphQL query beyond current `getMediaById` (add synopsis, genres, studios, relations, meanScore, season, seasonYear)

### Infinite Scroll
- Grid uses infinite scroll, 20 entries per batch
- Skeleton grid loading state (reuse existing SkeletonCard/PlaceholderGrid shimmer pattern)

### Empty & Edge States
- No entries at all: friendly illustration + "Your collection is empty" message with prominent CTA button to /search
- Filter returns no results: clear message like "No manga with On Hold status" with a button to clear/reset filters
- Loading state: skeleton grid with shimmer cards (reuse SkeletonCard from Phase 1)
- Cover image fallback: warm gradient background with series title text overlaid (adapting the "No image" pattern from search result cards to vertical grid format)

### Claude's Discretion
- Exact status badge colors (within the warm theme palette)
- Progress bar visual style (thickness, color, animation)
- Infinite scroll implementation details (intersection observer, library choice)
- Tab bar styling and active state animation
- Responsive breakpoints for grid columns (existing: 2/3/4/5/6 from PlaceholderGrid)
- Detail page responsive layout (cover + metadata arrangement on mobile vs desktop)
- Related series thumbnail sizing and scroll behavior
- Empty state illustration style
- Sort direction (ascending/descending toggle or fixed per sort type)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PlaceholderGrid` (src/components/shared/placeholder-grid.tsx): Responsive grid layout (2-6 cols) — replace content with real tracking cards
- `SkeletonCard` (src/components/shared/skeleton-card.tsx): 3:4 aspect ratio shimmer card — reuse for loading state
- `Badge` (src/components/ui/badge.tsx): For status pills on cards and genre tags on detail page
- `Select` (src/components/ui/select.tsx): For sort dropdown
- `Card` (src/components/ui/card.tsx): Base for grid cards
- `tracking-edit-form.tsx` (src/app/(app)/tracking/[id]/): Existing edit controls (status, progress, rating, notes) — extend page around this
- `star-rating.tsx`, `progress-stepper.tsx`: Existing tracking edit components
- `SearchResultCard` (src/app/(app)/search/search-result-card.tsx): Cover image + "No image" fallback pattern to adapt

### Established Patterns
- shadcn/ui + Tailwind CSS with warm dark oklch theme
- Next.js 16 App Router with `(app)` route group for authenticated routes
- URL state sync with search params (Phase 3: search page syncs query to URL)
- Server actions with `auth.api.getSession()` for secure mutations
- `useTransition` for non-blocking async operations
- Hexagonal DDD: domain entities, ports, use cases, adapters
- Sonner toast for user feedback

### Integration Points
- Home page `/` (src/app/(app)/page.tsx): Replace PlaceholderGrid with tracking grid
- `/tracking/[id]` page: Extend with metadata section above existing edit form
- AniList adapter: Extend with full metadata query (synopsis, genres, studios, relations, score, season)
- `siteConfig.navLinks`: "My List" already points to `/`
- `trackingEntries` table: All needed fields exist (status, progress, rating, mediaType, coverImageUrl, titles, totals)

</code_context>

<specifics>
## Specific Ideas

- Cover art is the visual star — grid cards should feel like browsing a collection shelf
- The merged detail+edit page should feel like a cozy "entry card" — metadata for context, tracking controls for management
- Status badge colors should feel natural within the warm dark theme (not jarring primary colors)
- The tab bar with counts gives an instant snapshot of the collection's shape
- Infinite scroll keeps the browsing experience fluid for collections that grow over time
- Related series thumbnails create natural discovery paths within the tracked collection

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-list-ui-and-browsing*
*Context gathered: 2026-03-10*
