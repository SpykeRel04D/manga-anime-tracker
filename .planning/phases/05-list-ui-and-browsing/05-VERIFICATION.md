---
phase: 05-list-ui-and-browsing
verified: 2026-03-10T23:40:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "Visual grid and filter bar on home page"
    expected: "Cover image grid shows 2/3/4/5/6 columns at responsive breakpoints; each card has cover art (or gradient fallback), colored status badge top-left, thin progress bar at bottom edge for watching/completed/on_hold, title below"
    why_human: "Responsive layout, colour rendering, and badge/progress bar pixel accuracy cannot be verified by code inspection"
  - test: "Filter tab bar with entry counts"
    expected: "Status tabs (All, Watching, Completed, On Hold, Dropped, Plan to Watch) each show count in parentheses; active tab shows amber background; clicking a tab filters the grid and updates ?status= in URL"
    why_human: "Browser interaction, URL update timing, and visual active state require running application"
  - test: "Type toggle and sort dropdown update URL and list"
    expected: "All/Anime/Manga toggle updates ?type= param; Date Added/Rating/Title sort dropdown updates ?sort= param; refreshing page preserves filters"
    why_human: "URL persistence across page refreshes requires browser testing"
  - test: "Infinite scroll loads next pages"
    expected: "Scrolling to bottom of a collection with 20+ entries triggers IntersectionObserver, loads next 20 entries, appends them to grid without visible scroll jump; 4 skeleton cards show during load"
    why_human: "IntersectionObserver behaviour and append-without-jump require browser testing with real data"
  - test: "Empty states render correctly"
    expected: "Empty collection shows Inbox icon + 'Your collection is empty' + 'Browse & Search' CTA button linking to /search; empty filter result shows contextual message (no CTA)"
    why_human: "Requires collection with zero entries or applied filter yielding zero results"
  - test: "Detail page metadata section"
    expected: "Navigating to /tracking/[id] shows synopsis collapsed to 4 lines with 'Show more'/'Show less' toggle; metadata pills (season/year, AniList score %, episode/chapter count); genre tags as outline pills; Studios label for anime or Authors for manga; horizontal scrollable related series thumbnails"
    why_human: "Visual layout, AniList live data, and expand/collapse toggle require browser testing"
  - test: "Related series navigation"
    expected: "Clicking a related series already in user's collection navigates to its /tracking/[entryId] page; clicking an untracked related series opens https://anilist.co/... in a new tab"
    why_human: "Link resolution logic depends on real tracked collection state and browser navigation"
  - test: "Graceful degradation when AniList metadata unavailable"
    expected: "Detail page renders correctly with just the TrackingEditForm when getMediaDetails returns null (rate limit or error); no error thrown"
    why_human: "Requires simulating AniList rate limit or failure during page load"
---

# Phase 5: List UI and Browsing Verification Report

