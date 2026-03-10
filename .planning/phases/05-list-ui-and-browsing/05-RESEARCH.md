# Phase 5: List UI and Browsing - Research

**Researched:** 2026-03-10
**Domain:** Next.js App Router UI, Drizzle ORM querying, AniList GraphQL extended metadata, Intersection Observer
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Grid Card Design**
- Cover-only cards: large cover image dominates with 3:4 aspect ratio
- Status badge: colored pill overlay in top-left corner, distinct color per status (Watching=blue, Completed=green, On Hold=amber, Dropped=red, Plan to Watch=gray)
- Progress bar: thin bar at bottom edge of cover, only visible for Watching and On Hold entries. Completed shows full bar or checkmark. Plan to Watch and Dropped show no bar
- Title shown below the cover image (not overlaid)
- Clicking a card navigates to the detail/edit page at `/tracking/[id]`

**Filter & Sort Controls**
- Status filter: horizontal tab bar at top — All | Watching | Completed | On Hold | Dropped | Plan to Watch
- Each tab shows entry count (e.g., "Watching(8)")
- Total counts fetched upfront in a lightweight query
- On mobile: tabs scroll horizontally (swipeable), not collapsed to dropdown
- Second toolbar row below tabs: type toggle (All/Anime/Manga) on the left, sort dropdown on the right
- Sort options: Rating, Title, Date Added
- All filter/sort state persisted in URL params (e.g., `/?status=watching&type=anime&sort=rating`) — refreshable and deep-linkable, consistent with Phase 3 search URL sync pattern

**Detail Page (merged with edit)**
- Expand existing `/tracking/[id]` page — no new route
- Layout: cover + titles + full metadata at top, then "My Tracking" section with existing edit controls
- Full metadata fields: synopsis, genres (as pill tags), studio(s) for anime / author(s) for manga, airing/publishing status, total episodes/chapters, season/year, average AniList score
- Synopsis: collapsed to 3-4 lines with "Show more" toggle
- Related series: horizontal scrollable row of small cover thumbnails at the bottom, clicking navigates to detail page (if tracked) or shows basic info
- Requires extended AniList GraphQL query beyond current `getMediaById` (add synopsis, genres, studios, relations, meanScore, season, seasonYear)

**Infinite Scroll**
- Grid uses infinite scroll, 20 entries per batch
- Skeleton grid loading state (reuse existing SkeletonCard/PlaceholderGrid shimmer pattern)

**Empty & Edge States**
- No entries at all: friendly illustration + "Your collection is empty" message with prominent CTA button to /search
- Filter returns no results: clear message like "No manga with On Hold status" with reset filter button
- Loading state: skeleton grid with shimmer cards
- Cover image fallback: warm gradient background with series title text overlaid

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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIST-01 | User can view their tracked series as a visual grid of cover images with status badges and progress indicators | Drizzle query with status/type/sort filters; existing PlaceholderGrid breakpoints (2/3/4/5/6 cols); SkeletonCard 3:4 aspect ratio reuse; Intersection Observer for infinite scroll batches |
| LIST-02 | User can filter their list by status (Watching, Completed, etc.) and type (anime/manga) | Drizzle `eq(trackingEntries.status, status)` / `eq(trackingEntries.mediaType, type)` where clauses; URL params pattern from Phase 3 (`useSearchParams` + `router.replace`); count query using Drizzle `count()` grouped by status |
| LIST-03 | User can sort their list by rating, title, or date added | Drizzle `orderBy` with `desc(trackingEntries.rating)`, `asc(trackingEntries.titleEnglish)`, `desc(trackingEntries.createdAt)`; sort param persisted in URL |
| LIST-04 | User can view a detail page for a tracked entry showing full metadata (synopsis, genres, studios/authors, airing status, related series) | Extended AniList GraphQL query adding `description`, `genres`, `studios{nodes{id name isMain}}`, `staff{edges{role node{name{full}}}}`, `relations{edges{relationType node{id title{english romaji} type coverImage{large}}}}`, `meanScore`, `season`, `seasonYear`; new domain entity `MediaDetails`; MediaSearchPort extended with `getMediaDetails` method |

</phase_requirements>

## Summary

