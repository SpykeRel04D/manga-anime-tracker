---
phase: 05-list-ui-and-browsing
plan: "02"
subsystem: ui
tags: [nextjs, react, infinite-scroll, intersection-observer, url-params, tailwind]

dependency_graph:
  requires:
    - src/modules/tracking/application/use-cases/get-tracking-list.ts
    - src/modules/tracking/application/use-cases/get-status-counts.ts
    - src/modules/tracking/domain/entities/tracking-entry.ts
    - src/components/shared/skeleton-card.tsx
  provides:
    - src/app/(app)/page.tsx (server component, replaces placeholder grid)
    - src/app/(app)/tracking-grid.tsx (infinite scroll client component)
    - src/app/(app)/tracking-card.tsx (cover card with badge + progress bar)
    - src/app/(app)/filter-bar.tsx (status tabs, type toggle, sort dropdown, URL-synced)
    - src/app/(app)/actions.ts (fetchTrackingPage server action)
    - src/components/shared/empty-state.tsx (reusable empty state with optional CTA)
  affects:
    - Plan 03 (detail page linked from TrackingCard href=/tracking/[id])

tech_stack:
  added: []
  patterns:
    - IntersectionObserver sentinel pattern for infinite scroll (no library)
    - useTransition for non-blocking server action page loads
    - key prop on TrackingGrid resets scroll state on filter/sort change
    - URL params via useSearchParams + router.replace({ scroll: false }) for all filter/sort state
    - base-ui Button render prop pattern for link-as-button (render={<Link>})
    - Server component parallel fetches with Promise.all (list + status counts)

key-files:
  created:
    - src/app/(app)/tracking-card.tsx
    - src/app/(app)/filter-bar.tsx
    - src/app/(app)/tracking-grid.tsx
    - src/app/(app)/actions.ts
    - src/components/shared/empty-state.tsx
  modified:
    - src/app/(app)/page.tsx

key-decisions:
  - "key prop on TrackingGrid (status+mediaType+sort) forces remount on filter change, resetting accumulated scroll entries and page counter"
  - "IntersectionObserver with threshold: 0.1 native (no library) per research recommendation"
  - "useTransition wraps fetchTrackingPage calls so UI is non-blocking during page loads"
  - "base-ui render prop pattern: Button render={<Link>} instead of asChild (project UI pattern)"
  - "Fixed sort directions: Rating=desc (best first), Title=asc (A-Z), Date Added=desc (newest first) -- no toggle needed"

patterns-established:
  - "IntersectionObserver sentinel: col-span-full h-4 div at grid end, observer in useEffect with deps [page, hasMore, isPending, currentFilters]"
  - "URL param sync pattern: useSearchParams + router.replace(pathname?params, { scroll: false })"

requirements-completed: [LIST-01, LIST-02, LIST-03]

duration: 4min
completed: "2026-03-10"
---

# Phase 5 Plan 02: List UI and Browsing Summary

**Responsive cover grid with status badge overlay and progress bar, URL-synced filter/sort bar, and IntersectionObserver infinite scroll replacing the placeholder shimmer home page.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-10T22:20:00Z
- **Completed:** 2026-03-10T22:23:00Z
- **Tasks:** 3 of 3
- **Files modified:** 6

## Accomplishments
- TrackingCard with cover image (or gradient fallback), colored status badge overlay, thin progress bar at bottom edge, title below
- FilterBar with scrollable status tabs (showing counts), type toggle, sort dropdown -- all syncing to URL params
- TrackingGrid with IntersectionObserver infinite scroll, useTransition non-blocking loads, SkeletonCard loading states
- Home page server component fetching list + status counts in parallel, rendering EmptyState variants for empty collection and empty filter results
- fetchTrackingPage server action with auth check and input validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Tracking card, filter bar, empty state, and server action** - `c18d2f2` (feat)
2. **Task 2: Home page wiring with tracking grid and infinite scroll** - `9289064` (feat)
3. **Task 3: Visual verification** - approved (user verified grid, filters, sort, and scroll)

Post-checkpoint fix commits:
- `ab2cccf` fix(05-02): sort dropdown labels, card height alignment, status badge design
- `e04feaf` fix(05-02): increase card title area height to h-10

## Files Created/Modified
- `src/app/(app)/tracking-card.tsx` - Cover card with status badge, progress bar, title; links to /tracking/[id]
- `src/app/(app)/filter-bar.tsx` - Status tab bar (horizontal scroll), type toggle, sort dropdown, URL params sync
- `src/app/(app)/tracking-grid.tsx` - Infinite scroll grid using IntersectionObserver + useTransition + server action
- `src/app/(app)/actions.ts` - fetchTrackingPage server action with auth guard and input validation
- `src/app/(app)/page.tsx` - Rewired home page: parallel server fetches, FilterBar + TrackingGrid or EmptyState
- `src/components/shared/empty-state.tsx` - Reusable centered empty state with icon, message, optional CTA button

## Decisions Made

1. **key prop for scroll reset**: `key={status+mediaType+sort}` on TrackingGrid ensures React remounts the component on any filter/sort change, correctly resetting `entries`, `page`, and `hasMore` state.

2. **Native IntersectionObserver**: No library (react-intersection-observer) used per research recommendation to avoid React 19 ref callback incompatibilities.

3. **useTransition for non-blocking scroll**: Wrapping server action in `startTransition` keeps the UI interactive while the next page loads.

4. **base-ui render prop for Button as Link**: This project uses base-ui components with `render` prop pattern instead of Radix `asChild`. The linter enforced this automatically on empty-state.tsx.

5. **Fixed sort directions**: Rating=descending (best first), Title=ascending (A-Z), Date Added=descending (newest first). No user toggle needed per research.

## Deviations from Plan

None - plan executed exactly as written.

Note: The linter auto-transformed `Button asChild` to `Button render={<Link>}` in empty-state.tsx during creation (project's base-ui pattern). This is correct project convention, not a deviation.

## Issues Encountered

None - TypeScript compiles cleanly, build compiles successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Home page visual grid is fully verified and complete
- Task 3 human checkpoint approved: grid, filter tabs, type toggle, sort dropdown, and URL persistence all confirmed working
- Minor visual fixes applied post-checkpoint (sort labels, card height, badge design)
- Plan 03 (detail page enhancements) already committed and ready for its own summary
- Phase 5 is complete -- all 3 plans done

## Self-Check: PASSED

Files verified:
- FOUND: src/app/(app)/tracking-card.tsx
- FOUND: src/app/(app)/filter-bar.tsx
- FOUND: src/app/(app)/tracking-grid.tsx
- FOUND: src/app/(app)/actions.ts
- FOUND: src/app/(app)/page.tsx
- FOUND: src/components/shared/empty-state.tsx

Commits verified:
- c18d2f2: feat(05-02): add TrackingCard, FilterBar, EmptyState, and fetchTrackingPage action
- 9289064: feat(05-02): wire home page and tracking grid with infinite scroll
- 5bb1fa2: docs(05-02): complete list UI and browsing plan

---
*Phase: 05-list-ui-and-browsing*
*Completed: 2026-03-10*