**Phase Goal:** Build the list UI and browsing experience — the primary daily interface for viewing, filtering, sorting, and browsing the user's tracked collection, plus rich media detail pages.
**Verified:** 2026-03-10T23:40:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | `getTrackingList` returns paginated entries filtered by status, type, and sorted by rating/title/date_added | VERIFIED | Full implementation in `get-tracking-list.ts` with Drizzle select, `and()` where clauses, `sql` NULLS LAST ordering, `limit(perPage+1)` hasMore detection, parallel count query. 10 unit tests passing. |
| 2  | `getStatusCounts` returns a per-status count map for the user's collection | VERIFIED | Implementation in `get-status-counts.ts` using Drizzle `count()` + `groupBy`. 3 unit tests passing. |
| 3  | `getMediaDetails` returns extended metadata from AniList (synopsis, genres, studios, staff, relations) | VERIFIED | `MEDIA_DETAILS_QUERY` in adapter; full `getMediaDetails()` method with HTML stripping, relation filtering, silent null failures. 10 unit tests passing. |
| 4  | `getMediaDetails` returns null silently on rate limit or error | VERIFIED | Three code paths: rate limiter `tryConsume()` check, `!response.ok` guard, and catch block — all return null. Tested by 3 dedicated test cases. |
| 5  | User sees tracked series as a visual grid of cover images with status badges and progress indicators | VERIFIED (automated checks) | `TrackingCard` renders `<Image fill>` or gradient fallback, absolute status badge at `top-0 left-0`, conditional progress bar `absolute bottom-0`. Needs visual human verification. |
| 6  | Grid is responsive: 2/3/4/5/6 columns at breakpoints | VERIFIED (code) | `grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6` in `tracking-grid.tsx`. Needs browser verification. |
| 7  | User can filter by status tabs with counts and type toggle; filter state persists in URL | VERIFIED (code) | `filter-bar.tsx` reads `useSearchParams()`, writes via `router.replace(..., { scroll: false })`. Status tabs compute counts from `statusCounts` prop. Needs browser verification. |
| 8  | User can sort by Rating, Title, or Date Added via dropdown | VERIFIED (code) | Sort dropdown with three `SelectItem` values maps to `updateParam('sort', value)` call. Needs browser verification. |
| 9  | Grid uses infinite scroll loading 20 entries per batch | VERIFIED (code) | `IntersectionObserver` with `threshold: 0.1` sentinel; `startTransition(async () => fetchTrackingPage(...page+1))` appends entries; `SkeletonCard` loading state. Needs browser verification. |
| 10 | Empty collection shows CTA to /search; empty filter shows reset message | VERIFIED (code) | `page.tsx` branch logic: `totalEntries === 0 && !hasActiveFilters` → EmptyState with `actionHref="/search"`; `entries.length === 0 && hasActiveFilters` → EmptyState without CTA. Needs browser verification. |
| 11 | User can view detail page with synopsis, genres, studios/authors, score, season, related series | VERIFIED (code) | `MediaDetailSection` renders all six sections conditionally; synopsis uses `line-clamp-4` + `useState` expand toggle; genres as `Badge variant="outline"`; studios/authors conditional on `entry.mediaType`; related series horizontal scroll. Needs browser verification. |
| 12 | Related series link to tracked entry pages or AniList external | VERIFIED | Code at lines 127-132 of `media-detail-section.tsx`: `trackedAnilistIds.has(relation.id)` → `/tracking/${entryId}`; else → `https://anilist.co/${type}/${id}` with `target="_blank"`. |
| 13 | Existing tracking edit controls remain unchanged below metadata | VERIFIED | `page.tsx` renders `<MediaDetailSection>` conditionally above `<TrackingEditForm entry={entry} />`. `TrackingEditForm` is imported but not modified (only `page.tsx` and `media-detail-section.tsx` are new/changed in Plan 03). |

**Score:** 13/13 truths verified (8 require human verification for visual/interactive aspects)

---

### Required Artifacts

#### Plan 01 Artifacts

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/modules/tracking/domain/entities/media-details.ts` | VERIFIED | 30 lines. Exports `MediaDetails`, `RelatedMedia`, `USEFUL_RELATION_TYPES`. All required fields present. |
| `src/modules/tracking/domain/ports/media-search-port.ts` | VERIFIED | Extended with `getMediaDetails(anilistId: number): Promise<MediaDetails \| null>`. |
| `src/modules/tracking/application/use-cases/get-tracking-list.ts` | VERIFIED | 70 lines. Exports `getTrackingList`, `GetTrackingListInput`, `GetTrackingListResult`. Full implementation with Drizzle queries. |
| `src/modules/tracking/application/use-cases/get-status-counts.ts` | VERIFIED | 20 lines. Exports `getStatusCounts`, `StatusCounts`. Full groupBy implementation. |
| `src/modules/tracking/application/use-cases/get-media-details.ts` | VERIFIED | 6 lines. Exports `getMediaDetails`. Thin delegation to `anilistAdapter`. |
| `src/modules/tracking/infrastructure/adapters/anilist-adapter.ts` | VERIFIED | 261 lines. `MEDIA_DETAILS_QUERY` constant present. `getMediaDetails()` method fully implemented. |
| `tests/list/get-tracking-list.test.ts` | VERIFIED | 10 test cases, all passing. |
| `tests/list/get-status-counts.test.ts` | VERIFIED | 3 test cases, all passing. |
| `tests/list/get-media-details.test.ts` | VERIFIED | 10 test cases (adapter) + 1 (use case), all passing. |

#### Plan 02 Artifacts

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/app/(app)/page.tsx` | VERIFIED | 98 lines (exceeds 20-line minimum). Server component with parallel `Promise.all`, URL param validation, `FilterBar` + conditional `TrackingGrid` or `EmptyState`. |
| `src/app/(app)/tracking-grid.tsx` | VERIFIED | 76 lines (exceeds 60-line minimum). `IntersectionObserver`, `useTransition`, `fetchTrackingPage` call, sentinel div, skeleton loading. |
| `src/app/(app)/tracking-card.tsx` | VERIFIED | 94 lines (exceeds 40-line minimum). Cover image, status badge, progress bar, title, `Link href=/tracking/${entry.id}`. |
| `src/app/(app)/filter-bar.tsx` | VERIFIED | 134 lines (exceeds 60-line minimum). Status tabs with counts, type toggle, sort dropdown, URL sync via `router.replace`. |
| `src/app/(app)/actions.ts` | VERIFIED | Exports `fetchTrackingPage`. `'use server'` directive. Auth check. Input validation. Delegates to `getTrackingList`. |
| `src/components/shared/empty-state.tsx` | VERIFIED | Exports `EmptyState`. Icon, title, description, optional CTA button as `Button render={<Link>}`. |

