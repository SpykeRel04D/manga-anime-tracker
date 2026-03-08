# Phase 4: Core Tracking - Research

**Researched:** 2026-03-08
**Domain:** CRUD operations on tracking entries with auto-save UI, AniList metadata refresh, Next.js server actions + Drizzle ORM
**Confidence:** HIGH

## Summary

Phase 4 builds CRUD management for tracked anime/manga entries around a dedicated edit page at `/tracking/[id]`. The existing codebase already has the `trackingEntries` table with `status`, `progress`, `rating`, and `notes` columns, plus the `addTrackingEntry` use case and server action pattern. The work is primarily: (1) new use cases for update-status, update-progress, update-rating, update-notes, remove-entry, and refresh-metadata, (2) a schema migration to add `lastSyncedAt`, (3) extending the AniList adapter with a single-media-by-ID query, (4) building the edit page UI with auto-save behavior, and (5) wiring search result cards to navigate to the edit page.

The standard stack is already established (Next.js 16, React 19, Drizzle ORM, shadcn/ui base-nova, Tailwind v4, Sonner toasts). No new dependencies are needed. The project uses `db:push` for schema changes (no formal migration files). New shadcn components needed: `select` (for status dropdown), `alert-dialog` (for remove confirmation), and `textarea` (for notes). All are available in the base-nova variant.

**Primary recommendation:** Follow the established hexagonal pattern -- one use case per mutation, one server action file at the route level, auto-save via individual `useTransition` calls per field, and optimistic UI with toast feedback.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Dedicated edit page per tracked entry at `/tracking/[id]`
- Layout: cover image + titles at top, then status dropdown, progress stepper, star rating, notes textarea, remove button
- Navigation: from search results -- already-tracked entries show status badge (Phase 3), clicking badge navigates to edit page; after adding a new entry, toast includes "Manage" link
- No temporary list page -- search is the entry point for Phase 4; Phase 5 adds the grid browse surface
- Auto-save per field -- each change persists immediately (status dropdown change, progress +/-, rating click, notes blur)
- No Save button needed
- Toast confirms each save action
- Stepper + direct input combo: +/- buttons for quick increments, clickable number becomes editable input for jumping to specific episode/chapter
- Clamped to total: cannot go above totalEpisodes/totalChapters or below 0; if total is null (ongoing, unknown count), allow any positive number
- Labels: "eps" for anime, "ch" for manga
- Auto-complete: when progress reaches totalEpisodes/totalChapters, automatically set status to "completed" (only when total is known/not null)
- 10 amber/gold star icons in a row (amber-500 filled, muted warm gray empty)
- Hover preview: hovering over star N fills stars 1-N in a lighter shade
- Click to set rating; click same star again to remove rating (toggle behavior)
- Numeric display: "7/10" shown next to stars
- Always-visible inline textarea below other fields
- Auto-resizes as content grows
- Auto-saves on blur (click away)
- Plain text only -- no markdown or rich formatting
- No character limit (DB column is text type, personal app)
- Placeholder: "Add personal notes..."
- Auto-refresh on edit page visit: background fetch from AniList updates all metadata (totalEpisodes, totalChapters, coverImageUrl, titleEnglish, titleRomaji, airing status)
- 24-hour cooldown: only auto-refresh if `lastSyncedAt` > 24 hours ago (requires new timestamp column)
- Manual refresh button always available regardless of cooldown
- Show cached data immediately, update UI silently when fresh data arrives
- Confirmation dialog: "Remove [title] from your list?" with Cancel/Remove buttons
- After removal, redirect back to search page

