---
phase: 04-core-tracking
plan: 02
subsystem: ui
tags: [nextjs, react, shadcn, auto-save, star-rating, progress-stepper, server-actions, sonner-toast]

# Dependency graph
requires:
  - phase: 04-core-tracking plan 01
    provides: 7 tracking use cases (get, update-status/progress/rating/notes, remove, refresh-metadata), TrackingEntry domain entity
  - phase: 03-search-api
    provides: Search page, search-result-card, addToTrackingList action, getUserTrackedIds
provides:
  - Tracking edit page at /tracking/[id] with auto-save for all fields
  - Star rating component (10 amber stars, hover preview, toggle)
  - Progress stepper component (+/- buttons, direct input, clamping)
  - Server actions wiring auth + use cases for all tracking mutations
  - Enhanced search result cards with badge navigation to edit page
  - Toast-based "Manage" link after adding to tracking list
  - Background metadata refresh with manual force button
affects: [05-list-ui]

# Tech tracking
tech-stack:
  added: [shadcn-select, shadcn-alert-dialog, shadcn-textarea]
  patterns: [auto-save-with-useTransition, optimistic-local-state-with-rollback, server-action-per-mutation]

key-files:
  created:
    - src/app/(app)/tracking/[id]/page.tsx
    - src/app/(app)/tracking/[id]/actions.ts
    - src/app/(app)/tracking/[id]/tracking-edit-form.tsx
    - src/app/(app)/tracking/[id]/star-rating.tsx
    - src/app/(app)/tracking/[id]/progress-stepper.tsx
    - src/components/ui/select.tsx
    - src/components/ui/alert-dialog.tsx
    - src/components/ui/textarea.tsx
  modified:
    - src/app/(app)/search/search-result-card.tsx
    - src/app/(app)/search/search-results.tsx
    - src/app/(app)/search/actions.ts
    - src/app/(app)/search/page.tsx
    - src/components/ui/button.tsx
    - src/modules/tracking/application/use-cases/add-tracking-entry.ts
    - src/modules/tracking/application/use-cases/remove-entry.ts
    - src/modules/tracking/application/use-cases/update-notes.ts
    - src/modules/tracking/application/use-cases/update-rating.ts
    - src/modules/tracking/application/use-cases/update-status.ts
    - src/modules/tracking/application/use-cases/update-progress.ts
    - src/modules/tracking/application/use-cases/refresh-metadata.ts
    - tests/search/add-tracking-entry.test.ts
    - tests/tracking/refresh-metadata.test.ts
    - tests/tracking/remove-entry.test.ts
    - tests/tracking/update-notes.test.ts
    - tests/tracking/update-progress.test.ts
    - tests/tracking/update-rating.test.ts
    - tests/tracking/update-status.test.ts

key-decisions:
  - "Auto-save with useTransition: each field uses its own transition for independent non-blocking saves"
  - "Optimistic local state with rollback on server action failure for instant UI feedback"
  - "getUserTrackedIds returns {anilistId, entryId} pairs to enable badge-to-edit-page navigation"
  - "addToTrackingList returns entryId on success for toast Manage link routing"

patterns-established:
  - "Auto-save pattern: local state change -> useTransition server action -> toast confirmation -> rollback on error"
  - "Server action auth boundary: every action checks auth.api.getSession before delegating to use case"
  - "Component composition: page.tsx (server) -> form.tsx (client) -> star-rating.tsx + progress-stepper.tsx (client)"

requirements-completed: [TRCK-01, TRCK-02, TRCK-03, TRCK-04, TRCK-05, TRCK-06]

# Metrics
duration: 5min
completed: 2026-03-09
---

# Phase 4 Plan 02: Tracking Edit Page UI Summary

**Auto-save edit page at /tracking/[id] with status dropdown, progress stepper, 10-star amber rating, notes textarea, remove confirmation dialog, metadata refresh, and search card integration**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T14:12:00Z
- **Completed:** 2026-03-09T14:17:40Z
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 27

## Accomplishments
- Built complete tracking edit page with auto-save behavior for all 5 fields (status, progress, rating, notes, remove)
- Created 10-star amber rating widget with hover preview and click-to-toggle behavior
- Created progress stepper with +/- buttons and clickable number for direct input, clamped to total episodes/chapters
- Integrated search result cards with badge navigation to edit page and toast "Manage" link after adding entries
- Installed shadcn select, alert-dialog, and textarea components
- Background metadata refresh on page load with manual force-refresh button
- User-verified complete tracking management flow (approved)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn components, create server actions, build edit page with all interactive components** - `8321134` (feat)
2. **Task 2: Verify complete tracking management flow** - User-approved checkpoint (no code commit)

**Plan metadata:** (pending)

## Files Created/Modified
- `src/app/(app)/tracking/[id]/page.tsx` - Server component: auth check, fetch entry, render form
- `src/app/(app)/tracking/[id]/actions.ts` - Server actions for all 6 tracking mutations with auth boundary
- `src/app/(app)/tracking/[id]/tracking-edit-form.tsx` - Client form with auto-save via useTransition for each field
- `src/app/(app)/tracking/[id]/star-rating.tsx` - 10-star amber rating with hover preview and toggle
- `src/app/(app)/tracking/[id]/progress-stepper.tsx` - +/- stepper with direct input and clamping
- `src/components/ui/select.tsx` - shadcn Select component
- `src/components/ui/alert-dialog.tsx` - shadcn AlertDialog for remove confirmation
- `src/components/ui/textarea.tsx` - shadcn Textarea for notes
- `src/app/(app)/search/search-result-card.tsx` - Enhanced with badge link to edit page
- `src/app/(app)/search/search-results.tsx` - Updated to pass trackedEntryId prop
- `src/app/(app)/search/actions.ts` - getUserTrackedIds returns entryId, addToTrackingList returns entryId
- `src/app/(app)/search/page.tsx` - Updated for new tracked data shape
- `src/components/ui/button.tsx` - Updated by shadcn install
- `src/modules/tracking/application/use-cases/add-tracking-entry.ts` - Returns new entry ID
- `src/modules/tracking/application/use-cases/remove-entry.ts` - Updated for consistency
- `src/modules/tracking/application/use-cases/update-*.ts` - Various use case refinements
- `tests/tracking/*.test.ts` - Test updates for use case changes
- `tests/search/add-tracking-entry.test.ts` - Updated for entryId return

## Decisions Made
- Auto-save pattern uses independent useTransition per field so saving one field does not block interaction with others
- Optimistic local state with rollback: UI updates instantly on change, rolls back if server action fails
- getUserTrackedIds changed from returning `number[]` to `Array<{anilistId, entryId}>` to enable search card badge links
- addToTrackingList now returns the new entry ID on success so toast can include "Manage" navigation link

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Core Tracking) is fully complete: backend use cases + frontend edit page
- All tracking CRUD operations verified end-to-end through human testing
- Ready for Phase 5 (List UI and Browsing) which will display the tracking collection as a visual grid

## Self-Check: PASSED

- All 8 key created files verified present
- Task 1 commit 8321134 verified
- Task 2 verified by user approval (checkpoint)
- SUMMARY.md created and verified

---
*Phase: 04-core-tracking*
*Completed: 2026-03-09*