#### Plan 03 Artifacts

| Artifact | Status | Evidence |
|----------|--------|---------|
| `src/app/(app)/tracking/[id]/page.tsx` | VERIFIED | 58 lines (exceeds 30-line minimum). Imports `getMediaDetails`, `MediaDetailSection`, `getUserTrackedEntries`. Conditional metadata fetch + render above `TrackingEditForm`. |
| `src/app/(app)/tracking/[id]/media-detail-section.tsx` | VERIFIED | 170 lines (exceeds 80-line minimum). Synopsis, metadata pills, genres, studios/authors, related series — all fully implemented with conditional rendering. |

---

### Key Link Verification

#### Plan 01 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `get-tracking-list.ts` | `src/db/schema/tracking.ts` | Drizzle `db.select().from(trackingEntries)` | WIRED | Lines 51-63: `db.select().from(trackingEntries).where(...).orderBy(...).limit(...).offset(...)` |
| `get-media-details.ts` | `anilist-adapter.ts` | `anilistAdapter.getMediaDetails(anilistId)` | WIRED | Line 5: `return anilistAdapter.getMediaDetails(anilistId)` |
| `anilist-adapter.ts` | `rate-limiter.ts` | `anilistRateLimiter.tryConsume()` before fetch | WIRED | Line 189: `if (!anilistRateLimiter.tryConsume()) { return null }` |

#### Plan 02 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `page.tsx` | `get-tracking-list.ts` | Server-side initial data fetch | WIRED | Lines 53-61: `getTrackingList({ userId, status: validStatus, ... })` inside `Promise.all` |
| `page.tsx` | `get-status-counts.ts` | Server-side count fetch for filter tabs | WIRED | Line 61: `getStatusCounts(userId)` inside `Promise.all` |
| `filter-bar.tsx` | URL search params | `router.replace` with `{ scroll: false }` | WIRED | Line 56: `router.replace(\`${pathname}?${params.toString()}\`, { scroll: false })` |
| `tracking-grid.tsx` | `actions.ts` | Server action on IntersectionObserver trigger | WIRED | Line 45: `const result = await fetchTrackingPage({ ... page: page + 1 })` inside `startTransition` |
| `tracking-card.tsx` | `/tracking/[id]` | Link component wrapping card | WIRED | Line 47: `href={\`/tracking/${entry.id}\`}` |

#### Plan 03 Key Links

| From | To | Via | Status | Evidence |
|------|----|-----|--------|---------|
| `tracking/[id]/page.tsx` | `get-media-details.ts` | Server-side fetch of extended metadata | WIRED | Line 32: `const details = await getMediaDetails(entry.anilistId)` |
| `media-detail-section.tsx` | `/tracking/[entryId]` or `anilist.co` | Related series thumbnails link | WIRED | Lines 128-129: conditional href to `/tracking/${entryId}` or `https://anilist.co/${type}/${id}` |
| `tracking/[id]/page.tsx` | `tracking-edit-form.tsx` | Existing edit form rendered below metadata | WIRED | Lines 11, 55: import + `<TrackingEditForm entry={entry} />` |

---

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| LIST-01 | 05-01, 05-02 | User can view tracked series as a visual grid of cover images with status badges and progress indicators | SATISFIED | `TrackingCard` with cover image, status badge overlay, progress bar. Home page renders `TrackingGrid` with initial server-fetched entries. |
| LIST-02 | 05-01, 05-02 | User can filter list by status and type | SATISFIED | `FilterBar` renders 6 status tabs and 3 type toggle buttons. `page.tsx` passes validated `status`/`mediaType` params to `getTrackingList`. URL params persist. |
| LIST-03 | 05-01, 05-02 | User can sort list by rating, title, or date added | SATISFIED | Sort dropdown in `FilterBar` with three options. `getTrackingList` implements `desc(rating)`, `sql ASC NULLS LAST`, and `desc(createdAt)` sort modes. |
| LIST-04 | 05-01, 05-03 | User can view detail page with full metadata (synopsis, genres, studios/authors, airing status, related series) | SATISFIED | `MediaDetailSection` renders all six metadata sections. `page.tsx` fetches via `getMediaDetails`. Lazy `getUserTrackedEntries` for related series resolution. |

