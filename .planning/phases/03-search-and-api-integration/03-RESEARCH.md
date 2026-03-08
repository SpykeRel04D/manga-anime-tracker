# Phase 3: Search and API Integration - Research

**Researched:** 2026-03-08
**Domain:** AniList GraphQL API integration, Next.js search UI with URL state, hexagonal architecture adapter
**Confidence:** HIGH

## Summary

This phase integrates the AniList GraphQL API for anime/manga search, builds a search page with URL-synced query params and debounced input, and implements the "add to list" quick-action. The AniList API is a public GraphQL endpoint at `https://graphql.anilist.co` that requires no authentication for search queries. The API currently operates in a degraded state limited to 30 requests per minute (normal is 90 req/min), making client-side debounce and conservative request patterns essential.

The search feature follows the official Next.js App Router pattern: a client component with `useSearchParams` for URL sync, `use-debounce` for input debounce, and server-side data fetching via the page's `searchParams` prop. The AniList adapter slots into the existing hexagonal architecture under `src/modules/tracking/infrastructure/adapters/`. The "add to list" action uses a Next.js server action calling Drizzle ORM to insert into the existing `trackingEntries` table.

**Primary recommendation:** Use plain `fetch` for GraphQL calls (no Apollo/urql needed), the official Next.js search pattern with `useSearchParams` + `use-debounce`, Sonner via shadcn for toast notifications, and a simple in-memory token bucket rate limiter on the server side.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Horizontal card layout: cover image on the left, text info on the right
- Medium cover thumbnail (~80-100px wide) -- visible but leaves room for metadata
- Required fields only: cover art, title, type badge, airing/publishing status, episode/chapter count
- Show both English and Romaji titles -- English as primary (larger), Romaji as secondary (smaller) underneath
- No extra metadata (no genres, no AniList score)
- Prominent full-width search input at the top of the /search page, results listed below
- Empty state: just the search bar with placeholder text ("Search anime or manga..."), empty space below -- minimal prompt
- Loading state: skeleton cards matching the horizontal card layout (reuse shimmer pattern from skeleton-card.tsx)
- No results: simple text message -- "No results found for '[query]'" with spelling suggestion
- Search URL syncs with query param (e.g., /search?q=naruto) -- page is refreshable and deep-linkable
- Each card has an "Add to list" button -- one click adds with default status ("Plan to Watch" for anime, "Plan to Read" for manga)
- Success feedback via toast notification
- If series is already tracked, replace Add button with a status badge (e.g., "Watching", "Completed") -- prevents duplicates and gives instant context
- Cards are not clickable as a whole -- only the Add button / status badge is interactive
- Detail pages come in Phase 5 (LIST-04)
- Unified search: single query returns both anime and manga results mixed together
- Type badge: colored pill badge ("ANIME" in one color, "MANGA" in another) for instant visual distinction
- ~10-15 results per search, single page, no pagination -- keeps API calls low within 30 req/min limit
- No filter tabs or toggles -- unified results only

### Claude's Discretion
- AniList GraphQL query design and field selection
- Rate limiting implementation (token bucket, sliding window, etc.)
- Debounce timing (300-500ms range)
- Toast notification library/component choice
- Exact badge colors for anime vs manga type
- Error handling for API failures (network errors, rate limit hits)
- Caching strategy for search results
- Hexagonal architecture placement (ports, adapters, use cases)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | User can search anime by title via AniList API with debounced input | AniList Page query with `search` variable + `type: ANIME` confirmed working; `use-debounce` library with 300ms delay follows official Next.js pattern |
| SRCH-02 | User can search manga by title via AniList API with debounced input | Same query works with `type: MANGA`; unified search omits type filter to return both -- individual type-filtered queries also available |
| SRCH-03 | Search results display cover art, title, type, airing status, and episode/chapter count | All fields verified via live API introspection: `title.english`, `title.romaji`, `type`, `status`, `episodes`, `chapters`, `coverImage.large` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native `fetch` | Built-in | GraphQL HTTP client | AniList is a simple POST endpoint; no need for Apollo/urql overhead for a single query type |
| `use-debounce` | ^10.x | Debounce search input | Recommended by official Next.js tutorial; provides `useDebouncedCallback` hook |
| `sonner` (via shadcn) | ^2.x | Toast notifications | shadcn's built-in toast solution; `pnpm dlx shadcn@latest add sonner` installs pre-styled component |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next/image` | Built-in (Next.js 16.1.6) | Optimized cover images from AniList CDN | For all `coverImage.large` URLs from AniList |
| `shadcn/badge` | N/A (shadcn component) | Type badges (ANIME/MANGA), status badges | `pnpm dlx shadcn@latest add badge` |
| `drizzle-orm` | ^0.45.1 (already installed) | Database insert for "add to list" | Server action inserts into `trackingEntries` table |
| `lucide-react` | ^0.577.0 (already installed) | Search icon, plus icon | For search input decoration and add button |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `fetch` | `graphql-request` | Lighter than Apollo but still unnecessary; native fetch handles the single POST fine |
| `use-debounce` | Custom `useDebounce` hook | ~10 lines of code, but `use-debounce` handles edge cases (leading/trailing, maxWait) and is recommended by Next.js docs |
| `sonner` | `react-hot-toast` | Sonner has first-class shadcn integration; already themed with the project's design system |