Phase 5 converts the home page from a placeholder shimmer grid into the primary working interface: a browsable, filterable, sortable cover-art grid of the user's tracked collection. The work splits into three areas: (1) the list grid with filter/sort controls and infinite scroll on the home page, (2) extending the `/tracking/[id]` detail page with rich AniList metadata, and (3) adding a new `getMediaDetails` query to the AniList adapter that fetches the extended fields the detail page needs.

The project stack is already fully suited to this work. Every UI primitive needed (Badge, Select, Card, SkeletonCard, PlaceholderGrid breakpoints) exists. URL state sync via `useSearchParams` + `router.replace` + `{ scroll: false }` is the established Phase 3 pattern. Drizzle ORM already queries the `trackingEntries` table; adding `where`, `orderBy`, and `count` clauses is straightforward. The only new infrastructure is the extended AniList GraphQL query for the detail page and native Intersection Observer for infinite scroll loading.

**Primary recommendation:** Build all list data access as server-side Drizzle queries in a new `getTrackingList` use case; drive filter/sort from URL search params exactly as Phase 3 does; implement infinite scroll with a `useEffect`-based native Intersection Observer sentinel (no extra library needed given `use-debounce` is already present for any debounce needs).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.6 (pinned) | Server components, URL params, page routing | Already in use |
| Drizzle ORM | 0.45.1 | Filtered/sorted DB queries | Already in use |
| `@base-ui/react` | 1.2.0 | Badge, Select, Card primitives | Already in use — all shadcn/ui wrappers use it |
| Tailwind CSS v4 | installed | Responsive grid, oklch theme, `overflow-x-scroll` tab bar | Already in use |
| Next.js `Image` | 16.1.6 | Cover image optimization + sizes prop | Already in use in search cards and edit form |
| `use-debounce` | 10.1.0 | Debounce intersection/scroll callbacks if needed | Already installed |
| `lucide-react` | 0.577.0 | Icons (ChevronRight, Check, etc.) | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `IntersectionObserver` API | browser built-in | Infinite scroll sentinel detection | Preferred over `react-intersection-observer` — no additional dependency, sufficient for this use case |
| `sonner` | 2.0.7 | Toast feedback | Already used for tracking mutations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native IntersectionObserver | `react-intersection-observer` library | Library adds 3.6 kB; the native API is 10 lines and already understood in this project |
| `useSearchParams` + `router.replace` | React state + no URL sync | URL sync was a hard decision; React state would break deep-linking requirement |
| Drizzle count query | Separate aggregation endpoint | Drizzle `count()` with `where` is the right tool; no separate API needed |

**Installation:** No new packages required. All dependencies are already in `package.json`.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/(app)/
│   ├── page.tsx                        # Replace PlaceholderGrid with TrackingGrid + FilterBar
│   ├── tracking-grid.tsx               # Server component: fetches page 1, renders TrackingCard[]
│   ├── tracking-card.tsx               # Client component: cover, badge, progress bar, link
│   ├── filter-bar.tsx                  # Client component: tab bar + type toggle + sort dropdown
│   └── tracking/[id]/
│       ├── page.tsx                    # Extended: fetches entry + calls getMediaDetails
│       └── tracking-edit-form.tsx      # UNCHANGED: existing edit controls
│       └── media-detail-section.tsx    # NEW: synopsis, genres, studios, related series
│
├── modules/tracking/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── media-details.ts        # NEW: extended metadata entity
│   │   └── ports/
│   │       └── media-search-port.ts    # EXTEND: add getMediaDetails method
│   ├── application/use-cases/
│   │   ├── get-tracking-list.ts        # NEW: filtered/sorted/paginated list query
│   │   └── get-status-counts.ts        # NEW: count per status for tab badges
│   └── infrastructure/adapters/
│       └── anilist-adapter.ts          # EXTEND: add MEDIA_DETAILS_QUERY + getMediaDetails
```

### Pattern 1: Server-Side Filtered List Query (Drizzle)

**What:** `get-tracking-list` use case accepts status, type, sort, page and returns a page of `TrackingEntry[]` plus a `hasMore` boolean.
**When to use:** Every grid render — initial load and each infinite scroll batch.

```typescript
// Source: Drizzle ORM docs — orderBy, where, limit/offset
import { asc, desc, eq, and, count } from 'drizzle-orm'
import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'
import type { TrackingEntry } from '@/modules/tracking/domain/entities/tracking-entry'