### Claude's Discretion
- Hexagonal architecture placement of new use cases (update-status, update-progress, update-rating, update-notes, remove-entry, refresh-metadata)
- AniList GraphQL query for single-media metadata refresh
- Edit page layout details (spacing, responsive behavior, component composition)
- Error handling for failed saves and API failures
- Status dropdown component choice (shadcn Select, custom, etc.)
- Confirmation dialog component (shadcn AlertDialog or similar)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRCK-01 | User can add an anime or manga to their personal tracking list from search results | Already implemented in Phase 3 (`addTrackingEntry` use case + `addToTrackingList` server action). Phase 4 enhances with toast "Manage" link and badge navigation to edit page. |
| TRCK-02 | User can set status for each entry (Watching, Completed, On Hold, Dropped, Plan to Watch/Read) | New `updateStatus` use case + server action. Status dropdown uses shadcn Select. Schema already has `trackingStatusEnum` with all 5 values. |
| TRCK-03 | User can update current episode (anime) or chapter (manga) with increment, decrement, and direct input | New `updateProgress` use case + server action. Stepper UI component with clamping logic. Auto-complete triggers status change to "completed". |
| TRCK-04 | User can rate a tracked entry on a 1-10 scale | New `updateRating` use case + server action. Star rating component with hover preview, toggle behavior, and numeric display. |
| TRCK-05 | User can add or edit personal notes on any tracked entry | New `updateNotes` use case + server action. Auto-resizing textarea with blur-save behavior. |
| TRCK-06 | User can remove an entry from their tracking list | New `removeEntry` use case + server action. AlertDialog confirmation, then redirect to search. |
</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router, server actions, dynamic routes | Project framework |
| React | 19.2.3 | UI rendering, `useTransition` for auto-save | Project framework |
| Drizzle ORM | 0.45.1 | Database queries (update, delete, select) | Project ORM |
| shadcn/ui | 4.0.2 (base-nova) | Select, AlertDialog, Textarea components | Project UI library |
| @base-ui/react | 1.2.0 | Underlying primitives for shadcn base-nova | Already installed |
| Sonner | 2.0.7 | Toast notifications for save confirmations | Already used for add-to-list toasts |
| lucide-react | 0.577.0 | Icons (Star, Plus, Minus, RefreshCw, Trash2) | Already used |
| Tailwind CSS | 4 | Styling with oklch warm dark theme | Project styling |

### New shadcn Components to Add
| Component | Install Command | Purpose |
|-----------|----------------|---------|
| Select | `pnpm dlx shadcn@latest add select` | Status dropdown (Watching, Completed, etc.) |
| AlertDialog | `pnpm dlx shadcn@latest add alert-dialog` | Remove entry confirmation dialog |
| Textarea | `pnpm dlx shadcn@latest add textarea` | Notes field with auto-resize |

### No New npm Dependencies
Everything needed is already installed. The shadcn CLI copies component files into `src/components/ui/` -- no new packages.

## Architecture Patterns

### Recommended Project Structure
```
src/
  modules/tracking/
    application/use-cases/
      add-tracking-entry.ts       # existing
      search-media.ts             # existing
      update-status.ts            # NEW
      update-progress.ts          # NEW
      update-rating.ts            # NEW
      update-notes.ts             # NEW
      remove-entry.ts             # NEW
      refresh-metadata.ts         # NEW
      get-tracking-entry.ts       # NEW (fetch single entry by ID+userId)
    domain/entities/
      media-search-result.ts      # existing
      tracking-entry.ts           # NEW (type for the full tracking entry)
    domain/ports/
      media-search-port.ts        # existing
    infrastructure/adapters/
      anilist-adapter.ts          # EXTEND with getMediaById method
  app/(app)/
    tracking/[id]/
      page.tsx                    # server component: fetch entry, render edit page
      actions.ts                  # server actions: updateStatus, updateProgress, etc.
      tracking-edit-form.tsx      # client component: the auto-save edit form
      star-rating.tsx             # client component: star rating widget
      progress-stepper.tsx        # client component: +/- stepper with direct input
  db/schema/
    tracking.ts                   # ADD lastSyncedAt column
```