**Installation:**
```bash
pnpm install use-debounce
pnpm dlx shadcn@latest add sonner badge
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── modules/tracking/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── media-search-result.ts      # SearchResult type/interface
│   │   └── ports/
│   │       └── media-search-port.ts         # Port interface for search
│   ├── application/
│   │   └── use-cases/
│   │       ├── search-media.ts              # Search use case (calls port)
│   │       └── add-tracking-entry.ts        # Add-to-list use case
│   └── infrastructure/
│       └── adapters/
│           └── anilist-adapter.ts           # AniList GraphQL implementation
├── app/(app)/search/
│   ├── page.tsx                             # Server component: reads searchParams, fetches data
│   ├── search-input.tsx                     # Client component: debounced input, URL sync
│   ├── search-results.tsx                   # Client component: renders result cards
│   └── search-result-card.tsx               # Individual result card component
├── app/(app)/search/actions.ts              # Server action: addToTrackingList
├── components/ui/
│   ├── sonner.tsx                           # shadcn Toaster component (auto-generated)
│   └── badge.tsx                            # shadcn Badge component (auto-generated)
└── lib/
    └── anilist/
        └── rate-limiter.ts                  # Token bucket rate limiter (singleton)
```

### Pattern 1: Next.js Search with URL State Sync
**What:** Search input syncs with URL query params using `useSearchParams` + `useRouter().replace()`
**When to use:** Any search page that should be bookmarkable/shareable
**Example:**
```typescript
// Source: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
'use client'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get('q')?.toString()}
      placeholder="Search anime or manga..."
    />
  )
}
```

### Pattern 2: Server Component Page with searchParams
**What:** Page server component reads URL params and fetches data server-side
**When to use:** Initial page load and URL-driven data fetching
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params
// app/(app)/search/page.tsx
export default async function SearchPage(props: {
  searchParams?: Promise<{ q?: string }>
}) {
  const searchParams = await props.searchParams
  const query = searchParams?.q || ''

  // Fetch results server-side via use case
  const results = query ? await searchMedia(query) : []

  return (
    <main>
      <SearchInput />
      <SearchResults results={results} query={query} />
    </main>
  )
}
```

### Pattern 3: Hexagonal Port/Adapter for AniList
**What:** Define a port interface, implement with AniList GraphQL adapter
**When to use:** All external API access goes through ports
**Example:**
```typescript
// domain/ports/media-search-port.ts
export interface MediaSearchPort {
  searchMedia(query: string, perPage?: number): Promise<MediaSearchResult[]>
}