export interface GetTrackingListInput {
  userId: string
  status?: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch'
  mediaType?: 'anime' | 'manga'
  sort?: 'rating' | 'title' | 'date_added'
  page?: number
  perPage?: number
}

export interface GetTrackingListResult {
  entries: TrackingEntry[]
  hasMore: boolean
  total: number
}

const SORT_MAP = {
  rating:     desc(trackingEntries.rating),
  title:      asc(trackingEntries.titleEnglish),
  date_added: desc(trackingEntries.createdAt),
} as const

export async function getTrackingList(
  input: GetTrackingListInput,
): Promise<GetTrackingListResult> {
  const { userId, status, mediaType, sort = 'date_added', page = 1, perPage = 20 } = input
  const offset = (page - 1) * perPage

  const conditions = [
    eq(trackingEntries.userId, userId),
    ...(status     ? [eq(trackingEntries.status, status)]    : []),
    ...(mediaType  ? [eq(trackingEntries.mediaType, mediaType)] : []),
  ]
  const where = conditions.length === 1 ? conditions[0] : and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(trackingEntries)
      .where(where)
      .orderBy(SORT_MAP[sort])
      .limit(perPage + 1)      // fetch one extra to determine hasMore
      .offset(offset),
    db
      .select({ value: count() })
      .from(trackingEntries)
      .where(where),
  ])

  const hasMore = rows.length > perPage
  return {
    entries:  hasMore ? rows.slice(0, perPage) : rows,
    hasMore,
    total:    Number(total),
  }
}
```

### Pattern 2: Status Count Query for Tab Badges

**What:** Single query grouping all entries by status to power the "Watching(8)" tab labels.
**When to use:** Page load — fetched once, shown in filter bar.

```typescript
// Source: Drizzle ORM groupBy + count docs
import { count, eq } from 'drizzle-orm'
import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type StatusCounts = Record<string, number>

export async function getStatusCounts(userId: string): Promise<StatusCounts> {
  const rows = await db
    .select({
      status: trackingEntries.status,
      count: count(),
    })
    .from(trackingEntries)
    .where(eq(trackingEntries.userId, userId))
    .groupBy(trackingEntries.status)

  const counts: StatusCounts = {}
  for (const row of rows) {
    counts[row.status] = Number(row.count)
  }
  return counts
}
```

### Pattern 3: URL Params Filter/Sort State (established Phase 3 pattern)

**What:** Client component reads and updates URL search params for status/type/sort. Page re-renders via server component on URL change.
**When to use:** FilterBar component — all three controls write to URL.

```typescript
// Source: Phase 3 search-input.tsx pattern + Next.js useSearchParams docs
'use client'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'

export function FilterBar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentStatus = searchParams.get('status') ?? 'all'
  const currentType   = searchParams.get('type')   ?? 'all'
  const currentSort   = searchParams.get('sort')   ?? 'date_added'

  // ...render tab bar, type toggle, sort select
}
```

### Pattern 4: Infinite Scroll with Native Intersection Observer

**What:** Client component accumulates pages of entries from a server action. A sentinel div at the bottom triggers next page load when visible.
**When to use:** The tracking grid — replaces the static server component approach for pages 2+.

```typescript
// Source: LogRocket Next.js App Router infinite scroll pattern
'use client'
import { useEffect, useRef, useState, useTransition } from 'react'

