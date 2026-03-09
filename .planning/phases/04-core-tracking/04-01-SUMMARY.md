---
phase: 04-core-tracking
plan: 01
subsystem: api
tags: [drizzle, anilist, graphql, use-cases, tdd, vitest]

# Dependency graph
requires:
  - phase: 03-search-api
    provides: AniList adapter, rate limiter, addTrackingEntry use case, tracking schema
provides:
  - getTrackingEntry use case for fetching single entry by id+userId
  - updateStatus use case for status mutations
  - updateProgress use case with clamping and auto-complete logic
  - updateRating use case with 1-10 validation
  - updateNotes use case with empty-to-null cleaning
  - removeEntry use case for userId-scoped deletion
  - refreshMetadata use case with 24h cooldown and force bypass
  - getMediaById adapter method for single AniList media fetch
  - TrackingEntry domain entity interface
  - lastSyncedAt schema column for metadata refresh cooldown
affects: [04-core-tracking plan 02 (edit page UI), 05-list-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [use-case-per-mutation, discriminated-union-result-types, userId-scoped-queries, silent-failure-for-background-refresh]

key-files:
  created:
    - src/modules/tracking/domain/entities/tracking-entry.ts
    - src/modules/tracking/application/use-cases/get-tracking-entry.ts
    - src/modules/tracking/application/use-cases/update-status.ts
    - src/modules/tracking/application/use-cases/update-progress.ts
    - src/modules/tracking/application/use-cases/update-rating.ts
    - src/modules/tracking/application/use-cases/update-notes.ts
    - src/modules/tracking/application/use-cases/remove-entry.ts
    - src/modules/tracking/application/use-cases/refresh-metadata.ts
    - tests/tracking/get-tracking-entry.test.ts
    - tests/tracking/update-status.test.ts
    - tests/tracking/update-progress.test.ts
    - tests/tracking/update-rating.test.ts
    - tests/tracking/update-notes.test.ts
    - tests/tracking/remove-entry.test.ts
    - tests/tracking/refresh-metadata.test.ts
  modified:
    - src/db/schema/tracking.ts
    - src/modules/tracking/infrastructure/adapters/anilist-adapter.ts

key-decisions:
  - "Silent failure for getMediaById -- returns null on any error (rate limit, network, API) to never disrupt background refresh"
  - "Progress clamping uses Math.max(0, Math.min(progress, total ?? Infinity)) for clean min/max enforcement"
  - "Auto-complete sets status to completed in the same database update as the progress change (atomic)"
  - "Empty notes string stored as null for clean database state"

patterns-established:
  - "Use case per mutation: each tracking field change has its own exported async function with typed result"
  - "Discriminated union results: { success: true, ... } | { success: false, error: string } for all mutations"
  - "userId scope on every query: and(eq(id, entryId), eq(userId, userId)) prevents cross-user access"
  - "Silent adapter failure: background refreshes return null instead of throwing to preserve cached data display"

requirements-completed: [TRCK-01, TRCK-02, TRCK-03, TRCK-04, TRCK-05, TRCK-06]

# Metrics
duration: 4min
completed: 2026-03-09
---

# Phase 4 Plan 01: Tracking Backend Summary

**7 tracking use cases with TDD, schema migration for lastSyncedAt, AniList getMediaById adapter, and progress clamping with auto-complete logic**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-09T13:10:12Z
- **Completed:** 2026-03-09T13:14:43Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Created complete backend for all tracking mutations: get, update-status, update-progress, update-rating, update-notes, remove, and refresh-metadata
- Implemented progress clamping (0 to totalEpisodes/totalChapters) with auto-complete to "completed" status when progress reaches total
- Extended AniList adapter with getMediaById for metadata refresh, respecting 24h cooldown with force bypass
- All 148 tests pass (27 new tracking tests + 121 existing)

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema, domain entity, and 6 use cases** - `35b3823` (test: RED) + `90e7e6e` (feat: GREEN)
2. **Task 2: AniList adapter and refresh-metadata** - `4ed016e` (test: RED) + `9549736` (feat: GREEN)

_TDD tasks each have 2 commits (test then implementation)_

## Files Created/Modified
- `src/db/schema/tracking.ts` - Added lastSyncedAt nullable timestamp column
- `src/modules/tracking/domain/entities/tracking-entry.ts` - TrackingEntry interface matching full table shape
- `src/modules/tracking/application/use-cases/get-tracking-entry.ts` - Fetch single entry by id + userId
- `src/modules/tracking/application/use-cases/update-status.ts` - Update status enum value
- `src/modules/tracking/application/use-cases/update-progress.ts` - Update progress with clamping and auto-complete
- `src/modules/tracking/application/use-cases/update-rating.ts` - Update rating (1-10 or null) with validation
- `src/modules/tracking/application/use-cases/update-notes.ts` - Update notes with empty-to-null cleaning
- `src/modules/tracking/application/use-cases/remove-entry.ts` - Delete entry scoped by userId
- `src/modules/tracking/application/use-cases/refresh-metadata.ts` - Refresh from AniList with 24h cooldown
- `src/modules/tracking/infrastructure/adapters/anilist-adapter.ts` - Added getMediaById method and MEDIA_BY_ID_QUERY
- `tests/tracking/get-tracking-entry.test.ts` - 3 tests
- `tests/tracking/update-status.test.ts` - 2 tests
- `tests/tracking/update-progress.test.ts` - 7 tests (clamping, auto-complete, ongoing series)
- `tests/tracking/update-rating.test.ts` - 4 tests (valid, null, out-of-range, not-found)
- `tests/tracking/update-notes.test.ts` - 3 tests
- `tests/tracking/remove-entry.test.ts` - 2 tests
- `tests/tracking/refresh-metadata.test.ts` - 6 tests (cooldown, force, silent failure)

## Decisions Made
- Silent failure for getMediaById: returns null on any error (rate limit, network, API) to never disrupt background refresh UX
- Progress clamping uses `Math.max(0, Math.min(progress, total ?? Infinity))` for clean enforcement
- Auto-complete sets status to completed in the same database update as the progress change (atomic, no race condition)
- Empty notes string stored as null for clean database state
- lastSyncedAt column is nullable (null means "never synced, needs refresh")

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing afterEach import in refresh-metadata test**
- **Found during:** Task 2 (refresh-metadata test)
- **Issue:** Test used `afterEach` for `vi.useRealTimers()` but forgot to import it from vitest
- **Fix:** Added `afterEach` to the import statement
- **Files modified:** tests/tracking/refresh-metadata.test.ts
- **Verification:** Test suite passes
- **Committed in:** 9549736 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial missing import fix. No scope creep.

## Issues Encountered
- Database push (`pnpm db:push`) failed due to Docker/PostgreSQL not running locally. Schema change (lastSyncedAt column) is correct and will apply when database is started. Not a blocker since all tests use mocked database.

## User Setup Required
None - no external service configuration required. Schema migration will apply on next `pnpm db:push` when database is running.

## Next Phase Readiness
- All 7 use cases ready for Plan 02 (edit page UI) to consume via server actions
- TrackingEntry type available for server component props
- getMediaById available for metadata refresh on edit page visit
- Plan 02 will wire these use cases to the edit page at `/tracking/[id]`

## Self-Check: PASSED

- All 17 files verified present
- All 4 task commits verified (35b3823, 90e7e6e, 4ed016e, 9549736)
- Full test suite: 148/148 passing

---
*Phase: 04-core-tracking*
*Completed: 2026-03-09*