### Pattern 1: Use Case per Mutation (following existing addTrackingEntry)
**What:** Each field mutation gets its own use case function with typed input/output.
**When to use:** Every tracking field update.
**Example:**
```typescript
// src/modules/tracking/application/use-cases/update-status.ts
import { and, eq } from 'drizzle-orm'
import { db } from '@/db/drizzle'
import { trackingEntries } from '@/db/schema'

export type UpdateStatusResult =
  | { success: true }
  | { success: false; error: 'not_found' | 'not_authenticated' }

export async function updateStatus(
  userId: string,
  entryId: string,
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch',
): Promise<UpdateStatusResult> {
  const result = await db
    .update(trackingEntries)
    .set({ status, updatedAt: new Date() })
    .where(
      and(
        eq(trackingEntries.id, entryId),
        eq(trackingEntries.userId, userId),
      ),
    )
    .returning({ id: trackingEntries.id })

  if (result.length === 0) {
    return { success: false, error: 'not_found' }
  }
  return { success: true }
}
```

### Pattern 2: Server Action Boundary (following existing search/actions.ts)
**What:** Server actions authenticate via `auth.api.getSession()` then delegate to use cases.
**When to use:** Every client-triggered mutation.
**Example:**
```typescript
// src/app/(app)/tracking/[id]/actions.ts
'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { updateStatus } from '@/modules/tracking/application/use-cases/update-status'

export async function changeStatus(
  entryId: string,
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch',
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { success: false as const, error: 'not_authenticated' as const }
  }
  return updateStatus(session.user.id, entryId, status)
}
```

### Pattern 3: Auto-Save with useTransition (following search-result-card.tsx)
**What:** Each field change triggers a `startTransition` that calls the server action and shows a toast.
**When to use:** Status dropdown onChange, progress +/- click, rating click, notes blur.
**Example:**
```typescript
// Inside tracking-edit-form.tsx (client component)
const [isPending, startTransition] = useTransition()

function handleStatusChange(newStatus: string) {
  setStatus(newStatus) // optimistic local state
  startTransition(async () => {
    const result = await changeStatus(entryId, newStatus)
    if (result.success) {
      toast.success('Status updated')
    } else {
      toast.error('Failed to update status')
      setStatus(previousStatus) // rollback
    }
  })
}
```

### Pattern 4: AniList Single-Media Query for Metadata Refresh
**What:** Extend the AniList adapter with a `getMediaById(id)` method that fetches current metadata.
**When to use:** Edit page load (if stale), manual refresh button.
**Example:**
```typescript
// Added to anilist-adapter.ts
const MEDIA_BY_ID_QUERY = `query ($id: Int!) {
  Media(id: $id) {
    id
    title { english romaji }
    type
    status
    episodes
    chapters
    coverImage { large }
  }
}`

async getMediaById(anilistId: number): Promise<MediaSearchResult | null> {
  if (!anilistRateLimiter.tryConsume()) {
    return null // Silently fail for background refresh
  }
  // ... fetch and map, return null on 404
}
```

### Pattern 5: Dynamic Route with Server Component Data Fetching
**What:** The edit page is a server component that fetches the entry, renders the client form.
**When to use:** `/tracking/[id]` route.
**Example:**
```typescript
// src/app/(app)/tracking/[id]/page.tsx
export default async function TrackingEditPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')

  const entry = await getTrackingEntry(session.user.id, id)
  if (!entry) notFound()

  return <TrackingEditForm entry={entry} />
}
```