// infrastructure/adapters/anilist-adapter.ts
export class AniListAdapter implements MediaSearchPort {
  async searchMedia(query: string, perPage = 15): Promise<MediaSearchResult[]> {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SEARCH_QUERY, variables: { search: query, perPage } }),
    })
    // ... transform response to domain entities
  }
}
```

### Pattern 4: Server Action for "Add to List"
**What:** Server action validates and inserts tracking entry via Drizzle
**When to use:** Mutations that need database access and auth context
**Example:**
```typescript
// app/(app)/search/actions.ts
'use server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export async function addToTrackingList(data: {
  anilistId: number
  mediaType: 'anime' | 'manga'
  titleEnglish: string | null
  titleRomaji: string | null
  coverImageUrl: string | null
  totalEpisodes: number | null
  totalChapters: number | null
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Not authenticated')

  await db.insert(trackingEntries).values({
    userId: session.user.id,
    status: data.mediaType === 'anime' ? 'plan_to_watch' : 'plan_to_watch',
    ...data,
  })
}
```

### Anti-Patterns to Avoid
- **Client-side GraphQL calls:** Never call AniList from the browser -- always go through server components or server actions to protect rate limits and avoid CORS complexity
- **Apollo Client for a single query:** Massive bundle overhead for a single search POST; native fetch is sufficient
- **Controlled input for search:** Use `defaultValue` (uncontrolled) to let the URL be source of truth, not React state
- **Fetching on every keystroke:** Always debounce; without it, 6-character query = 6 API calls
- **Ignoring null titles:** AniList `title.english` is frequently null; always fall back to `title.romaji`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input debouncing | Custom setTimeout/clearTimeout | `use-debounce` `useDebouncedCallback` | Handles leading/trailing edge, cleanup, and `isPending()` status |
| Toast notifications | Custom alert/notification system | `sonner` via shadcn | Pre-themed, accessible, stacks properly, supports promise toasts |
| URL query param manipulation | Manual string concatenation | `URLSearchParams` Web API | Built-in, handles encoding, works with `useSearchParams` |
| Badge/pill components | Custom styled divs | shadcn `Badge` component | Pre-styled with project theme, supports variants |
| Image optimization | `<img>` tags with manual sizing | `next/image` with `remotePatterns` | Automatic WebP/AVIF, lazy loading, prevents CLS |

**Key insight:** The search page is mostly composed of existing Next.js primitives and shadcn components. The only truly custom code is the AniList GraphQL adapter and the rate limiter.

## Common Pitfalls

### Pitfall 1: AniList title.english is Frequently Null
**What goes wrong:** Displaying blank titles because many anime/manga entries only have romaji titles
**Why it happens:** Not all AniList entries have an English title filled in; `title.english` returns `null`
**How to avoid:** Always use `title.english ?? title.romaji` as display logic; show romaji as secondary only when English exists
**Warning signs:** Empty title areas in search results, especially for lesser-known series

### Pitfall 2: Rate Limit 429 During Rapid Searches
**What goes wrong:** User types multiple queries quickly, each triggers an API call, hitting the 30 req/min limit
**Why it happens:** Even with 300ms debounce, a user searching "naruto", clearing, then searching "one piece" generates 2 calls in quick succession. Multiply by multiple users or rapid iteration.
**How to avoid:** Implement server-side rate limiter (token bucket) that queues/rejects excess requests gracefully. Return cached results when available. Show friendly error state instead of crashing.
**Warning signs:** 429 HTTP status codes in server logs, `X-RateLimit-Remaining: 0` headers

### Pitfall 3: next/image Requires remotePatterns Configuration
**What goes wrong:** Images fail to load with 400 error; Next.js blocks unregistered external domains
**Why it happens:** `next.config.ts` must whitelist AniList's CDN domain (`s4.anilist.co`)
**How to avoid:** Add `remotePatterns` to `next.config.ts` before any image rendering work:
```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 's4.anilist.co', pathname: '/file/anilistcdn/**' },
  ],
}
```
**Warning signs:** Broken image icons, console errors about Image Optimization

### Pitfall 4: searchParams is a Promise in Next.js 16 Server Components
**What goes wrong:** TypeScript errors or runtime crashes accessing `searchParams.q` directly
**Why it happens:** In Next.js 15+, `searchParams` in page components is a Promise and must be awaited
**How to avoid:** Always `await props.searchParams` before accessing properties
**Warning signs:** TypeScript type errors about Promise, undefined query values

### Pitfall 5: Duplicate Tracking Entries
**What goes wrong:** User adds the same anime/manga twice, creating duplicate rows
**Why it happens:** No unique constraint on `(userId, anilistId)` or missing duplicate check
**How to avoid:** Add a database unique constraint on `(userId, anilistId)` or check existence before insert. Also, the UI should show "already tracked" badge on search results for items the user has already added.
**Warning signs:** Multiple entries for the same series in user's tracking list

### Pitfall 6: AniList GraphQL Error Handling
**What goes wrong:** Unhandled errors crash the search page when AniList is down or returns errors
**Why it happens:** GraphQL APIs return 200 OK even for errors (errors are in the response body), and network failures throw exceptions
**How to avoid:** Check `response.data.errors` array in addition to HTTP status. Wrap fetch in try/catch. Return empty results with error message on failure.
**Warning signs:** White screen on search page, unhandled promise rejection

## Code Examples

Verified patterns from official sources and live API testing:

### AniList Search GraphQL Query
```graphql
# Source: Live-tested against https://graphql.anilist.co on 2026-03-08
query SearchMedia($search: String!, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
      perPage
    }
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
}
```

**Variables:** `{ "search": "Naruto", "page": 1, "perPage": 15 }`

**Verified response shape (live):**
```json
{
  "data": {
    "Page": {
      "pageInfo": { "currentPage": 1, "hasNextPage": true, "perPage": 3 },
      "media": [
        {
          "id": 20,
          "title": { "english": "Naruto", "romaji": "NARUTO" },
          "type": "ANIME",
          "status": "FINISHED",
          "episodes": 220,
          "chapters": null,
          "coverImage": {
            "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20-dE6UHbFFg1A5.jpg",
            "color": "#e47850"
          }
        }
      ]
    }
  }
}
```

### AniList API Fetch Pattern
```typescript
// Source: https://docs.anilist.co/guide/graphql/
const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

