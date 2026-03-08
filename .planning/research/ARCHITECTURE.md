# Architecture Research

**Domain:** Personal anime/manga tracking web application
**Researched:** 2026-03-08
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (UI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Next.js     │  │  React       │  │  shadcn/ui   │                  │
│  │  Pages/      │  │  Components  │  │  + Tailwind   │                  │
│  │  Layouts     │  │  (Client)    │  │  Primitives  │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘                  │
│         │                 │                                             │
│  ┌──────┴─────────────────┴───────────────────────────────────────┐    │
│  │  Server Actions / API Routes (Driving Adapters / Controllers)  │    │
│  └──────────────────────────┬─────────────────────────────────────┘    │
├─────────────────────────────┼───────────────────────────────────────────┤
│                     APPLICATION LAYER                                   │
│  ┌──────────────────────────┴─────────────────────────────────────┐    │
│  │                    Use Cases (Application Services)             │    │
│  │  ┌───────────┐ ┌────────────┐ ┌─────────────┐ ┌────────────┐  │    │
│  │  │ Search    │ │ Track      │ │ Update      │ │ Filter/    │  │    │
│  │  │ Media     │ │ Media      │ │ Progress    │ │ Sort List  │  │    │
│  │  └───────────┘ └────────────┘ └─────────────┘ └────────────┘  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                          │                                             │
│  ┌───────────────────────┴────────────────────────────────────────┐    │
│  │               Ports (Interfaces / Contracts)                    │    │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐  │    │
│  │  │ MediaRepository  │  │ TrackingRepository│  │ AuthPort     │  │    │
│  │  │ (external API)   │  │ (user data)       │  │              │  │    │
│  │  └─────────────────┘  └──────────────────┘  └──────────────┘  │    │
│  └────────────────────────────────────────────────────────────────┘    │
├───────────────────────────────────────────────────────────────────────┤
│                         DOMAIN LAYER (Core)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  Entities    │  │  Value       │  │  Domain      │                  │
│  │  - Media     │  │  Objects     │  │  Services    │                  │
│  │  - Tracking  │  │  - Status    │  │  - Progress  │                  │
│  │    Entry     │  │  - Rating    │  │    Rules     │                  │
│  │  - User      │  │  - Progress  │  │  - Rating    │                  │
│  │              │  │  - MediaType │  │    Rules     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
├───────────────────────────────────────────────────────────────────────┤
│                     INFRASTRUCTURE LAYER (Adapters)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  AniList     │  │  Drizzle +   │  │  Auth        │                  │
│  │  GraphQL     │  │  Neon PG     │  │  Adapter     │                  │
│  │  Adapter     │  │  Adapter     │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Dependency Rule

Dependencies always point inward: UI -> Application -> Domain. Infrastructure implements ports defined in Application/Domain but never the reverse. Domain has zero external dependencies.

```
UI ──depends on──> Application ──depends on──> Domain
                                                  ^
Infrastructure ──implements──────────────────────┘
  (adapters implement port interfaces defined in application/domain)
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Domain Entities** | Core business objects with identity and rules | Plain TypeScript classes/types (Media, TrackingEntry, User) |
| **Value Objects** | Immutable domain concepts without identity | TypeScript branded types or small classes (Status, Rating, Progress, MediaType) |
| **Domain Services** | Business logic spanning multiple entities | Pure functions (progress validation, rating rules) |
| **Ports (Interfaces)** | Contracts for external communication | TypeScript interfaces (MediaRepository, TrackingRepository) |
| **Use Cases** | Single-purpose application orchestration | Functions/classes calling domain + ports (SearchMedia, AddToList, UpdateProgress) |
| **Driving Adapters** | Entry points that invoke use cases | Next.js Server Actions, API Routes |
| **Driven Adapters** | Implementations of port interfaces | AniList GraphQL client, Drizzle ORM repository, auth provider |
| **UI Components** | Visual presentation and user interaction | React components with shadcn/ui, consuming use cases via server actions or hooks |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router (Presentation entry points)
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/                   # Authenticated route group
│   │   ├── dashboard/page.tsx
│   │   ├── search/page.tsx
│   │   └── list/page.tsx
│   ├── layout.tsx                # Root layout (providers, i18n, theme)
│   └── globals.css
│
├── modules/                      # Hexagonal DDD modules (bounded contexts)
│   ├── media/                    # Media bounded context (anime/manga catalog)
│   │   ├── domain/
│   │   │   ├── media.entity.ts           # Media entity type
│   │   │   ├── media-type.value-object.ts # Anime | Manga enum
│   │   │   └── media.errors.ts           # Domain-specific errors
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── media-repository.port.ts    # Interface for fetching media
│   │   │   ├── search-media.use-case.ts        # Search anime/manga
│   │   │   └── get-media-detail.use-case.ts    # Get single media details
│   │   └── infrastructure/
│   │       └── anilist-media.adapter.ts         # AniList GraphQL implementation
│   │
│   ├── tracking/                 # Tracking bounded context (user's list)
│   │   ├── domain/
│   │   │   ├── tracking-entry.entity.ts   # TrackingEntry entity
│   │   │   ├── status.value-object.ts     # Watching/Completed/OnHold/Dropped/PlanTo
│   │   │   ├── rating.value-object.ts     # 1-10 scale with validation
│   │   │   ├── progress.value-object.ts   # Episode/chapter progress
│   │   │   └── tracking.errors.ts         # Domain-specific errors
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── tracking-repository.port.ts # Interface for persistence
│   │   │   ├── add-to-list.use-case.ts
│   │   │   ├── update-progress.use-case.ts
│   │   │   ├── update-status.use-case.ts
│   │   │   ├── rate-entry.use-case.ts
│   │   │   ├── add-note.use-case.ts
│   │   │   └── get-user-list.use-case.ts
│   │   └── infrastructure/
│   │       └── drizzle-tracking.adapter.ts     # Drizzle/Neon PostgreSQL implementation
│   │
│   └── auth/                     # Auth bounded context
│       ├── domain/
│       │   ├── user.entity.ts
│       │   └── auth.errors.ts
│       ├── application/
│       │   ├── ports/
│       │   │   └── auth-repository.port.ts
│       │   ├── login.use-case.ts
│       │   └── register.use-case.ts
│       └── infrastructure/
│           └── [auth-provider].adapter.ts
│
├── server/                       # Server-side glue (Driving Adapters)
│   ├── actions/                  # Next.js Server Actions
│   │   ├── media.actions.ts      # Search, get detail
│   │   ├── tracking.actions.ts   # CRUD for tracking entries
│   │   └── auth.actions.ts       # Login, register, logout
│   └── container.ts              # Dependency injection / wiring
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives
│   ├── media/                    # Media-specific components (cards, grids)
│   ├── tracking/                 # Tracking-specific components (status badges, progress)
│   └── layout/                   # Shell, navigation, theme toggle
│
├── lib/                          # Shared utilities
│   ├── i18n/                     # Internationalization (EN, ES, CA)
│   ├── db/                       # Drizzle schema + connection
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   └── client.ts
│   └── utils.ts                  # Shared helpers (cn, formatters)
│
└── types/                        # Shared TypeScript types
    └── index.ts
```

### Structure Rationale

- **`modules/`**: The heart of hexagonal DDD. Each bounded context (media, tracking, auth) is self-contained with its own domain, application, and infrastructure layers. This prevents cross-contamination between contexts and makes each one independently testable.

- **`modules/*/domain/`**: Pure TypeScript with zero imports from outside the domain. Contains entities, value objects, and domain errors. This is the innermost ring -- it knows nothing about databases, APIs, or React.

- **`modules/*/application/`**: Contains use cases (one per user action) and port interfaces. Use cases orchestrate domain logic and call ports. Ports are interfaces only -- no implementations here.

- **`modules/*/infrastructure/`**: Adapter implementations that fulfill port contracts. The AniList adapter implements MediaRepository. The Drizzle adapter implements TrackingRepository. Swappable without touching domain or application code.

- **`server/actions/`**: Next.js Server Actions act as "driving adapters" -- they receive user intent from the UI, instantiate use cases with the correct adapters (via the container), and return results. This is the bridge between Next.js and the hexagonal core.

- **`server/container.ts`**: Simple dependency injection wiring. Creates adapter instances and wires them into use cases. No DI framework needed for a single-user app -- a factory function is sufficient.

- **`components/`**: Pure presentation. Components call server actions or receive data as props. They never import from `modules/` directly -- always through server actions or hooks that wrap server actions.

- **`lib/db/`**: Drizzle schema and connection live here as shared infrastructure. The schema is referenced by infrastructure adapters but not by domain or application layers.

- **`app/`**: Next.js App Router pages are thin shells. They compose components and wire server actions. Minimal logic -- just layout and data passing.

## Architectural Patterns

### Pattern 1: Use Case as Single-Purpose Function

**What:** Each user action maps to one use case function/class that orchestrates domain logic through ports.
**When to use:** Every feature interaction. Each server action calls exactly one use case.
**Trade-offs:** More files, but each is small, testable, and has a clear responsibility. For a personal app, classes are overkill -- use plain functions.

**Example:**
```typescript
// modules/tracking/application/update-progress.use-case.ts
import type { TrackingRepository } from './ports/tracking-repository.port';
import { Progress } from '../domain/progress.value-object';
import { TrackingNotFoundError } from '../domain/tracking.errors';

interface UpdateProgressInput {
  entryId: string;
  currentEpisode?: number;
  currentChapter?: number;
}

export function createUpdateProgressUseCase(repo: TrackingRepository) {
  return async (input: UpdateProgressInput): Promise<void> => {
    const entry = await repo.findById(input.entryId);
    if (!entry) throw new TrackingNotFoundError(input.entryId);

    const progress = Progress.create({
      current: input.currentEpisode ?? input.currentChapter ?? 0,
      total: entry.totalEpisodes ?? entry.totalChapters,
    });

    await repo.updateProgress(input.entryId, progress);
  };
}
```

### Pattern 2: Port Interface + Adapter Implementation

**What:** Ports define contracts as TypeScript interfaces. Adapters implement them with real technology. The application layer only knows the interface, never the implementation.
**When to use:** Any external dependency -- database, external API, auth provider.
**Trade-offs:** Adds indirection but enables testing with in-memory implementations and swapping providers (e.g., switching from AniList to Jikan) without touching business logic.

**Example:**
```typescript
// modules/media/application/ports/media-repository.port.ts
import type { Media } from '../../domain/media.entity';

export interface MediaRepository {
  search(query: string, type?: 'ANIME' | 'MANGA'): Promise<Media[]>;
  findById(id: number): Promise<Media | null>;
}

// modules/media/infrastructure/anilist-media.adapter.ts
import type { MediaRepository } from '../application/ports/media-repository.port';
import type { Media } from '../domain/media.entity';

export class AniListMediaAdapter implements MediaRepository {
  private readonly endpoint = 'https://graphql.anilist.co';

  async search(query: string, type?: 'ANIME' | 'MANGA'): Promise<Media[]> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search: query, type },
      }),
    });
    const data = await response.json();
    return this.mapToMediaEntities(data.data.Page.media);
  }

  // ... mapping logic
}
```

### Pattern 3: Server Actions as Driving Adapters

**What:** Next.js Server Actions serve as the "driving adapter" -- the entry point that bridges the UI (React components) with the hexagonal core (use cases). They handle request validation, instantiate use cases via the container, and return serializable results.
**When to use:** Every user-triggered mutation or query from client components. Server Components can call use cases directly for initial page loads.
**Trade-offs:** Keeps React components pure (no business logic), but adds a thin orchestration layer. Worth it for testability and separation.

**Example:**
```typescript
// server/actions/tracking.actions.ts
'use server';

import { getContainer } from '../container';
import { revalidatePath } from 'next/cache';

export async function updateProgress(entryId: string, episode: number) {
  const { updateProgressUseCase } = getContainer();

  await updateProgressUseCase({ entryId, currentEpisode: episode });

  revalidatePath('/list');
}
```

### Pattern 4: Lightweight Dependency Injection via Factory

**What:** A simple container factory that wires adapters into use cases. No DI framework (InversifyJS, tsyringe) needed for a small single-user app.
**When to use:** In `server/container.ts` -- called by server actions and server components.
**Trade-offs:** Not as flexible as a full DI framework, but far simpler. Can always upgrade later if needed.

**Example:**
```typescript
// server/container.ts
import { AniListMediaAdapter } from '@/modules/media/infrastructure/anilist-media.adapter';
import { DrizzleTrackingAdapter } from '@/modules/tracking/infrastructure/drizzle-tracking.adapter';
import { createSearchMediaUseCase } from '@/modules/media/application/search-media.use-case';
import { createUpdateProgressUseCase } from '@/modules/tracking/application/update-progress.use-case';
import { db } from '@/lib/db/client';

export function getContainer() {
  const mediaRepo = new AniListMediaAdapter();
  const trackingRepo = new DrizzleTrackingAdapter(db);

  return {
    searchMediaUseCase: createSearchMediaUseCase(mediaRepo),
    updateProgressUseCase: createUpdateProgressUseCase(trackingRepo),
    // ... other use cases
  };
}
```

## Data Flow

### Request Flow: User Searches for Anime

```
[User types in search bar]
    |
    v
[Client Component] -- calls --> [Server Action: searchMedia()]
    |                                    |
    |                                    v
    |                           [Container: getContainer()]
    |                                    |
    |                                    v
    |                           [SearchMedia Use Case]
    |                                    |
    |                                    v
    |                           [MediaRepository Port]
    |                                    |
    |                                    v
    |                           [AniList GraphQL Adapter] -- HTTP --> [AniList API]
    |                                    |
    |                                    v
    |                           [Maps API response to Media entities]
    |                                    |
    v                                    v
[Receives Media[] and renders results]
```

### Request Flow: User Updates Episode Progress

```
[User clicks +1 episode button]
    |
    v
[Client Component] -- calls --> [Server Action: updateProgress()]
    |                                    |
    |                                    v
    |                           [UpdateProgress Use Case]
    |                                    |
    |                        +-----------+-----------+
    |                        |                       |
    |                        v                       v
    |               [TrackingRepository]      [Progress.create()]
    |               [findById()]              [validates bounds]
    |                        |                       |
    |                        v                       v
    |               [Drizzle Adapter]         [Returns valid Progress]
    |               [PostgreSQL/Neon]                 |
    |                        |                       |
    |                        v                       |
    |               [repo.updateProgress()]  <-------+
    |                        |
    |                        v
    |               [revalidatePath('/list')]
    |                        |
    v                        v
[UI re-renders with updated progress]
```

### State Management

This app does NOT need a client-side state management library (Redux, Zustand, etc.). Next.js App Router with Server Components and Server Actions provides sufficient state management:

```
[PostgreSQL/Neon] -- source of truth for user data
        |
        v
[Server Components] -- fetch data on the server, pass as props
        |
        v
[Client Components] -- local React state for UI interactions only
        |
        v
[Server Actions] -- mutations that write back to database
        |
        v
[revalidatePath/revalidateTag] -- triggers re-fetch of server data
```

For the AniList API responses, use Next.js `fetch()` with built-in caching (or `unstable_cache`) on the server side. No client-side cache layer needed.

### Key Data Flows

1. **Search flow (read, external):** UI -> Server Action -> Use Case -> AniList Adapter -> AniList API -> mapped Media entities -> UI. Cached via Next.js fetch cache with appropriate TTL (media data rarely changes).

2. **List management flow (write, internal):** UI -> Server Action -> Use Case -> Domain validation -> Drizzle Adapter -> Neon PostgreSQL -> revalidate -> re-render.

3. **List viewing flow (read, internal):** Server Component -> Use Case -> Drizzle Adapter -> Neon PostgreSQL -> TrackingEntry entities -> Component props -> UI render.

4. **Auth flow:** UI -> Server Action -> Auth Use Case -> Auth Adapter -> Session management -> redirect.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single user (this app) | Monolith is perfect. Server Actions + direct DB access. No caching layer needed beyond Next.js built-in fetch cache for AniList responses. |
| 10-100 users | Add connection pooling for Neon (pgBouncer). Add rate-limit middleware for AniList calls. Consider Redis/Upstash for API response caching. |
| 1000+ users | Out of scope for a personal app. Would need: dedicated API cache, background jobs for bulk API fetching, possibly a local media metadata cache table. |

### Scaling Priorities

1. **First bottleneck (if ever):** AniList API rate limits (90 req/min, currently degraded to 30 req/min). Mitigation: cache search results server-side with 1-hour TTL. Cache media details for 24 hours.
2. **Second bottleneck:** Neon PostgreSQL cold starts on free tier. Mitigation: keep-alive pings or accept the ~500ms cold start for first request.

## Anti-Patterns

### Anti-Pattern 1: Domain Leaking into UI

**What people do:** Put business logic (validation, status transitions, progress bounds checking) directly in React components or server actions.
**Why it's wrong:** Logic becomes untestable without rendering components, duplicated across views, and tightly coupled to React/Next.js.
**Do this instead:** All business rules live in domain entities/value objects/services. Server actions only orchestrate -- they call use cases, which call domain logic.

### Anti-Pattern 2: Adapter Logic in Use Cases

**What people do:** Put `fetch()` calls to AniList or Drizzle queries directly in use cases.
**Why it's wrong:** Use cases become untestable without real API/database connections. Switching providers requires rewriting application logic.
**Do this instead:** Use cases only call port interfaces. The actual `fetch()` or Drizzle call lives in the infrastructure adapter that implements the port.

### Anti-Pattern 3: Cross-Module Direct Imports

**What people do:** Import tracking domain entities directly into the media module or vice versa.
**Why it's wrong:** Creates tight coupling between bounded contexts. Changes in one module cascade to others.
**Do this instead:** Modules communicate through shared IDs only. The tracking module references media by `externalMediaId` (the AniList ID), not by importing a Media entity. If modules need to interact, do it at the application layer through a coordinating use case.

### Anti-Pattern 4: Fat Server Actions

**What people do:** Put validation, database queries, API calls, error handling, and response formatting all in one server action function.
**Why it's wrong:** Server actions become god functions. Impossible to test logic independently. Violates single responsibility.
**Do this instead:** Server actions are thin -- validate input (with zod), call one use case, handle errors, return result. Five to ten lines maximum.

### Anti-Pattern 5: Over-Engineering the DDD for a Personal App

**What people do:** Create Aggregate Roots, Domain Events, Event Buses, CQRS, and full Entity base classes for a simple CRUD app.
**Why it's wrong:** Adds massive complexity for minimal benefit. A personal tracker with ~5 entities does not need event sourcing or complex aggregates.
**Do this instead:** Use "DDD-lite": entities as TypeScript types/interfaces, value objects as branded types or simple validated constructors, use cases as plain functions. Skip: aggregates, domain events, repositories with Unit of Work, CQRS. Add these only if genuine complexity emerges.

### Anti-Pattern 6: Caching AniList Data in Your Database

**What people do:** Store full anime/manga metadata (titles, descriptions, images, genres, episodes) in PostgreSQL as a local cache.
**Why it's wrong:** Creates a stale data maintenance burden. AniList data updates constantly (new episodes, score changes). You end up building a sync system.
**Do this instead:** Store only the AniList media ID in your tracking table. Fetch current metadata from AniList on demand. Use Next.js server-side fetch caching (with TTL) for performance. The only data in YOUR database should be data YOU create (tracking status, progress, rating, notes).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| AniList GraphQL API | POST to `https://graphql.anilist.co` via adapter | 90 req/min (currently 30 during degraded state). Cache responses server-side. No auth needed for public queries. |
| Neon PostgreSQL | Drizzle ORM via serverless driver (`@neondatabase/serverless`) | Free tier: 0.5 GB storage, auto-suspend after 5 min inactivity. ~500ms cold start. |
| Vercel Hosting | Next.js App Router, automatic deployment | Free tier: 100 GB bandwidth, serverless functions, edge runtime available. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI <-> Application | Server Actions (driving adapters) | UI never imports from `modules/` directly. Always goes through `server/actions/`. |
| Application <-> Infrastructure | Port interfaces (driven adapters) | Use cases depend on interfaces only. Adapters are injected via container. |
| Media module <-> Tracking module | Shared ID reference only (`externalMediaId: number`) | No direct imports between modules. Tracking stores the AniList ID, UI fetches media details separately. |
| Domain <-> Everything else | Zero outward dependencies | Domain layer has no imports from application, infrastructure, or UI. Pure TypeScript only. |

### Database Schema (Conceptual)

The PostgreSQL database stores ONLY user-created data:

```
users
  - id (uuid, PK)
  - email (unique)
  - password_hash
  - preferred_language (en|es|ca)
  - created_at

tracking_entries
  - id (uuid, PK)
  - user_id (FK -> users)
  - external_media_id (integer, AniList ID)
  - media_type (enum: ANIME|MANGA)
  - status (enum: WATCHING|COMPLETED|ON_HOLD|DROPPED|PLAN_TO_WATCH)
  - current_episode (integer, nullable, for anime)
  - current_chapter (integer, nullable, for manga)
  - rating (integer, 1-10, nullable)
  - notes (text, nullable)
  - created_at
  - updated_at
  - UNIQUE(user_id, external_media_id)
```

Note: No media metadata is stored. Title, cover image, genre, etc. are always fetched from AniList at display time (with server-side caching).

### Build Order (Dependencies)

The architecture has clear dependency chains that dictate build order:

```
Phase 1: Domain Layer (zero dependencies, build first)
    |
    v
Phase 2: Application Layer - Ports + Use Cases (depends on domain)
    |
    v
Phase 3: Infrastructure Layer - Adapters (depends on ports)
    |     - Database schema + Drizzle adapter
    |     - AniList GraphQL adapter
    |
    v
Phase 4: Server Layer - Actions + Container (depends on use cases + adapters)
    |
    v
Phase 5: UI Layer - Components + Pages (depends on server actions)
```

Within each phase, the three bounded contexts (media, tracking, auth) can be built in parallel. However, the practical priority is:

1. **Auth** first -- everything else requires a user context
2. **Media** second -- search is the entry point for adding content
3. **Tracking** third -- depends on having media to track

The bottom-up build order (domain first, UI last) ensures each layer can be unit-tested independently before wiring together.

## Sources

- [Sairyss/domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) -- DDD + Hexagonal reference architecture in TypeScript
- [kuzeofficial/next-hexagonal-architecture](https://github.com/kuzeofficial/next-hexagonal-architecture) -- Next.js hexagonal template with shadcn/ui
- [juanm4/hexagonal-architecture-frontend](https://github.com/juanm4/hexagonal-architecture-frontend) -- Frontend hexagonal patterns
- [AniList API Rate Limiting](https://docs.anilist.co/guide/rate-limiting) -- 90 req/min (30 degraded)
- [AniList API Docs](https://docs.anilist.co/) -- GraphQL API documentation
- [Drizzle ORM + Next.js + Neon tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) -- Official Drizzle integration guide
- [Hexagonal Architecture in React](https://alexkondov.com/hexagonal-inspired-architecture-in-react/) -- Practical React-specific patterns
- [Clean Architecture in Next.js with DI](https://dev.to/behnamrhp/how-we-fixed-nextjs-at-scale-di-clean-architecture-secrets-from-production-gnj) -- Production patterns for layered Next.js

---
*Architecture research for: Personal anime/manga tracker with hexagonal DDD*
*Researched: 2026-03-08*