### Anti-Patterns to Avoid
- **Single monolithic server action for all fields:** Each field should have its own action to enable individual auto-save without batching complexity.
- **Client-side data fetching for initial load:** The edit page should be a server component that fetches data before rendering -- no loading spinners for the initial view.
- **Using `router.refresh()` after every save:** For auto-save, use local state with optimistic updates -- only refresh when metadata changes (refresh button) or after remove.
- **Storing rating as float/decimal:** The schema already uses `integer('rating')` for the 1-10 scale. Keep it simple.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status dropdown | Custom dropdown with keyboard nav | shadcn Select (base-ui) | Accessibility, keyboard navigation, styling all handled |
| Confirmation dialog | Custom modal with backdrop | shadcn AlertDialog (base-ui) | Focus trapping, escape handling, screen reader support |
| Auto-resizing textarea | Manual height calculation | shadcn Textarea + CSS `field-sizing: content` or `onInput` height resize | Browser-native sizing is simpler and more reliable |
| Toast notifications | Custom notification system | Sonner (already integrated) | Already working in the project |
| Star rating hover | CSS-only hover effects with sibling selectors | React state with `onMouseEnter`/`onMouseLeave` per star | CSS sibling approach is fragile; React state is explicit and correct |
| Rate limiting for refresh | Custom timer | Existing `TokenBucket` rate limiter | Already built and tested |

**Key insight:** The project already has all the infrastructure (auth, DB, toasts, rate limiting). This phase is primarily about wiring new use cases and building the edit page UI.

## Common Pitfalls

### Pitfall 1: Race Conditions with Rapid Auto-Save
**What goes wrong:** User clicks progress +++ quickly, sending 3 server actions that resolve out of order, leaving stale state.
**Why it happens:** `useTransition` doesn't queue -- each call is independent.
**How to avoid:** Use optimistic local state that updates immediately. Each server action writes the absolute value (not a delta), so the last one to reach the server wins with the correct value. The local state is always the source of truth.
**Warning signs:** UI flickers between values, or progress jumps backward after rapid clicks.

### Pitfall 2: Forgetting userId Check in Update Queries
**What goes wrong:** An authenticated user could update someone else's entry by guessing the UUID.
**Why it happens:** Query only checks `eq(trackingEntries.id, entryId)` without also checking `userId`.
**How to avoid:** Every update/delete query MUST include `and(eq(id, entryId), eq(userId, userId))`. The existing `addTrackingEntry` already checks this pattern for duplicate detection.
**Warning signs:** Missing `userId` in `where` clause.

### Pitfall 3: Schema Push Breaking Existing Data
**What goes wrong:** Adding `lastSyncedAt` column without a default could fail on existing rows.
**Why it happens:** `db:push` applies schema changes directly, and NOT NULL columns without defaults fail on tables with existing data.
**How to avoid:** Make `lastSyncedAt` nullable (no NOT NULL constraint) -- null means "never synced, needs refresh". This matches the semantic meaning perfectly.
**Warning signs:** `db:push` errors about existing rows.

