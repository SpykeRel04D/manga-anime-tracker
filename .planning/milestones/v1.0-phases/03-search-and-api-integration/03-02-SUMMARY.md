---
phase: 03-search-and-api-integration
plan: 02
subsystem: ui
tags: [search-ui, debounce, shadcn, sonner, next-image, server-actions, url-state]

# Dependency graph
requires:
  - phase: 03-search-and-api-integration/plan-01
    provides: "searchMedia use case, addTrackingEntry use case, MediaSearchResult entity"
  - phase: 01-foundation
    provides: "Dark theme with oklch colors, shadcn UI primitives, Skeleton component"
  - phase: 02-authentication
    provides: "Auth session for server actions (auth.api.getSession)"
provides:
  - "/search page with debounced input and URL state sync (?q= param)"
  - "Horizontal search result cards with cover art, titles, type badges, status, counts"
  - "One-click Add to list server action with toast feedback"
  - "Already-tracked detection showing status badge instead of Add button"
  - "Loading skeleton and no-results empty states"
  - "Toaster component in root layout for app-wide toast notifications"
  - "Badge component for type pills and status indicators"
affects: [04-tracking-management]

# Tech tracking
tech-stack:
  added: [use-debounce, sonner, shadcn-badge]
  patterns: [debounced-url-sync, server-action-with-toast, horizontal-card-layout]

key-files:
  created:
    - src/app/(app)/search/page.tsx
    - src/app/(app)/search/search-input.tsx
    - src/app/(app)/search/search-results.tsx
    - src/app/(app)/search/search-result-card.tsx
    - src/app/(app)/search/search-skeleton.tsx
    - src/app/(app)/search/actions.ts
    - src/components/ui/sonner.tsx
    - src/components/ui/badge.tsx
  modified:
    - src/app/layout.tsx
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "use-debounce library with 300ms delay for search input URL sync"
  - "Horizontal card layout with cover image left, metadata right (per locked CONTEXT.md decision)"
  - "ANIME type badge uses chart-3 (blue), MANGA uses chart-2 (green) oklch colors"
  - "Server action wraps addTrackingEntry use case with auth check for secure client-server boundary"

patterns-established:
  - "Debounced URL state sync: useSearchParams + useRouter.replace with useDebouncedCallback for server-driven search"
  - "Server action toast pattern: useTransition + server action + sonner toast + router.refresh for optimistic-feel mutations"
  - "Horizontal media card: cover image (80px, 3:4 aspect) left, stacked metadata right, action button at bottom-right"

requirements-completed: [SRCH-01, SRCH-02, SRCH-03]

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 3 Plan 2: Search UI Summary

**Search page with debounced input, horizontal result cards (cover art + metadata + type badges), one-click Add to list with toast feedback, and URL state sync**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T22:10:21Z
- **Completed:** 2026-03-08T22:21:39Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Full /search page with debounced input synced to URL ?q= param for refreshable, shareable search state
- Horizontal result cards displaying AniList cover art, English/Romaji titles, colored type badges (ANIME=blue, MANGA=green), airing status, and episode/chapter counts
- One-click "Add to list" server action with sonner toast confirmation and automatic UI refresh showing tracked status badge
- Already-tracked series detected via getUserTrackedIds server action, displaying status badge instead of Add button
- Loading skeleton matching horizontal card layout and friendly no-results message for empty searches

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, add shadcn components, and build search page** - `2a6c642` (feat)
2. **Task 2: Verify complete search experience** - checkpoint:human-verify (approved by user)

## Files Created/Modified
- `src/app/(app)/search/page.tsx` - Server component: reads searchParams, fetches results via searchMedia, passes to client components
- `src/app/(app)/search/search-input.tsx` - Client component: debounced input synced with URL ?q= param via useDebouncedCallback
- `src/app/(app)/search/search-results.tsx` - Client component: renders vertical list of search result cards with empty/no-results states
- `src/app/(app)/search/search-result-card.tsx` - Horizontal card: cover image left, metadata right, Add to list / status badge action
- `src/app/(app)/search/search-skeleton.tsx` - Skeleton loader matching horizontal card layout (5 shimmer cards)
- `src/app/(app)/search/actions.ts` - Server actions: addToTrackingList (auth + use case), getUserTrackedIds (tracked IDs query)
- `src/components/ui/sonner.tsx` - shadcn Toaster component for app-wide toast notifications
- `src/components/ui/badge.tsx` - shadcn Badge component for type pills and status indicators
- `src/app/layout.tsx` - Modified: added Toaster component to root layout
- `package.json` - Modified: added use-debounce dependency
- `pnpm-lock.yaml` - Modified: lockfile updated

## Decisions Made
- Used `use-debounce` library with 300ms delay for input-to-URL sync (balances responsiveness with reduced API calls)
- Horizontal card layout with 80px cover image on left, stacked metadata on right (per locked CONTEXT.md user decision)
- ANIME type badge uses chart-3 oklch (blue), MANGA uses chart-2 oklch (green) -- consistent with warm dark theme
- Server action boundary wraps addTrackingEntry use case with auth.api.getSession check for secure mutations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Search and API integration phase complete -- users can search AniList and add anime/manga to their tracking list
- Tracking entries created with plan_to_watch default status, ready for Phase 4 tracking management (status updates, progress editing, list views)
- Toast notification pattern established, reusable for future mutation feedback across the app
- Badge component available for status pills throughout tracking UI

## Self-Check: PASSED

All 9 files verified present. Task 1 commit hash (2a6c642) verified in git log.

---
*Phase: 03-search-and-api-integration*
*Completed: 2026-03-08*