export function TrackingGrid({ initialEntries, initialHasMore, ... }) {
  const [entries, setEntries] = useState(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPending) {
          startTransition(async () => {
            const next = await fetchMoreEntries(page + 1, currentFilters)
            setEntries(prev => [...prev, ...next.entries])
            setHasMore(next.hasMore)
            setPage(p => p + 1)
          })
        }
      },
      { threshold: 0.1 },
    )
    const el = sentinelRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [hasMore, isPending, page]) // page in deps to avoid stale closure

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {entries.map(e => <TrackingCard key={e.id} entry={e} />)}
      {isPending && <SkeletonCards count={4} />}
      <div ref={sentinelRef} className="col-span-full h-4" />
    </div>
  )
}
```

**Important note:** Filter/sort changes must reset page to 1 and clear accumulated entries. The filter state drives a new initial server load — the infinite scroll client component receives new `initialEntries` via `key={filterHash}` prop forcing a remount.

### Pattern 5: Extended AniList GraphQL Query for Media Details

**What:** New `MEDIA_DETAILS_QUERY` constant added to `anilist-adapter.ts` alongside `MEDIA_BY_ID_QUERY`. New `getMediaDetails(anilistId)` method on the adapter.
**When to use:** Detail page `/tracking/[id]` — called server-side on page render.

```typescript
// Source: AniList API docs.anilist.co/reference/object/media
const MEDIA_DETAILS_QUERY = `query ($id: Int!) {
  Media(id: $id) {
    id
    description(asHtml: false)
    genres
    meanScore
    season
    seasonYear
    status
    episodes
    chapters
    studios(isMain: true) {
      nodes {
        id
        name
      }
    }
    staff(sort: [RELEVANCE], perPage: 5) {
      edges {
        role
        node {
          name {
            full
          }
        }
      }
    }
    relations {
      edges {
        relationType
        node {
          id
          title {
            english
            romaji
          }
          type
          coverImage {
            large
          }
        }
      }
    }
  }
}`
```

The `MediaSearchPort` interface should be extended to include `getMediaDetails`. A new domain entity `MediaDetails` carries these fields (separate from `MediaSearchResult` to keep search results lightweight).

### Pattern 6: TrackingCard Component

**What:** A link-wrapped card showing 3:4 cover, overlaid status badge, optional progress bar, title below.
**When to use:** Each entry in the grid.

```typescript
// Cover fallback adapts SearchResultCard's "No image" gradient
// Badge overlay uses absolute positioning within the relative cover wrapper
// Progress bar: absolute bottom of cover, h-1 (4px), rounded

function TrackingCard({ entry }: { entry: TrackingEntry }) {
  const showProgressBar = entry.status === 'watching' || entry.status === 'on_hold' || entry.status === 'completed'
  const progressTotal = entry.mediaType === 'anime' ? entry.totalEpisodes : entry.totalChapters
  const progressPct = progressTotal ? (entry.progress / progressTotal) * 100 : (entry.status === 'completed' ? 100 : 0)

  return (
    <Link href={`/tracking/${entry.id}`} className="group block">
      <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {/* Cover image or fallback gradient */}
          {/* Status badge: absolute top-2 left-2 */}
          {/* Progress bar: absolute bottom-0 left-0 right-0 h-1 */}
        </div>
        <div className="p-2">
          <p className="text-foreground line-clamp-2 text-xs font-medium">{title}</p>
        </div>
      </div>
    </Link>
  )
}
```

### Anti-Patterns to Avoid

- **Filter state in React component state only:** URL params are locked by user decision. Component-only state breaks deep links and browser back navigation.
- **Calling `getMediaDetails` for every grid card:** This is expensive — it is only called once on the detail page render, not in the list.
- **Fetching all entries in one query then filtering client-side:** Pass filter/sort to Drizzle WHERE clause. Collections can grow; client-side filtering is brittle.
- **Re-fetching status counts on every infinite scroll batch:** Counts are fetched once on initial page load via the server component; they don't change during a browse session.
- **Using `router.push` instead of `router.replace` for filter changes:** Replace keeps history clean (Phase 3 precedent).
- **Forgetting to reset `page` and clear accumulated entries on filter/sort change:** Infinite scroll state must be reset when filters change; accomplish via `key={filterKey}` on the client grid component.
- **Using `asHtml: true` for description:** Returns HTML fragments; use `asHtml: false` to get plain text and handle "Show more" truncation with CSS `line-clamp`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive CSS grid | Custom breakpoint grid | Existing `PlaceholderGrid` Tailwind classes: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6` | Already proven, locked breakpoints from Phase 1 |
| Loading skeleton | Custom shimmer | Existing `SkeletonCard` component (3:4 aspect, shimmer animation) | Already built and used throughout the app |
| Sort dropdown | Custom dropdown | `Select` component from `@base-ui/react` (already in `src/components/ui/select.tsx`) | Handles keyboard nav, portal, accessibility |
| Status pill | Custom styled div | `Badge` component with variant="outline" + custom className | Consistent with existing badge usage in search cards |
| Debounced callbacks | setTimeout logic | `use-debounce` (already installed) if any callback debouncing is needed | Installed, tested |
| GraphQL fetch | Apollo/urql | Native `fetch` with `JSON.stringify` body (Phase 3 decision) | Established pattern; no new deps |