async function queryAniList<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache for 5 minutes
  })

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      throw new Error(`Rate limited. Retry after ${retryAfter}s`)
    }
    throw new Error(`AniList API error: ${response.status}`)
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? 'Unknown AniList error')
  }

  return json.data
}
```

### Token Bucket Rate Limiter
```typescript
// Simple in-memory token bucket for server-side rate limiting
class TokenBucket {
  private tokens: number
  private lastRefill: number

  constructor(
    private capacity: number,     // max tokens (e.g., 25 for safety margin under 30 limit)
    private refillRate: number,   // tokens per second (e.g., 25/60 = 0.417)
  ) {
    this.tokens = capacity
    this.lastRefill = Date.now()
  }

  tryConsume(): boolean {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return true
    }
    return false
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }
}

// Singleton: 25 req/min to stay safely under AniList's 30 req/min degraded limit
export const anilistRateLimiter = new TokenBucket(25, 25 / 60)
```

### next/image Remote Patterns Configuration
```typescript
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/images
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        pathname: '/file/anilistcdn/**',
      },
    ],
  },
}

export default nextConfig
```

### Sonner Toast Setup
```typescript
// Source: https://ui.shadcn.com/docs/components/radix/sonner
// In root layout (src/app/layout.tsx), add <Toaster /> after installing:
// pnpm dlx shadcn@latest add sonner

import { Toaster } from '@/components/ui/sonner'

// Usage in client components:
import { toast } from 'sonner'
toast.success('Added to your list!')
toast.error('Failed to add. Please try again.')
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` + query params | `searchParams` Promise prop in App Router | Next.js 15 (2024) | Must `await` searchParams in page components |
| Apollo Client for all GraphQL | Native `fetch` for simple cases | 2023+ (industry shift) | No need for heavy GraphQL client libraries for simple read-only queries |
| `useEffect` + `setTimeout` debounce | `use-debounce` library | 2022+ (community consensus) | Cleaner API, handles edge cases, recommended by Next.js |
| `react-toastify` / `react-hot-toast` | `sonner` via shadcn | 2024+ (shadcn adoption) | Native shadcn theming, simpler API, lighter bundle |
| AniList 90 req/min limit | AniList 30 req/min (degraded) | Unknown (ongoing) | Must design conservatively for 30 req/min baseline |

**Deprecated/outdated:**
- AniList `total` and `lastPage` fields in PageInfo: officially documented as inaccurate, use only `hasNextPage`
- `domains` config in next.config: replaced by `remotePatterns` in Next.js 14+

## AniList API Reference

### Endpoint
`POST https://graphql.anilist.co`

### Authentication
**Not required** for search queries. No API key needed.

### Rate Limits
| State | Limit | Status |
|-------|-------|--------|
| Normal | 90 req/min | Not currently active |
| Degraded (current) | 30 req/min | Active as of 2026-03-08 |
| Burst | Additional short-term limiter | Always active |

**Response headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
**On limit:** HTTP 429, `Retry-After` header, 1-minute cooldown

### Key Enums (verified via introspection 2026-03-08)
**MediaStatus:** `FINISHED`, `RELEASING`, `NOT_YET_RELEASED`, `CANCELLED`, `HIATUS`
**MediaType:** `ANIME`, `MANGA`
**CoverImage fields:** `extraLarge`, `large`, `medium`, `color`

