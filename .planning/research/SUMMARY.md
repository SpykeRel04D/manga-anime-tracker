# Project Research Summary

**Project:** Manga/Anime Tracker
**Domain:** Personal anime/manga tracking web application
**Researched:** 2026-03-08
**Confidence:** HIGH

## Executive Summary

This project is a single-user personal anime/manga tracker -- a well-established application category with clear industry conventions set by MyAnimeList, AniList, and Kitsu. The expert approach is to build a focused, opinionated tracking tool that stores only user-generated data (status, progress, ratings, notes) in a personal database while fetching catalog metadata (titles, covers, genres, episode counts) on demand from the AniList GraphQL API. The recommended stack is Next.js 16 with App Router, Drizzle ORM on Neon PostgreSQL (free tier), Better Auth for credentials, shadcn/ui with a warm dark theme, and next-intl for trilingual support (EN/ES/CA). All technologies are current, well-documented, and compatible with Vercel free-tier deployment.

The architecture follows a "Lite Hexagonal" pattern -- maintaining clean layer separation (domain, application, infrastructure, presentation) without the full ceremony of value objects, aggregates, and domain events that would be overkill for a CRUD-dominant personal app. Three bounded contexts (auth, media, tracking) each own their domain and communicate through shared IDs, not direct imports. Server Actions serve as driving adapters between the React UI and the hexagonal core, while a simple factory-based DI container wires adapters to use cases.

The primary risks are AniList API rate limiting (currently degraded to 30 req/min, with a cascade failure mode that locks out all requests for a full minute), over-engineering the hexagonal DDD for what is fundamentally a CRUD app, and Neon free-tier compute exhaustion causing silent mid-month outages. All three are preventable with upfront design decisions: implement a request queue with token bucket rate limiting and tiered caching from day one, adopt Lite Hexagonal (keep the boundaries, skip the ceremony), and use Neon's pooled connection string with auto-suspend enabled. Docker is used only for local PostgreSQL; Next.js runs on the host for fast Turbopack HMR.

## Key Findings

### Recommended Stack

The stack is modern, lightweight, and optimized for serverless deployment on free tiers. Next.js 16.1 with Turbopack provides 2-5x faster builds. Drizzle ORM (7.4 KB bundle) with the native Neon HTTP driver is purpose-built for serverless. Better Auth 1.5.x is stable and TypeScript-native, chosen over the perpetually-beta Auth.js v5. shadcn/ui CLI v4 with Tailwind CSS v4 (CSS-first config) handles the component library. TanStack Query + graphql-request handle AniList API calls with caching and deduplication. See [STACK.md](STACK.md) for full details.

**Core technologies:**
- **Next.js 16.1** (App Router, Turbopack): Meta-framework -- stable Turbopack, zero-config Vercel deployment, Server Components and Server Actions for the data layer
- **Drizzle ORM + Neon PostgreSQL**: Database -- minimal bundle, native serverless driver, code-first TypeScript schemas, free tier more than adequate (0.5 GB storage, 100 CU-hours/month)
- **Better Auth 1.5.x**: Authentication -- stable 1.x, first-class Drizzle adapter, built-in credentials support without workarounds
- **shadcn/ui + Tailwind CSS v4**: UI -- copy-paste components built on Radix primitives, CSS-first Tailwind config, warm cozy dark theme via CSS variables
- **next-intl 4.8.x**: Internationalization -- purpose-built for App Router Server Components, ~2 KB bundle, handles EN/ES/CA
- **AniList GraphQL API**: External data -- 500k+ entries, GraphQL allows precise field selection, no auth needed for public queries, 90 req/min (30 degraded)
- **TanStack Query + graphql-request**: API layer -- caching, deduplication, background refetch for client-side AniList calls; ~5 KB GraphQL client vs Apollo's ~50 KB

### Expected Features

The feature landscape is well-understood from competitor analysis. See [FEATURES.md](FEATURES.md) for full prioritization matrix and dependency graph.

**Must have (table stakes -- MVP):**
- Search anime/manga via AniList API with debounced input
- Add to tracking list with one-click and auto-status
- Status management (5 standard statuses: Watching, Completed, On Hold, Dropped, Plan to Watch/Read)
- Episode/chapter progress tracking with increment/decrement
- 1-10 rating scale
- Personal notes per entry
- Cover image grid/card view with status badges
- Filter by status, sort by rating/title
- Email/password authentication (single user)
- Warm cozy dark theme as the design system
- i18n scaffolding (EN/ES/CA) from day one
- Responsive mobile-first layout