### Pitfall 4: AniList Rate Limit During Metadata Refresh
**What goes wrong:** Visiting many edit pages rapidly exhausts the 25 req/min budget, blocking search for other users (single-user app, but still blocks the current user's search).
**Why it happens:** Each edit page visit triggers an AniList API call if stale.
**How to avoid:** The 24-hour cooldown on `lastSyncedAt` prevents repeated calls. If rate limit is exhausted, silently fail the refresh (show cached data). Never throw errors for background refresh failures.
**Warning signs:** Search stops working because refresh consumed all rate limit tokens.

### Pitfall 5: Next.js 16 Dynamic Route Params are Promises
**What goes wrong:** Accessing `params.id` directly throws a type error.
**Why it happens:** In Next.js 16, `params` is `Promise<{ id: string }>` and must be awaited.
**How to avoid:** Always `const { id } = await params` in server components.
**Warning signs:** TypeScript error about `params` not having property `id`.

### Pitfall 6: Auto-Complete Status Change Without User Awareness
**What goes wrong:** User increments progress to the total, status silently changes to "completed" without feedback.
**Why it happens:** The auto-complete logic fires without notification.
**How to avoid:** When auto-complete triggers, show a specific toast: "Marked as Completed!" so the user understands what happened and can reverse it.
**Warning signs:** User confusion about why status changed.

## Code Examples

### Drizzle Update with Returning (verified from Drizzle docs)
```typescript
// Source: https://orm.drizzle.team/docs/update
const result = await db
  .update(trackingEntries)
  .set({ progress: newProgress, updatedAt: new Date() })
  .where(
    and(
      eq(trackingEntries.id, entryId),
      eq(trackingEntries.userId, userId),
    ),
  )
  .returning({ id: trackingEntries.id })
// result is an array -- empty means no row matched
```

### Drizzle Delete
```typescript
// Source: https://orm.drizzle.team/docs/delete
const result = await db
  .delete(trackingEntries)
  .where(
    and(
      eq(trackingEntries.id, entryId),
      eq(trackingEntries.userId, userId),
    ),
  )
  .returning({ id: trackingEntries.id })
```

### AniList Single Media Query
```graphql
# Source: https://docs.anilist.co/guide/graphql/queries/media
query ($id: Int!) {
  Media(id: $id) {
    id
    title { english romaji }
    type
    status
    episodes
    chapters
    coverImage { large }
  }
}
```

### shadcn Select Usage (base-nova variant)
```typescript
// Source: https://ui.shadcn.com/docs/components/base/select
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const STATUS_OPTIONS = [
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Dropped', value: 'dropped' },
  { label: 'Plan to Watch', value: 'plan_to_watch' },
]

<Select items={STATUS_OPTIONS} value={status} onValueChange={handleStatusChange}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      {STATUS_OPTIONS.map((item) => (
        <SelectItem key={item.value} value={item.value}>
          {item.label}
        </SelectItem>
      ))}
    </SelectGroup>
  </SelectContent>
</Select>
```

### shadcn AlertDialog Usage
```typescript
// Install: pnpm dlx shadcn@latest add alert-dialog
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Remove</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Remove from your list?</AlertDialogTitle>
      <AlertDialogDescription>
        Remove "{title}" from your list? This cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Auto-Resizing Textarea
```typescript
// CSS approach (modern browsers): field-sizing: content
// Fallback: onInput handler
function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
  const target = e.currentTarget
  target.style.height = 'auto'
  target.style.height = `${target.scrollHeight}px`
}
```

### Star Rating Component Pattern
```typescript
// Custom component -- no library needed for 10 stars
function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(value === star ? null : star)}
          className="p-0.5"
        >
          <Star
            className={cn(
              'size-5 transition-colors',
              (hovered !== null ? star <= hovered : value !== null && star <= value)
                ? 'fill-amber-500 text-amber-500'
                : 'fill-transparent text-muted-foreground/40',
              hovered !== null && star <= hovered && 'fill-amber-400 text-amber-400',
            )}
          />
        </button>
      ))}
      {value !== null && (
        <span className="ml-2 text-sm text-muted-foreground">{value}/10</span>
      )}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params.id` direct access | `const { id } = await params` | Next.js 15+ | Dynamic route params are Promises in Next.js 16 |
| `getServerSideProps` | Server components + server actions | Next.js 13+ | Edit page is a server component, mutations are server actions |
| Form submission with redirect | Auto-save with `useTransition` | React 19 | Each field saves independently, no form submission |
| Drizzle `db:migrate` | `db:push` (project convention) | Project decision | No migration files -- schema changes pushed directly |

**Note:** The project uses `db:push` (no migration directory exists). Schema changes to `tracking.ts` are applied via `pnpm db:push`.

## Open Questions

1. **shadcn Select `onValueChange` API in base-nova**
   - What we know: The base-nova variant Select uses Base UI primitives, not Radix. The `items` prop and general pattern are documented.
   - What's unclear: The exact controlled value API may differ slightly from Radix-based shadcn Select. The `onValueChange` callback name may be different.
   - Recommendation: After installing the Select component, read the generated `select.tsx` file to verify the exact prop names. LOW risk since the generated code is inspectable.

2. **`field-sizing: content` browser support for textarea auto-resize**
   - What we know: `field-sizing: content` is a modern CSS property supported in Chrome 123+, Firefox 132+.
   - What's unclear: Safari support may be limited.
   - Recommendation: Use the JavaScript `onInput` height resize fallback as the primary approach. It works everywhere and is simple. Only 5 lines of code.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.mts` |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` (`vitest run --reporter=verbose`) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRCK-01 | Add entry from search (enhanced: toast link, badge nav) | unit | `pnpm vitest run tests/tracking/search-integration.test.ts -x` | No -- Wave 0 |
| TRCK-02 | Update status (5 valid values, rejects invalid) | unit | `pnpm vitest run tests/tracking/update-status.test.ts -x` | No -- Wave 0 |
| TRCK-03 | Update progress (clamp, auto-complete) | unit | `pnpm vitest run tests/tracking/update-progress.test.ts -x` | No -- Wave 0 |
| TRCK-04 | Update rating (1-10, null for removal) | unit | `pnpm vitest run tests/tracking/update-rating.test.ts -x` | No -- Wave 0 |
| TRCK-05 | Update notes (text, null/empty) | unit | `pnpm vitest run tests/tracking/update-notes.test.ts -x` | No -- Wave 0 |
| TRCK-06 | Remove entry (deletes row, auth check) | unit | `pnpm vitest run tests/tracking/remove-entry.test.ts -x` | No -- Wave 0 |
| -- | Refresh metadata (AniList fetch, cooldown, mapping) | unit | `pnpm vitest run tests/tracking/refresh-metadata.test.ts -x` | No -- Wave 0 |
| -- | Get tracking entry (by ID + userId, not found) | unit | `pnpm vitest run tests/tracking/get-tracking-entry.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/tracking/` directory -- create for all phase 4 tests
- [ ] `tests/tracking/update-status.test.ts` -- covers TRCK-02
- [ ] `tests/tracking/update-progress.test.ts` -- covers TRCK-03 (including clamp + auto-complete)
- [ ] `tests/tracking/update-rating.test.ts` -- covers TRCK-04
- [ ] `tests/tracking/update-notes.test.ts` -- covers TRCK-05
- [ ] `tests/tracking/remove-entry.test.ts` -- covers TRCK-06
- [ ] `tests/tracking/refresh-metadata.test.ts` -- covers metadata refresh with cooldown
- [ ] `tests/tracking/get-tracking-entry.test.ts` -- covers single entry fetch

Test pattern follows existing `tests/search/add-tracking-entry.test.ts`: mock `@/db/drizzle`, `@/db/schema`, and `drizzle-orm`, then test use case logic in isolation.

## Sources

### Primary (HIGH confidence)
- Project codebase -- `src/modules/tracking/`, `src/db/schema/tracking.ts`, `src/app/(app)/search/actions.ts` (existing patterns)
- Project `components.json` -- confirms `base-nova` style for shadcn
- Project `vitest.config.mts` + `tests/search/add-tracking-entry.test.ts` -- test patterns

### Secondary (MEDIUM confidence)
- [AniList GraphQL Media Docs](https://docs.anilist.co/guide/graphql/queries/media) -- single Media query by ID
- [Drizzle ORM Update Docs](https://orm.drizzle.team/docs/update) -- update/set/where/returning pattern
- [shadcn/ui Select (base)](https://ui.shadcn.com/docs/components/base/select) -- Select component API
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/radix/alert-dialog) -- AlertDialog component API
- [shadcn/ui Components](https://ui.shadcn.com/docs/components) -- confirms all components available in base variant

### Tertiary (LOW confidence)
- shadcn Select controlled value API for base-nova variant -- needs verification after install (see Open Questions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in project, no new dependencies
- Architecture: HIGH -- follows established hexagonal patterns exactly, with 5 existing use cases as templates
- Pitfalls: HIGH -- identified from direct codebase analysis (race conditions, auth checks, schema nullability, rate limiting, Next.js 16 params)
- UI components: MEDIUM -- shadcn base-nova Select API needs verification after install, but the pattern is well-documented

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable stack, no fast-moving dependencies)