**Key insight:** Every UI primitive for this phase already exists. Phase 5 is primarily about wiring data flows and composing existing components — not building new primitives.

## Common Pitfalls

### Pitfall 1: Stale Closure in IntersectionObserver Callback
**What goes wrong:** The `page` value captured in the observer callback is the value at setup time. Subsequent triggers load page 1 repeatedly.
**Why it happens:** The observer is created in a `useEffect` but `page` isn't in the dependency array.
**How to avoid:** Include `page` (and all filter values) in the `useEffect` dependency array, and disconnect/reconnect the observer when page changes.
**Warning signs:** Duplicate entries appearing in grid; network requests always loading page 1.

### Pitfall 2: Filter Change Not Resetting Infinite Scroll State
**What goes wrong:** User switches from "All" to "Watching" — grid shows the previous entries from "All" while new ones append.
**Why it happens:** The client component accumulates entries from all scroll events; changing a URL param doesn't automatically clear the accumulated array.
**How to avoid:** Pass a `key` prop derived from current filter params (e.g., `key={status + type + sort}`) to the client `TrackingGrid` component. React remounts it on key change, resetting internal state.
**Warning signs:** Wrong status entries appearing after filter tab click.

### Pitfall 3: AniList Rate Limit on Detail Page Load
**What goes wrong:** Every visit to `/tracking/[id]` calls `getMediaDetails` — with the existing 30 req/min degraded limit, hitting several detail pages quickly exhausts the budget.
**Why it happens:** `getMediaDetails` is a separate API call beyond the existing `refreshMetadata` use case.
**How to avoid:** Cache the AniList response server-side with `next: { revalidate: 300 }` (established pattern from Phase 3/4). Also apply the existing `anilistRateLimiter.tryConsume()` check — return null on rate limit, show entry metadata from DB only.
**Warning signs:** 429 responses or missing metadata on rapid navigation.

### Pitfall 4: `titleEnglish` Null Coalescing in Sort
**What goes wrong:** Sorting by title with `asc(trackingEntries.titleEnglish)` puts all null-title entries first (PostgreSQL NULLs sort first in ASC).
**Why it happens:** `titleEnglish` is nullable. Some entries may only have `titleRomaji`.
**How to avoid:** Use `NULLS LAST` via Drizzle's `asc(trackingEntries.titleEnglish).nullsLast()` — or sort on `COALESCE(title_english, title_romaji)`. Verify Drizzle 0.45.x supports `.nullsLast()` (it does as of 0.28+).
**Warning signs:** Entries without English titles sorted incorrectly.

### Pitfall 5: `description` HTML Entities from AniList
**What goes wrong:** AniList's `description` field (even with `asHtml: false`) contains HTML-encoded entities like `&lt;br&gt;` or `&amp;`.
**Why it happens:** AniList stores descriptions with source formatting tags.
**How to avoid:** Strip or sanitize the description string before display. A simple regex `description.replace(/<[^>]*>/g, ' ').replace(/&\w+;/g, ' ')` covers the common cases without a sanitize library. Do NOT use `dangerouslySetInnerHTML` with untrusted content.
**Warning signs:** Raw HTML tags visible in synopsis text.

### Pitfall 6: `Next.js Image` Missing `sizes` Prop on Grid
**What goes wrong:** Next.js optimizes images assuming they're full viewport width, generating unnecessarily large images.
**Why it happens:** Missing `sizes` attribute on the `<Image>` component.
**How to avoid:** Add `sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"` to match the 2/3/5 column breakpoints.
**Warning signs:** Slow grid load; large network images in DevTools.

