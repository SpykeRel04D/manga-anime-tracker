# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-10
**Phases:** 5 | **Plans:** 12 | **Tasks:** 27

### What Was Built
- Next.js 16 + Hexagonal DDD foundation with Docker DX, Drizzle ORM, and warm dark theme
- Single-user auth with Better Auth, database sessions, proxy route protection, registration lock
- AniList GraphQL adapter with token bucket rate limiting, debounced search, add-to-list
- Full tracking management: status, progress (with auto-complete), rating (10-star), notes, remove
- Cover image grid with filter/sort toolbar, infinite scroll, and rich metadata detail pages

### What Worked
- Hexagonal DDD pattern scaled cleanly across all 5 phases — ports/adapters/use-cases remained consistent
- TDD approach for use cases (write tests first, then implement) caught edge cases early (progress clamping, rating validation, duplicate prevention)
- Server actions as auth boundary pattern — clean separation between client UI and server-side use cases
- AniList API integration was straightforward with native fetch + GraphQL POST (no heavy client library needed)
- Phase dependency ordering (infra → auth → search → tracking → list) meant zero backtracking between phases
- Auto-save with independent useTransition per field gave smooth UX without blocking

### What Was Inefficient
- DSGN-03/DSGN-04 (i18n) were initially scoped into Phase 1 but immediately deferred — could have been excluded from v1 requirements upfront
- PlaceholderGrid from Phase 1 became dead code after Phase 5 replaced it with TrackingGrid — minor waste
- SUMMARY.md files lacked `one_liner` frontmatter field — made accomplishment extraction manual

### Patterns Established
- `proxy.ts` + server-side `getSession` for defense-in-depth auth
- Server action boundary pattern: every mutation goes through `'use server'` action with auth check → use case delegation
- Silent failure for background API calls (rate limit or error returns null, UI degrades gracefully)
- Token bucket rate limiter singleton pattern for external API protection
- oklch color format for all theme CSS variables
- `key` prop on stateful grids to force remount on filter change (resets scroll state)
- base-ui render prop pattern (`Button render={<Link>}`) instead of `asChild`

### Key Lessons
1. Deferring i18n was the right call — shipped a working MVP in 3 days instead of getting bogged down in translation infrastructure
2. The hexagonal port/adapter pattern pays off when the same adapter (AniList) needs to grow incrementally across phases (searchMedia → getMediaById → getMediaDetails)
3. Auto-save UX with independent transitions per field is much better than a single save button — each field saves independently without blocking others

### Cost Observations
- Model mix: primarily sonnet for agents, opus for orchestration
- Sessions: ~6 sessions across 3 days
- Notable: Entire MVP built in 3 calendar days with 89 commits and 172 tests

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~6 | 5 | Initial process — established GSD workflow |

### Cumulative Quality

| Milestone | Tests | LOC | Commits |
|-----------|-------|-----|---------|
| v1.0 | 172 | 6,647 | 89 |

### Top Lessons (Verified Across Milestones)

1. Phase dependency ordering prevents backtracking — build infrastructure before features
2. Hexagonal ports/adapters grow incrementally without refactoring — one adapter method per phase