No orphaned requirements found. All four LIST requirements are claimed and implemented across plans 01–03.

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `src/app/(app)/tracking/[id]/media-detail-section.tsx:57` | `dangerouslySetInnerHTML={{ __html: details.description }}` | Info | Description is already plain-text at this point — the adapter uses `asHtml: false` on the GraphQL query and runs HTML-stripping regex before populating `MediaDetails.description`. Using `dangerouslySetInnerHTML` on sanitized content is unnecessary but not a security issue. |

No TODO/FIXME/placeholder comments. No stub return patterns in production code.

---

### Human Verification Required

The automated code analysis has verified all implementations are complete, substantive, and correctly wired. The following items require a running browser session to fully confirm:

#### 1. Responsive cover grid rendering

**Test:** Open http://localhost:3000 after logging in; resize window from mobile to 4K.
**Expected:** 2 columns at <768px, 3 at md, 4 at lg, 5 at xl, 6 at 2xl. Each card: cover image (or warm gradient fallback), status badge (colored, top-left corner), thin amber progress bar at bottom edge of cover image, title in fixed-height area below.
**Why human:** Grid layout, colour accuracy, and badge/progress bar positioning require visual inspection.

#### 2. Filter tabs and type toggle interactivity

**Test:** Click each status tab (All through Plan to Watch) and each type toggle (All/Anime/Manga). Check URL bar after each click.
**Expected:** URL updates to `?status=watching` etc. List re-filters. Refresh preserves state. "All" tabs remove the param. Each tab shows its entry count.
**Why human:** URL update timing and deep-link persistence require browser testing.

#### 3. Sort dropdown functionality

**Test:** Change the sort dropdown between Date Added, Rating, and Title. Observe list order.
**Expected:** URL updates to `?sort=rating` etc. List re-sorts accordingly (Rating: highest first, Title: A-Z, Date Added: newest first).
**Why human:** Sort order accuracy requires real data in the database.

#### 4. Infinite scroll

**Test:** With 20+ tracked entries, scroll to the bottom of the collection.
**Expected:** 4 skeleton cards appear, next 20 entries load and append without scroll jump. `hasMore` becomes false when last batch loads.
**Why human:** IntersectionObserver firing behaviour and no-jump append require browser testing.

#### 5. Empty states

**Test:** (a) Visit with empty collection; (b) apply a filter yielding no results.
**Expected:** (a) "Your collection is empty" with Inbox icon and "Browse & Search" link. (b) "No results" contextual message without CTA.
**Why human:** Requires specific collection states.

#### 6. Detail page metadata section

**Test:** Click a tracked entry card to reach `/tracking/[id]`. Check all metadata sections are present.
**Expected:** Synopsis collapsed to ~4 lines; "Show more" expands it; "Show less" collapses it. Season/year badge, AniList score % badge, episode/chapter count badge. Genre outline pills. Studios (anime) or Authors (manga) text. Horizontal scrollable related series thumbnails with relation type labels.
**Why human:** AniList data availability, HTML rendering of synopsis, and expand/collapse interaction require browser testing.

#### 7. Related series navigation

**Test:** Click a related series thumbnail — one that is tracked and one that is not.
**Expected:** Tracked entry opens `/tracking/[entryId]` in same tab. Untracked entry opens `https://anilist.co/...` in a new tab.
**Why human:** Link resolution depends on real database state and browser navigation.

#### 8. Graceful metadata degradation

**Test:** This is hard to trigger without simulating rate limits. Observe the page renders correctly even if AniList is unavailable.
**Expected:** Page shows `TrackingEditForm` without errors when `getMediaDetails` returns null.
**Why human:** Requires rate limit or network failure simulation.

---

### Note on `dangerouslySetInnerHTML`

`media-detail-section.tsx` uses `dangerouslySetInnerHTML` to render `details.description`. The adapter already sanitizes this field (AniList query uses `asHtml: false` and the adapter applies three regex replacements stripping all tags and entities). The result is plain text. Using `dangerouslySetInnerHTML` on already-safe content is unnecessary but does not create a security vulnerability. This is a low-priority cleanup item for a future phase.

---

## Summary

All 13 observable truths are verified at the code level. All 9 artifacts across three plans exist, are substantive (well above minimum line counts), and are correctly wired to their dependencies. All 4 requirement IDs (LIST-01 through LIST-04) are satisfied. The test suite reports 172 tests passing with no regressions.

The phase goal — "Build the list UI and browsing experience" — is architecturally complete. The only outstanding items are 8 human verification points covering visual appearance, interactive browser behaviour, and live AniList data rendering, which cannot be confirmed by static code analysis.

---

_Verified: 2026-03-10T23:40:00Z_
_Verifier: Claude (gsd-verifier)_