### Important Notes
- `isAdult: false` filter should be included in all queries to exclude adult content
- `title.english` is frequently null; always have a romaji fallback
- `coverImage.large` is the right size for card thumbnails (~230px wide)
- `coverImage.medium` is smaller (~100px) -- good for smaller list views
- Images served from `s4.anilist.co` CDN domain
- Sorting by `POPULARITY_DESC` gives most relevant results for general searches

## Open Questions

1. **Exact debounce timing within 300-500ms range**
   - What we know: Official Next.js tutorial uses 300ms; user specified 300-500ms range
   - What's unclear: Whether 300ms feels snappy enough vs. 400ms reducing more API calls
   - Recommendation: Start with 300ms (official recommendation), tunable if needed

2. **Badge color choices for ANIME vs MANGA type pills**
   - What we know: Need distinct colors, project uses oklch warm dark theme
   - What's unclear: Exact color values that look good on dark background
   - Recommendation: Use chart colors from theme -- `chart-3` (blue-ish, oklch 0.6 0.15 250) for ANIME, `chart-2` (green-ish, oklch 0.7 0.12 160) for MANGA -- visually distinct and already in palette

3. **In-memory rate limiter reset on serverless cold start**
   - What we know: Vercel serverless functions may cold-start, resetting in-memory state
   - What's unclear: How frequently this resets in practice for a single-user app
   - Recommendation: Acceptable for single-user app; token bucket resets full on cold start, which is fine since it starts with full capacity. Not a concern for production.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.mts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Search anime by title via AniList API with debounced input | unit | `pnpm vitest run tests/search/anilist-adapter.test.ts -t "anime"` | Wave 0 |
| SRCH-02 | Search manga by title via AniList API with debounced input | unit | `pnpm vitest run tests/search/anilist-adapter.test.ts -t "manga"` | Wave 0 |
| SRCH-03 | Search results display cover art, title, type, status, episode/chapter count | unit | `pnpm vitest run tests/search/search-result-mapping.test.ts` | Wave 0 |
| N/A | Rate limiter token bucket behavior | unit | `pnpm vitest run tests/search/rate-limiter.test.ts` | Wave 0 |
| N/A | Add-to-list server action validates and inserts correctly | unit | `pnpm vitest run tests/search/add-tracking-entry.test.ts` | Wave 0 |
| N/A | AniList adapter handles errors (429, network, malformed response) | unit | `pnpm vitest run tests/search/anilist-adapter.test.ts -t "error"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/search/anilist-adapter.test.ts` -- covers SRCH-01, SRCH-02 (mock fetch, verify query shape and response mapping)
- [ ] `tests/search/search-result-mapping.test.ts` -- covers SRCH-03 (entity mapping: null title fallback, field extraction)
- [ ] `tests/search/rate-limiter.test.ts` -- covers rate limiter token bucket (consume, refill, reject when empty)
- [ ] `tests/search/add-tracking-entry.test.ts` -- covers add-to-list use case (validate input, check for duplicates)

## Sources

### Primary (HIGH confidence)
- AniList GraphQL API endpoint: `https://graphql.anilist.co` -- live-tested with introspection queries on 2026-03-08
- AniList rate limiting: https://docs.anilist.co/guide/rate-limiting -- confirmed 30 req/min degraded state
- AniList media query docs: https://docs.anilist.co/guide/graphql/queries/media -- field schema verified
- AniList pagination: https://docs.anilist.co/guide/graphql/pagination -- PageInfo structure
- AniList considerations: https://docs.anilist.co/guide/considerations -- adult content filtering, reliability notes
- Next.js search pattern: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination -- official tutorial
- Next.js searchParams: https://nextjs.org/docs/app/api-reference/functions/use-search-params
- Next.js image config: https://nextjs.org/docs/app/api-reference/config/next-config-js/images
- shadcn Sonner: https://ui.shadcn.com/docs/components/radix/sonner
- shadcn Badge: https://ui.shadcn.com/docs/components/radix/badge

### Secondary (MEDIUM confidence)
- `use-debounce` npm: https://www.npmjs.com/package/use-debounce -- widely used, recommended by Next.js
- AniList schema introspection -- live API calls confirm enum values and field types

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified via official docs and live testing
- Architecture: HIGH -- follows established hexagonal pattern in codebase + official Next.js search pattern
- Pitfalls: HIGH -- verified via live API testing (null titles, CDN domain, rate limit headers)

**Research date:** 2026-03-08
**Valid until:** 2026-04-07 (30 days -- AniList API is stable, Next.js 16 is current)
