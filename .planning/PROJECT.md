# My Anime Tracker

## What This Is

A personal web application for tracking anime and manga progress. Search for series via the AniList API, add them to your collection, track episodes/chapters, rate and take notes. Features a warm cozy dark theme with a cover image grid as the primary daily interface.

## Core Value

Quickly see where I left off on any anime or manga, and never lose track of my watching/reading progress.

## Requirements

### Validated

- ✓ User can sign up and log in with email/password — v1.0
- ✓ User session persists across browser refresh — v1.0
- ✓ User can search anime and manga via AniList API — v1.0
- ✓ User can add series to tracking list from search results — v1.0
- ✓ User can set status (Watching, Completed, On Hold, Dropped, Plan to Watch) — v1.0
- ✓ User can update episode/chapter progress with increment/decrement/direct input — v1.0
- ✓ User can rate on 1-10 scale — v1.0
- ✓ User can add personal notes — v1.0
- ✓ User can remove entries from tracking list — v1.0
- ✓ Cover image grid with status badges and progress bars — v1.0
- ✓ Filter by status and type, sort by rating/title/date — v1.0
- ✓ Detail page with synopsis, genres, studios/authors, related series — v1.0
- ✓ Warm cozy dark theme with amber accents — v1.0
- ✓ Responsive mobile-first layout (2/3/4/5/6 columns) — v1.0
- ✓ Hexagonal DDD architecture — v1.0
- ✓ Docker DX with Makefile commands — v1.0
- ✓ Vercel + Neon PostgreSQL free tier deployment — v1.0

### Active

- [ ] App supports English, Spanish, and Catalan (deferred from v1.0)
- [ ] All UI text uses translation keys (deferred from v1.0)

### Out of Scope

- Public profiles or social features — single-user app
- Internal anime/manga database — all data sourced from AniList API
- Admin panel / backoffice — not needed for personal use
- Real-time notifications — streaming apps already handle this
- Mobile native app — responsive web covers mobile use
- Video streaming or content hosting — different product category
- Light theme — cozy dark is the opinionated visual identity
- Multiple scoring systems — 1-10 is sufficient
- Recommendation engine — AniList already does this
- Auto-tracking from streaming services — enormous integration surface

## Context

Shipped v1.0 MVP with 6,647 LOC TypeScript across 89 commits in 3 days.

**Tech stack:** Next.js 16, React 19, Tailwind CSS v4, Drizzle ORM, Better Auth, PostgreSQL (Neon prod / Docker local), AniList GraphQL API.

**Architecture:** Hexagonal DDD with auth and tracking bounded contexts. Domain entities, ports, adapters, use cases. Server actions as auth boundary between UI and application layer.

**Test coverage:** 172 tests (architecture, schema, auth, search, tracking, list).

**Known tech debt:**
- PlaceholderGrid dead code from Phase 1 (superseded by TrackingGrid)
- `dangerouslySetInnerHTML` on already-sanitized text in detail page

## Constraints

- **Cost**: Must run on free tiers — Vercel for hosting, Neon for database
- **Tech stack**: TypeScript, shadcn/ui + Tailwind CSS v4, Next.js 16
- **Architecture**: Hexagonal DDD — Domain, Application, Infrastructure, UI layers
- **Local dev**: Docker-based with Makefile (make up, make halt, make destroy)
- **No Supabase**: User dislikes the cold-start/sleep behavior
- **Auth**: Better Auth v1.5.4 with Drizzle adapter, single-user registration lock
- **API**: AniList GraphQL with token bucket rate limiter (25 req/min safety margin)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hexagonal DDD architecture | Clean separation of concerns, testable use cases | ✓ Good — consistent pattern across all 5 phases |
| Free-tier stack (Vercel + Neon) | Zero cost for personal project | ✓ Good — no hosting costs |
| shadcn/ui + Tailwind v4 | Good DX with TypeScript, oklch color support | ✓ Good — base-ui render prop pattern worked well |
| Docker for local dev | Reproducible environment, Makefile commands | ✓ Good — postgres:17.6-alpine pinned for offline use |
| Dark theme only (cozy/warm) | Matches anime viewing context, opinionated identity | ✓ Good — oklch amber accents give warm feel |
| Better Auth (not NextAuth) | Native Next.js 16 support, Drizzle adapter | ✓ Good — database sessions, registration lock, proxy.ts |
| AniList GraphQL (not Jikan/MAL) | Rich data, no API key needed, GraphQL flexibility | ✓ Good — unified search, rate limiter handles degraded mode |
| Native fetch for GraphQL | No Apollo/urql overhead for simple POST queries | ✓ Good — minimal dependencies |
| Token bucket rate limiter | Safety margin under AniList 30 req/min degraded limit | ✓ Good — 25 req/min with 5-min server cache |
| Auto-save with useTransition | Independent per-field saves, non-blocking UX | ✓ Good — optimistic state with rollback |
| Deferred i18n to v2 | English only for MVP, focus on core features | ✓ Good — shipped faster without i18n complexity |
| proxy.ts + server getSession | Defense-in-depth auth protection | ✓ Good — two layers catch different failure modes |
| IntersectionObserver for scroll | Native API, no library dependency for infinite scroll | ✓ Good — key prop reset on filter change |

---
*Last updated: 2026-03-10 after v1.0 milestone*