**Should have (differentiators -- v1.x):**
- Quick "+1" progress increment directly from grid cards
- Start/end date auto-tracking on status changes
- Re-watch/re-read counter
- Detail page with full AniList metadata (synopsis, genres, studios)
- Additional sort options (date added, last updated)

**Defer (v2+):**
- Local statistics dashboard (requires enough tracked data to be meaningful)
- MAL/AniList import (requires stable schema, one-time use)
- PWA offline support (adds service worker complexity)
- Data export (JSON/CSV)

### Architecture Approach

Lite Hexagonal DDD with three bounded contexts (auth, media, tracking), each containing domain, application, and infrastructure layers. The domain layer is pure TypeScript with zero external dependencies. Use cases are plain functions, not classes. Ports (interfaces) abstract external boundaries where there is genuine value (AniList API adapter, database adapter). The DI container is a simple factory function. Server Actions bridge the UI to the hexagonal core. No client-side state library is needed -- Server Components handle data fetching, Server Actions handle mutations, and `revalidatePath` triggers re-renders. See [ARCHITECTURE.md](ARCHITECTURE.md) for full structure and data flow diagrams.

**Major components:**
1. **Domain Layer** (modules/*/domain/) -- Entities, value objects, domain errors. Pure TypeScript, zero imports from outside.
2. **Application Layer** (modules/*/application/) -- Use cases (one per user action), port interfaces. Orchestrates domain logic through ports.
3. **Infrastructure Layer** (modules/*/infrastructure/) -- Adapters: AniList GraphQL client, Drizzle/Neon repository, auth provider. Implements port contracts.
4. **Server Layer** (server/actions/, server/container.ts) -- Server Actions as driving adapters, factory-based DI container.
5. **Presentation Layer** (app/, components/) -- Next.js App Router pages (thin shells), React components consuming server actions.

### Critical Pitfalls

The top risks are well-documented with clear prevention strategies. See [PITFALLS.md](PITFALLS.md) for the complete list with phase mappings.

1. **AniList API rate limit cascade** -- Exceeding the 30 req/min degraded limit locks out ALL requests for 1 minute. Prevent with: token bucket rate limiter in the API adapter, 300-500ms search debounce, aggressive server-side response caching with tiered TTLs (6h for airing, 30d for completed).
2. **Hexagonal DDD over-engineering** -- 80% of operations are CRUD. Full DDD creates 3-5x more files than needed. Prevent with: Lite Hexagonal (keep layer separation, skip value objects for primitives, allow domain = persistence models for simple entities, reserve full ports/adapters for the API integration).
3. **Neon free-tier compute exhaustion** -- 100 CU-hours/month sounds generous but compute that never suspends burns through it. Prevent with: pooled connection string, no keepalive pings, let auto-suspend work, monitor CU-hours weekly.
4. **next-intl silently opting into dynamic rendering** -- All pages become server-rendered on every request instead of statically cached. Prevent with: `setRequestLocale(locale)` in every layout/page, `generateStaticParams` for all locales, verify build output.
5. **Authentication middleware as sole security layer** -- Middleware can be bypassed (CVE-2025-29927). Prevent with: verify auth at every data access point (server actions, data fetching), middleware only for UX redirects.

## Implications for Roadmap

Based on research, the build order is dictated by three factors: (1) the hexagonal architecture's dependency rule (domain first, UI last), (2) feature dependencies (auth before tracking, API client before search, design system before feature UIs), and (3) pitfall prevention (infrastructure decisions that are painful to retrofit).

### Phase 1: Foundation and Infrastructure

**Rationale:** Architecture, tooling, and infrastructure decisions must be locked in before any feature work. The Docker DX pitfall, Neon connection configuration, and Lite Hexagonal boundaries all need to be right from the start. Retrofitting any of these is costly.
**Delivers:** Working local dev environment (Docker + Makefile for Postgres, native Next.js with Turbopack), project structure matching the Lite Hexagonal architecture, database schema and migrations, Drizzle + Neon connection (pooled for production, direct for migrations), CI lint/test pipeline, Tailwind v4 + shadcn/ui initialization with warm cozy theme CSS variables, next-intl scaffolding with static rendering configured.
**Addresses features:** Dark cozy theme (design system setup), i18n scaffolding, responsive layout foundation.
**Avoids pitfalls:** Docker macOS performance (Postgres-only container), Neon compute exhaustion (pooled connection from day one), next-intl dynamic rendering (static rendering configured immediately), over-engineered DDD (Lite Hexagonal boundaries documented).

### Phase 2: Authentication

**Rationale:** Every tracking feature depends on user identity. Auth must be complete before any list functionality. Better Auth with Drizzle adapter is straightforward but must include defense-in-depth (not just middleware).
**Delivers:** Email/password login and registration, session management, protected routes, auth verification at server action level, single-user initial setup flow.
**Addresses features:** Authentication (email/password).
**Avoids pitfalls:** Middleware-only auth bypass (verify at every data access point).

### Phase 3: AniList API Integration and Search

**Rationale:** The API adapter is foundational -- all content discovery depends on it. Rate limiting and caching must be baked in from the start, not bolted on. This is where full ports/adapters architecture earns its keep.
**Delivers:** AniList GraphQL adapter with token bucket rate limiter, tiered server-side caching, search with debounce, search results grid with cover images, media entity mapping.
**Addresses features:** Search anime/manga via AniList API, cover image display.
**Avoids pitfalls:** Rate limit cascade (request queue + caching from day one), stale cached data (tiered TTL by airing status).

### Phase 4: Core Tracking

**Rationale:** This is the core value proposition -- the reason the app exists. With auth and search in place, users can find content and need to track it. All CRUD operations for the tracking bounded context land here.
**Delivers:** Add to list, status management (5 statuses), episode/chapter progress tracking, 1-10 rating, personal notes, tracking entry persistence in Neon PostgreSQL.
**Addresses features:** Add to tracking list, status management, progress tracking, rating, notes.
**Avoids pitfalls:** Over-engineering (Lite Hexagonal for CRUD-dominant tracking operations).

### Phase 5: List UI and Browsing

**Rationale:** With tracking data in the database, the user needs to browse and manage their collection. This phase builds the primary user interface -- the cover grid that is the signature interaction pattern.
**Delivers:** Cover image grid/card view with status badges, filter by status and type, sort by rating/title, responsive grid (2 cols mobile, 3-4 tablet, 5-6 desktop), skeleton loaders, image optimization and fallbacks, empty states.
**Addresses features:** Cover image grid view, filter/sort lists, responsive layout.
**Avoids pitfalls:** Unbounded search results (paginate to 20), unoptimized cover images (use AniList `large` variant + Next.js Image), no loading states (skeleton loaders mandatory).

### Phase 6: Polish and Enhancements (v1.x)

**Rationale:** Once the core tracker is functional and in daily use, add quality-of-life features that reduce friction. These are low-complexity additions that improve the daily experience.
**Delivers:** Quick "+1" from grid cards, start/end date auto-tracking, re-watch/re-read counter, detail page with full AniList metadata, additional sort options.
**Addresses features:** All P2 "should have" features.
**Avoids pitfalls:** Feature creep (each enhancement is small and independent).

### Phase 7: Advanced Features (v2+)

**Rationale:** Only build after the core tracker is stable and has real usage data. Statistics need tracked entries to be meaningful. Import is a one-time use feature.
**Delivers:** Local statistics dashboard, MAL/AniList import, data export, PWA offline support.
**Addresses features:** All P3 "defer" features.

### Phase Ordering Rationale

- **Foundation before features** because Docker DX, Neon configuration, Lite Hexagonal boundaries, and i18n static rendering are all painful to retrofit and compound every subsequent phase if done wrong.
- **Auth before tracking** because the FEATURES.md dependency graph shows all tracking features require user context.
- **API integration before tracking** because users must find content before tracking it, and the rate limiting/caching architecture must be established before any code depends on the API.
- **Tracking before UI** because the grid view needs real data to render and test against. Building UI without data leads to dummy-data-driven design that breaks with real data shapes.
- **This order maps directly to the ARCHITECTURE.md build order:** domain layer (phases 1-2) -> application layer with ports (phase 3-4) -> infrastructure adapters (phases 3-4) -> server actions (phases 2-5) -> UI components (phase 5).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (AniList API Integration):** Complex integration -- needs research into specific GraphQL queries, field selection for search vs. detail, rate limiter implementation patterns, and server-side caching strategy with Next.js fetch cache.
- **Phase 5 (List UI):** The cover grid is the signature UX of the app. Needs research into responsive image grid patterns, virtual scrolling for large lists, optimistic UI updates, and accessible card interactions.
- **Phase 7 (Statistics/Import):** MAL XML import format parsing and local statistics aggregation are niche problems. Defer research until this phase is planned.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented. Next.js 16 setup, Docker Compose for Postgres, Drizzle schema, shadcn/ui init, and next-intl config all have official guides.
- **Phase 2 (Authentication):** Better Auth + Drizzle adapter has official documentation. Single-user credentials auth is the simplest auth pattern.
- **Phase 4 (Core Tracking):** Standard CRUD with Drizzle ORM. No novel patterns needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommendations backed by official documentation. Version compatibility verified. No speculative or beta technologies -- Next.js 16.1 is stable, Better Auth is 1.x, Drizzle ORM is mature. |
| Features | HIGH | Feature landscape established by 20+ years of anime tracking history (MAL since 2004). Table stakes are unambiguous. Competitor analysis covers MAL, AniList, Kitsu, and self-hosted alternatives. |
| Architecture | HIGH | Hexagonal + DDD patterns well-documented in TypeScript ecosystem. Multiple reference implementations reviewed. The "Lite Hexagonal" recommendation is a pragmatic adaptation for the scope. |
| Pitfalls | HIGH | Pitfalls sourced from official docs (AniList rate limits, Neon free tier limits, CVE-2025-29927), real GitHub issues (mihon rate limiting, Next.js Docker hot reload), and production experience reports. |

**Overall confidence:** HIGH

### Gaps to Address

- **AniList API degraded state duration:** The API is currently throttled to 30 req/min. It is unclear when (or if) it will return to 90 req/min. Design for 30 req/min as the baseline, treat 90 as a bonus.
- **Better Auth + Next.js 16 integration:** Better Auth 1.5.x is verified with Next.js 15. Explicit Next.js 16 compatibility should be validated during Phase 2 setup. The auth library's middleware and server-side session handling may need minor adjustments for Next.js 16's changes.
- **Neon cold start impact on UX:** The 300-500ms cold start is documented, but combined with Vercel cold starts the real-world first-request latency should be measured during Phase 1 infrastructure setup. If it exceeds 3 seconds, consider a keep-alive strategy.
- **shadcn/ui CLI v4 + Tailwind v4 theme customization:** The warm cozy dark theme requires custom CSS variable overrides. The exact approach for shadcn/ui CLI v4 with Tailwind v4's CSS-first config should be validated during Phase 1.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 / 16.1 Blog](https://nextjs.org/blog/next-16) -- Turbopack stability, breaking changes, upgrade guide
- [AniList API Docs](https://docs.anilist.co/) -- GraphQL endpoint, rate limiting (90 req/min, 30 degraded), data model
- [Neon Pricing and Plans](https://neon.com/pricing) -- Free tier limits (0.5 GB, 100 CU-hours, auto-suspend)
- [Neon Connection Pooling](https://neon.com/docs/connect/connection-pooling) -- PgBouncer configuration, cold start mitigation
- [Drizzle ORM + Neon Setup](https://orm.drizzle.team/docs/connect-neon) -- Native driver integration
- [Better Auth Docs](https://better-auth.com/) -- Drizzle adapter, credentials auth, plugin architecture
- [next-intl Docs](https://next-intl.dev/) -- App Router integration, static rendering, Server Components
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- CLI v4, unified Radix, Tailwind v4 support
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, performance gains
- [TanStack Query Docs](https://tanstack.com/query/latest) -- v5 caching, Suspense support
- [Vercel Hobby Plan Limits](https://vercel.com/docs/plans/hobby) -- 150k function invocations, 10s timeout

### Secondary (MEDIUM confidence)
- [Sairyss/domain-driven-hexagon](https://github.com/Sairyss/domain-driven-hexagon) -- DDD + Hexagonal reference architecture in TypeScript
- [kuzeofficial/next-hexagonal-architecture](https://github.com/kuzeofficial/next-hexagonal-architecture) -- Next.js hexagonal template
- [Drizzle vs Prisma (Bytebase)](https://www.bytebase.com/blog/drizzle-vs-prisma/) -- Bundle size, serverless performance comparison
- [CVE-2025-29927 Analysis](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) -- Middleware auth bypass vulnerability
- Competitor analysis: MyAnimeList, AniList, Kitsu, Yamtrack, Taiga

### Tertiary (LOW confidence)
- AniList degraded rate limit timeline -- no official ETA for restoration to 90 req/min
- Better Auth + Next.js 16 compatibility -- inferred from v15 support, not explicitly verified

---
*Research completed: 2026-03-08*
*Ready for roadmap: yes*