### Pitfall 7: Related Series Relations Include All Types
**What goes wrong:** The `relations` query returns CHARACTER relations, SUMMARY relations, etc. alongside SEQUEL/PREQUEL. Showing all of them creates a noisy list.
**Why it happens:** The AniList `relations` field returns all `MediaRelation` edge types.
**How to avoid:** Filter to a useful subset: `['SEQUEL', 'PREQUEL', 'SIDE_STORY', 'SPIN_OFF', 'PARENT', 'ADAPTATION', 'SOURCE']`. Skip CHARACTER, SUMMARY, COMPILATION, CONTAINS.
**Warning signs:** Related series row showing duplicate covers or unexpected unrelated entries.

## Code Examples

Verified patterns from official sources and existing codebase:

### Drizzle count() grouped by status
```typescript
// Source: Drizzle ORM docs — count aggregation
import { count, eq } from 'drizzle-orm'
const rows = await db
  .select({ status: trackingEntries.status, n: count() })
  .from(trackingEntries)
  .where(eq(trackingEntries.userId, userId))
  .groupBy(trackingEntries.status)
```

### Drizzle orderBy with nullsLast
```typescript
// Source: Drizzle ORM docs — asc/desc with null handling
import { asc } from 'drizzle-orm'
.orderBy(asc(trackingEntries.titleEnglish).nullsLast())
```

### URL param mutation (established Phase 3 pattern from search-input.tsx)
```typescript
const params = new URLSearchParams(searchParams.toString())
params.set('status', 'watching')
router.replace(`${pathname}?${params.toString()}`, { scroll: false })
```

### Next.js Image with sizes for grid
```tsx
// Source: Next.js Image docs — responsive sizes
<Image
  src={entry.coverImageUrl}
  alt={title}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
  className="object-cover"
/>
```

### Synopsis clamp with Show More toggle
```tsx
// CSS line-clamp approach — no library needed
const [expanded, setExpanded] = useState(false)
<p className={cn('text-sm', !expanded && 'line-clamp-4')}>{description}</p>
{description.length > 300 && (
  <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary">
    {expanded ? 'Show less' : 'Show more'}
  </button>
)}
```

### AniList extended query stub (new MEDIA_DETAILS_QUERY)
```typescript
// Source: docs.anilist.co/reference/object/media
const MEDIA_DETAILS_QUERY = `query ($id: Int!) {
  Media(id: $id) {
    description(asHtml: false)
    genres
    meanScore
    season
    seasonYear
    studios(isMain: true) { nodes { id name } }
    staff(sort: [RELEVANCE], perPage: 5) {
      edges { role node { name { full } } }
    }
    relations {
      edges {
        relationType
        node {
          id
          title { english romaji }
          type
          coverImage { large }
        }
      }
    }
  }
}`
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `router.push` for filter changes | `router.replace` with `{ scroll: false }` | Next.js 13+ | Scroll preserved, history clean |
| `useState` for paginated data | server action + `useTransition` accumulation | React 19 / Next.js 13+ | No loading spinners blocking UI; `isPending` for skeleton overlay |
| `react-query` / SWR for infinite scroll | native IntersectionObserver + server actions | 2023-2024 | No external state management library needed in App Router |
| ApolloClient for GraphQL | native `fetch` + JSON POST | Phase 3 decision | Single-file, no runtime overhead |

**Deprecated/outdated:**
- `getServerSideProps` / `getStaticProps`: Not used — App Router server components handle all server-side data needs
- `next/router` (pages router): Not used — `next/navigation` hooks throughout
- `react-window` / `react-virtual` for grid virtualization: Out of scope — this is a personal tracker with hundreds, not thousands, of entries; infinite scroll batching is sufficient

## Open Questions

1. **Related series: link behavior for untracked entries**
   - What we know: CONTEXT.md says "clicking navigates to detail page (if tracked) or shows basic info"
   - What's unclear: "shows basic info" — where? Tooltip, modal, or the AniList URL?
   - Recommendation: Simplest implementation is to link tracked entries to `/tracking/[entryId]` and link untracked ones to AniList directly (`https://anilist.co/anime/{id}` or `manga/{id}`). This requires checking `entryId` from user's tracked list during detail page render — the `getUserTrackedEntries` use case already returns `{anilistId, entryId}` pairs.

