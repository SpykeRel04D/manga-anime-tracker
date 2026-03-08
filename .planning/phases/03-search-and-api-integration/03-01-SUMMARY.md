---
phase: 03-search-and-api-integration
plan: 01
subsystem: api
tags: [anilist, graphql, rate-limiter, hexagonal-architecture, drizzle, token-bucket]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Hexagonal DDD folder structure, Drizzle ORM schema with trackingEntries table"
  - phase: 02-authentication
    provides: "User authentication (userId for tracking entries)"
provides:
  - "MediaSearchResult domain entity with AniList response mapping"
  - "MediaSearchPort interface (hexagonal port for search abstraction)"
  - "AniListAdapter implementing MediaSearchPort with GraphQL fetch"
  - "TokenBucket rate limiter singleton (25 req/min safety margin)"
  - "searchMedia use case wrapping adapter with input validation"
  - "addTrackingEntry use case with duplicate prevention"
  - "next.config.ts remotePatterns for AniList CDN images"
affects: [03-02-search-ui, 04-tracking-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [hexagonal-port-adapter, token-bucket-rate-limiter, graphql-fetch, domain-entity-mapping]

key-files:
  created:
    - src/modules/tracking/domain/entities/media-search-result.ts
    - src/modules/tracking/domain/ports/media-search-port.ts
    - src/modules/tracking/infrastructure/adapters/anilist-adapter.ts
    - src/lib/anilist/rate-limiter.ts
    - src/modules/tracking/application/use-cases/search-media.ts
    - src/modules/tracking/application/use-cases/add-tracking-entry.ts
    - tests/search/rate-limiter.test.ts
    - tests/search/search-result-mapping.test.ts
    - tests/search/anilist-adapter.test.ts
    - tests/search/add-tracking-entry.test.ts
  modified:
    - next.config.ts

key-decisions:
  - "Native fetch for AniList GraphQL (no Apollo/urql needed for single query type)"
  - "Token bucket rate limiter at 25 req/min (safety margin under AniList 30 req/min degraded limit)"
  - "5-minute server-side cache via Next.js revalidate: 300"
  - "plan_to_watch default status for both anime and manga (schema enum has no plan_to_read)"

patterns-established:
  - "Port/Adapter pattern: domain defines MediaSearchPort interface, infrastructure implements with AniListAdapter"
  - "Domain entity mapping: raw API responses mapped through pure functions (mapAniListMedia)"
  - "Singleton rate limiter: in-memory token bucket scoped to server process lifetime"

requirements-completed: [SRCH-01, SRCH-02]

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 3 Plan 1: AniList Adapter Summary

**AniList GraphQL adapter with hexagonal port/adapter pattern, token bucket rate limiter (25 req/min), and add-to-list use case with duplicate prevention**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T22:06:15Z
- **Completed:** 2026-03-08T22:09:37Z
- **Tasks:** 2
- **Files modified:** 12 (including 3 .gitkeep removals)

## Accomplishments
- MediaSearchResult domain entity with null-safe title resolution (english ?? romaji) and full AniList field mapping
- AniListAdapter implementing MediaSearchPort: GraphQL POST to AniList API, POPULARITY_DESC sorting, isAdult filtering, comprehensive error handling (429, GraphQL errors, network failures)
- TokenBucket rate limiter singleton enforcing 25 req/min ceiling (safety margin under AniList's degraded 30 req/min limit)
- searchMedia and addTrackingEntry use cases with input validation and duplicate prevention
- 24 tests covering all adapter behavior, response mapping, rate limiting, and add-to-list logic (full suite: 121/121 green)

## Task Commits

Each task was committed atomically (TDD: test then implementation):

1. **Task 1: Domain contracts, AniList adapter, and rate limiter with tests**
   - `092e570` (test) - Failing tests for rate limiter, response mapping, adapter
   - `204bf8e` (feat) - Implementation passing all 20 tests
2. **Task 2: Search and add-to-list use cases with tests**
   - `4822e16` (test) - Failing test for add-tracking-entry use case
   - `8f2c6da` (feat) - Implementation passing all 24 search tests

## Files Created/Modified
- `src/modules/tracking/domain/entities/media-search-result.ts` - MediaSearchResult interface, AniListMediaResponse type, mapAniListMedia mapping function
- `src/modules/tracking/domain/ports/media-search-port.ts` - MediaSearchPort interface defining search contract
- `src/modules/tracking/infrastructure/adapters/anilist-adapter.ts` - AniListAdapter class: GraphQL fetch, rate limit check, error handling, response mapping
- `src/lib/anilist/rate-limiter.ts` - TokenBucket class and anilistRateLimiter singleton (25 req/min)
- `src/modules/tracking/application/use-cases/search-media.ts` - searchMedia use case with empty input validation
- `src/modules/tracking/application/use-cases/add-tracking-entry.ts` - addTrackingEntry use case with duplicate check via DB select
- `next.config.ts` - Added remotePatterns for s4.anilist.co CDN images
- `tests/search/rate-limiter.test.ts` - 5 tests: capacity, drain, refill, ceiling, partial refill
- `tests/search/search-result-mapping.test.ts` - 5 tests: field mapping, null title fallback, null coverImage, null episodes/chapters, manga type
- `tests/search/anilist-adapter.test.ts` - 10 tests: anime/manga search, rate limit, 429, GraphQL errors, network failure, empty results, query shape, default perPage, non-200 status
- `tests/search/add-tracking-entry.test.ts` - 4 tests: success insert, duplicate, field mapping, plan_to_watch for manga

## Decisions Made
- Native fetch for AniList GraphQL -- no Apollo/urql overhead needed for a single POST query type
- Token bucket rate limiter at 25 req/min capacity with 25/60 refill rate, providing safety margin under AniList's degraded 30 req/min limit
- 5-minute server-side cache via Next.js `revalidate: 300` on fetch calls
- Default status `plan_to_watch` for both anime and manga (the tracking_status enum has no `plan_to_read` variant)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. AniList API requires no authentication for search queries.

## Next Phase Readiness
- AniList adapter layer complete with full test coverage, ready for search UI (Plan 02)
- MediaSearchPort interface enables future adapter swapping if AniList is replaced
- addTrackingEntry use case ready for server action integration in search UI
- next.config.ts configured for AniList CDN image optimization

## Self-Check: PASSED

All 11 files verified present. All 4 commit hashes verified in git log.

---
*Phase: 03-search-and-api-integration*
*Completed: 2026-03-08*
