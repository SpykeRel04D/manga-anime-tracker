---
phase: 05-list-ui-and-browsing
plan: "01"
subsystem: tracking-data-layer
tags: [use-cases, domain-entities, anilist-adapter, tdd, drizzle-orm]
dependency_graph:
  requires:
    - src/modules/tracking/domain/entities/tracking-entry.ts
    - src/db/schema/tracking.ts
    - src/modules/tracking/infrastructure/adapters/anilist-adapter.ts
    - src/lib/anilist/rate-limiter.ts
  provides:
    - src/modules/tracking/domain/entities/media-details.ts
    - src/modules/tracking/domain/ports/media-search-port.ts (extended)
    - src/modules/tracking/application/use-cases/get-tracking-list.ts
    - src/modules/tracking/application/use-cases/get-status-counts.ts
    - src/modules/tracking/application/use-cases/get-media-details.ts
    - src/modules/tracking/infrastructure/adapters/anilist-adapter.ts (extended)
  affects:
    - Plan 02 (grid UI uses getTrackingList and getStatusCounts)
    - Plan 03 (detail page uses getMediaDetails and MediaDetails entity)
tech_stack:
  added: []
  patterns:
    - drizzle-orm Drizzle select with Promise.all parallel queries
    - drizzle-orm sql template literal for NULLS LAST ordering
    - AniList adapter silent-failure pattern extended to getMediaDetails
    - HTML tag stripping with regex chain for AniList description field
    - Relation type filtering using USEFUL_RELATION_TYPES constant
key_files:
  created:
    - src/modules/tracking/domain/entities/media-details.ts
    - src/modules/tracking/application/use-cases/get-tracking-list.ts
    - src/modules/tracking/application/use-cases/get-status-counts.ts
    - src/modules/tracking/application/use-cases/get-media-details.ts
    - tests/list/get-tracking-list.test.ts
    - tests/list/get-status-counts.test.ts
    - tests/list/get-media-details.test.ts
  modified:
    - src/modules/tracking/domain/ports/media-search-port.ts
    - src/modules/tracking/infrastructure/adapters/anilist-adapter.ts
decisions:
  - "sql template literal for NULLS LAST: drizzle-orm asc().nullsLast() only valid on ExtraConfigColumn (indexes), not in query orderBy context"
  - "USEFUL_RELATION_TYPES constant exported from media-details entity for reuse in both adapter and future components"
  - "Promise.all for parallel count + entries queries in getTrackingList for minimal latency"
metrics:
  duration: 5min
  completed_date: "2026-03-10"
  tasks: 2
  files: 9
---

# Phase 5 Plan 01: Data Layer Use Cases Summary

**One-liner:** Three data layer use cases (getTrackingList, getStatusCounts, getMediaDetails) plus MediaDetails entity and AniList adapter extension built with TDD - 172 tests all passing.

## What Was Built

### Domain Entities
- `MediaDetails`: Extended AniList metadata interface (description, genres, meanScore, season, seasonYear, studios, staff, relations)
- `RelatedMedia`: Related media item interface (id, title, titleRomaji, type, coverImageUrl, relationType)
- `USEFUL_RELATION_TYPES`: Exported constant filtering to SEQUEL, PREQUEL, SIDE_STORY, SPIN_OFF, PARENT, ADAPTATION, SOURCE

### Port Extension
- `MediaSearchPort` extended with `getMediaDetails(anilistId: number): Promise<MediaDetails | null>`

### Use Cases
- `getTrackingList`: Paginated, filtered, sorted list query with hasMore detection and parallel count query
- `getStatusCounts`: Per-status count aggregation using Drizzle groupBy
- `getMediaDetails`: Thin delegation use case to anilistAdapter (hexagonal pattern)

### Adapter Extension
- `MEDIA_DETAILS_QUERY`: GraphQL query for extended metadata
- `AniListAdapter.getMediaDetails()`: Full implementation with HTML stripping, relation filtering, silent null returns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript compile error with nullsLast ordering**
- **Found during:** TypeScript build verification after Task 1
- **Issue:** `asc(trackingEntries.titleEnglish).nullsLast()` fails TypeScript: `nullsLast()` is only on `ExtraConfigColumn` (index definitions), not on the `SQL<unknown>` return type of `asc()`
- **Fix:** Replaced with `sql\`${trackingEntries.titleEnglish} ASC NULLS LAST\`` using Drizzle's sql template literal
- **Files modified:** `src/modules/tracking/application/use-cases/get-tracking-list.ts`, `tests/list/get-tracking-list.test.ts`
- **Commit:** 0252d5e

## Decisions Made

1. **sql template for NULLS LAST**: `asc().nullsLast()` is invalid in query context. Used `sql\`... ASC NULLS LAST\`` instead. This is the correct Drizzle pattern for custom ordering expressions.

2. **USEFUL_RELATION_TYPES exported as const**: Made the constant exportable from the media-details entity so both the adapter (filtering) and future UI components (labeling) can import from single source.

3. **Promise.all for parallel queries**: Count query and entries query run in parallel in `getTrackingList` to minimize total latency.

## Test Coverage

- `tests/list/get-tracking-list.test.ts`: 10 test cases covering filter by status, filter by mediaType, combined filters, all sort modes, hasMore detection, pagination offset calculation
- `tests/list/get-status-counts.test.ts`: 3 test cases covering grouped counts, empty state, userId isolation
- `tests/list/get-media-details.test.ts`: 10 test cases covering success mapping, studios, staff, relation filtering, HTML stripping, rate limit, 500 error, network error, cache header

**Total:** 172 tests passing (was 148 before this plan)

## Self-Check: PASSED

Files verified:
- FOUND: src/modules/tracking/domain/entities/media-details.ts
- FOUND: src/modules/tracking/domain/ports/media-search-port.ts
- FOUND: src/modules/tracking/application/use-cases/get-tracking-list.ts
- FOUND: src/modules/tracking/application/use-cases/get-status-counts.ts
- FOUND: src/modules/tracking/application/use-cases/get-media-details.ts
- FOUND: tests/list/get-tracking-list.test.ts
- FOUND: tests/list/get-status-counts.test.ts
- FOUND: tests/list/get-media-details.test.ts

Commits verified:
- 542620b: test(05-01): add failing tests for getTrackingList and getStatusCounts
- 3a3b135: feat(05-01): add MediaDetails entity, extended port, getTrackingList and getStatusCounts use cases
- e72e0a4: test(05-01): add failing tests for getMediaDetails adapter and use case
- 0ca63e0: feat(05-01): extend AniList adapter with getMediaDetails and add thin use case
- 0252d5e: fix(05-01): replace nullsLast() chain with sql template for title sort