2. **Manga author display from AniList staff field**
   - What we know: AniList `staff.edges[].role` values are free-text strings; common values for manga include "Story", "Art", "Story & Art"
   - What's unclear: The exact canonical role strings — they may vary
   - Recommendation: Filter `staff.edges` for role containing "Story" or "Art" (case-insensitive match) to identify manga authors. Show first 2 results max.

3. **Sort direction toggle (ascending/descending)**
   - What we know: Left to Claude's discretion
   - What's unclear: Whether a sort direction URL param is wanted
   - Recommendation: Fixed sort directions per type: Rating=descending (best first), Title=ascending (A-Z), Date Added=descending (newest first). No toggle UI — these are the natural orderings for each sort key. Add a `sort_dir` URL param only if the planner wants to support toggling.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.mts` |
| Quick run command | `pnpm test -- --reporter=verbose tests/list/` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIST-01 | `getTrackingList` returns entries for user | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-01 | `getTrackingList` returns correct `hasMore` | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-02 | `getTrackingList` filters by status | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-02 | `getTrackingList` filters by mediaType | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-02 | `getStatusCounts` returns correct per-status counts | unit | `pnpm test -- tests/list/get-status-counts.test.ts` | ❌ Wave 0 |
| LIST-03 | `getTrackingList` sorts by rating descending | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-03 | `getTrackingList` sorts by title ascending nullsLast | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-03 | `getTrackingList` sorts by date_added descending | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ Wave 0 |
| LIST-04 | `getMediaDetails` returns synopsis, genres, studios | unit | `pnpm test -- tests/list/get-media-details.test.ts` | ❌ Wave 0 |
| LIST-04 | `getMediaDetails` filters relations to useful types | unit | `pnpm test -- tests/list/get-media-details.test.ts` | ❌ Wave 0 |
| LIST-04 | `getMediaDetails` returns null on rate limit (silent) | unit | `pnpm test -- tests/list/get-media-details.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- tests/list/`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/list/get-tracking-list.test.ts` — covers LIST-01, LIST-02, LIST-03 (mock `db` pattern from existing `tests/tracking/*.test.ts`)
- [ ] `tests/list/get-status-counts.test.ts` — covers LIST-02 count tab behavior
- [ ] `tests/list/get-media-details.test.ts` — covers LIST-04 adapter method (mock `fetch` + `anilistRateLimiter`)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/modules/tracking/`, `src/app/(app)/`, `src/components/` — all patterns verified by direct file inspection
- `src/db/schema/tracking.ts` — verified column names, types, enums
- `src/modules/tracking/infrastructure/adapters/anilist-adapter.ts` — verified existing query structure to extend
- `src/components/shared/placeholder-grid.tsx` and `skeleton-card.tsx` — verified reusable grid layout and card component
- `src/app/(app)/search/search-input.tsx` — verified URL param sync pattern with `useSearchParams` + `router.replace`
- [docs.anilist.co/reference/object/media](https://docs.anilist.co/reference/object/media) — Media type fields (description, genres, studios, staff, relations, meanScore, season, seasonYear) confirmed
- [docs.anilist.co/reference/enum/mediarelation](https://docs.anilist.co/reference/enum/mediarelation) — MediaRelation enum values confirmed

### Secondary (MEDIUM confidence)
- [LogRocket: Implementing infinite scroll in Next.js with Server Actions](https://blog.logrocket.com/implementing-infinite-scroll-next-js-server-actions/) — Intersection Observer + useTransition pattern for App Router; verified against Next.js docs
- [Next.js App Router: useSearchParams docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) — `router.replace` with `{ scroll: false }` confirmed for filter changes

### Tertiary (LOW confidence)
- MiyoList AniList GraphQL examples — extended media query field list (cross-verified against AniList reference docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in active use; no new dependencies
- Architecture: HIGH — all patterns are extensions of proven Phase 3/4 patterns or direct Drizzle/AniList API capabilities verified in docs
- Pitfalls: HIGH — stale closure pitfall is a well-documented IntersectionObserver issue; others identified from direct code inspection of existing nullable fields and AniList API behavior
- AniList extended query fields: MEDIUM — field names confirmed via docs.anilist.co reference page; exact `staff.role` strings for manga authors are LOW confidence (free-text)

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable stack — Next.js 16, Drizzle 0.45, AniList API v2 is long-term stable)
