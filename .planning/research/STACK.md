# Stack Research

**Domain:** Personal anime/manga tracking web application
**Researched:** 2026-03-08
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.x | React meta-framework | Greenfield project with no migration risk. Turbopack is now stable and default for dev and production builds (2-5x faster builds). Deployed to Vercel with zero config. App Router is the default. TypeScript-first. Node.js 20.9+ required. |
| TypeScript | 5.7+ | Type safety | Required by project constraints. Next.js 16 requires TypeScript 5.1+ minimum. Use latest stable for best inference and performance. |
| Tailwind CSS | 4.2.x | Utility-first CSS | Required by project constraints (shadcn/ui dependency). v4 is a full rewrite: CSS-first config (no tailwind.config.js), 5x faster full builds, 100x faster incremental builds. |
| shadcn/ui | CLI v4 | Component library (copy-paste, not dependency) | Required by project constraints. CLI v4 (March 2026) uses unified `radix-ui` package, supports Tailwind v4 natively, and provides design system presets. Not a versioned npm package -- components are copied into your codebase. |
| React | 19.x | UI rendering | Bundled with Next.js 16. React 19 includes Server Components, Server Actions, `use()` hook, and improved Suspense. |

### Database and ORM

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Neon PostgreSQL | Free tier | Managed serverless PostgreSQL | Required by project constraints. Free tier: 0.5 GB storage, 100 CU-hours/month, 5 GB egress. More than sufficient for a single-user tracker. No cold-start issues unlike Supabase (user explicitly rejected Supabase). |
| Drizzle ORM | 0.45.x | TypeScript ORM | Best fit for Neon serverless: ~7.4 KB bundle, zero cold-start overhead, native neon-http driver support. Code-first schemas in TypeScript (no separate schema language or generation step). SQL-like query builder maps directly to SQL. Aligns with hexagonal architecture -- the ORM is an infrastructure concern, not a domain concern. |
| Drizzle Kit | 0.45.x | Schema migrations | Companion tool for Drizzle ORM. Generates SQL migration files from schema changes. `drizzle-kit push` for dev, `drizzle-kit generate` + `drizzle-kit migrate` for production. |
| @neondatabase/serverless | 1.0.x | Neon HTTP driver | Official Neon serverless driver. Used by Drizzle's `neon-http` adapter for optimal serverless performance on Vercel. HTTP is faster than WebSocket for single, non-interactive transactions (which covers most read operations in this app). |

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | 1.5.x | Authentication framework | Stable 1.x release (not perpetual beta like Auth.js v5). First-class Drizzle adapter. Built-in email/password credentials with no workarounds needed. TypeScript-native. Plugin architecture for future needs (2FA, etc.). Auth.js v5 has been in beta for years and was recently handed to the Better Auth team anyway -- go directly to the source. |

### Internationalization

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| next-intl | 4.8.x | i18n for Next.js App Router | Purpose-built for App Router and Server Components. ~2 KB bundle. Native `getTranslations()` for Server Components (zero client JS for translated content). Handles translations, date/number formatting, and internationalized routing. next-i18next is NOT compatible with App Router. |

### External Data

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| AniList GraphQL API | v2 | Anime/manga data source | GraphQL allows fetching exactly the fields needed (covers, titles, episodes, chapters, scores). 500k+ entries. 90 requests/minute rate limit is generous for a single-user app. No authentication required for public data queries. The AniList website itself runs on this API, so feature parity is guaranteed. Endpoint: `https://graphql.anilist.co` |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| radix-ui | latest | Accessible headless UI primitives | Always -- shadcn/ui components are built on Radix primitives. Since Feb 2026, use the unified `radix-ui` package instead of individual `@radix-ui/react-*` packages. |
| lucide-react | 0.577.x | Icon library | Always -- shadcn/ui's default icon library. 1500+ icons. Tree-shakeable. |
| next-themes | 0.4.x | Theme management (dark/light) | Always -- shadcn/ui's recommended approach for dark mode. Handles SSR hydration, system preference detection, and theme persistence with no flash of unstyled content. |
| react-hook-form | 7.71.x | Form state management | For all forms -- login, registration, search, notes, ratings. Uncontrolled components for performance. Minimal re-renders. |
| @hookform/resolvers | 5.2.x | Form validation bridge | Always with react-hook-form. Connects Zod schemas to form validation. Auto-detects Zod v3 and v4. |
| zod | 4.3.x | Schema validation | For all validation -- form inputs, API responses, environment variables. TypeScript-first with static type inference. Use for domain value objects in hexagonal architecture. |
| clsx | 2.x | Conditional class names | Always -- used by shadcn/ui's `cn()` utility function. |
| tailwind-merge | 3.x | Tailwind class conflict resolution | Always -- used by shadcn/ui's `cn()` utility function. Prevents conflicting Tailwind classes. |
| @tanstack/react-query | 5.90.x | Server state management | For AniList API calls. Handles caching, deduplication, background refetching, and stale-while-revalidate. ~20% smaller than v4. Suspense support for streaming SSR. NOT needed for database queries (use Server Components + Server Actions instead). |
| graphql-request | 7.x | Lightweight GraphQL client | For AniList API calls. Minimal GraphQL client (~5 KB). No need for Apollo's complexity for a single external API. Pairs well with TanStack Query for caching. |
| bcryptjs | 3.x | Password hashing | For credential authentication. Pure JavaScript (no native bindings), works in all environments including Edge. Used by Better Auth internally but may be needed for custom password validation logic. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Docker + Docker Compose | Local dev environment | PostgreSQL container for local development. Makefile wraps Docker commands: `make`, `make up`, `make halt`, `make destroy`. Next.js runs on host (not in container) for fast HMR. |
| ESLint 9 | Linting (flat config) | Next.js 16 removed `next lint` -- use ESLint directly. Flat config format (`eslint.config.mjs`). Use `eslint-config-next/core-web-vitals`. |
| Prettier | Code formatting | Separate from ESLint (ESLint for logic errors, Prettier for formatting). Use `prettier-plugin-tailwindcss` for automatic class sorting. |
| drizzle-kit | Database migrations | Part of Drizzle ecosystem. `drizzle-kit push` for rapid local dev, `drizzle-kit generate` for production migration files. |
| Vitest | Unit/integration testing | Vite-native test runner. Fast. Compatible with React Testing Library. Preferred over Jest for Vite/Turbopack projects. |
| @testing-library/react | Component testing | Standard for testing React components. Test behavior, not implementation. |

## Installation

```bash
# Core framework
npm install next@latest react@latest react-dom@latest

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install better-auth

# UI (shadcn components are added via CLI, not npm)
npm install radix-ui lucide-react next-themes clsx tailwind-merge
npx shadcn@latest init

# Forms and validation
npm install react-hook-form @hookform/resolvers zod

# i18n
npm install next-intl

# Data fetching
npm install @tanstack/react-query graphql-request

# Dev dependencies
npm install -D typescript @types/react @types/react-dom
npm install -D eslint eslint-config-next @eslint/js
npm install -D prettier prettier-plugin-tailwindcss
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D dotenv
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Next.js 15 (LTS) | If you need maximum ecosystem stability. Next.js 15 is still supported. However, for a greenfield personal project, 16 is the right call -- Turbopack perf gains are significant and Vercel deploys it natively. |
| Drizzle ORM | Prisma 7 | If you prefer schema-first development with a separate `.prisma` file and generated client. Prisma 7 removed the Rust engine (now pure TypeScript), improving edge deployment. However, Drizzle's code-first approach, smaller bundle, and native Neon driver make it better for serverless. |
| Better Auth | Auth.js v5 (next-auth@beta) | Only if you need OAuth providers immediately. Auth.js v5 has been beta for years and was recently transferred to the Better Auth team. Better Auth is already stable at 1.5.x with superior credentials support. |
| AniList GraphQL | Jikan REST (MyAnimeList) | If you specifically want MyAnimeList data. Jikan is an unofficial MAL wrapper -- it can break when MAL changes. AniList is the official API for its platform, and GraphQL lets you request exactly the fields you need (no over-fetching). |
| AniList GraphQL | Kitsu API | If you need a REST API with JSON:API spec. Kitsu's database is smaller than AniList's and the platform has less active development. |
| graphql-request | Apollo Client | If you need normalized caching, local state management, or complex cache policies. Apollo is ~50 KB vs graphql-request's ~5 KB. Massive overkill for a single external API. |
| next-intl | react-i18next | Never for App Router projects. react-i18next/next-i18next was built for Pages Router and requires workarounds for Server Components. |
| Vitest | Jest | If you have existing Jest config to maintain. For greenfield, Vitest is faster and has native ESM/TypeScript support. |
| react-hook-form | Formik | Never in 2026. Formik's development has stalled. react-hook-form has better performance (uncontrolled components), smaller bundle, and active maintenance. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Supabase | User explicitly rejected it. Cold-start/sleep behavior on free tier breaks the always-available UX expected of a personal tracker. | Neon PostgreSQL (always-on compute within free tier limits) |
| next-i18next | NOT compatible with Next.js App Router. Built for Pages Router only. | next-intl (purpose-built for App Router) |
| Apollo Client | 50+ KB bundle, complex normalized cache, local state management -- all unnecessary for fetching from a single external API. | graphql-request + TanStack Query |
| Formik | Effectively abandoned. Last major release was 2022. Uses controlled components (causes re-renders on every keystroke). | react-hook-form |
| NextAuth v4 (next-auth@latest) | Legacy version. No App Router support. Will not receive new features. | Better Auth 1.5.x |
| Individual @radix-ui/react-* packages | Deprecated pattern as of Feb 2026. shadcn/ui now uses unified `radix-ui` package. | `radix-ui` (unified package) |
| tailwind.config.js | Tailwind v4 uses CSS-first configuration. The JS config file is a v3 pattern. | `@theme` directive in your CSS file |
| .eslintrc.* files | Deprecated in ESLint 9. Will be removed in ESLint 10. Next.js 16 expects flat config. | `eslint.config.mjs` (flat config) |
| Mongoose / MongoDB | Relational data (user has many tracked entries, each linked to an anime/manga) is a natural fit for PostgreSQL. MongoDB would require manual join logic and denormalization. | Drizzle ORM + Neon PostgreSQL |
| Zustand / Redux | Not needed. Server state is handled by TanStack Query. UI state is minimal (theme, filters) and can live in URL params or React context. Adding a global state library adds complexity without benefit for this scope. | URL search params + React context where needed |

## Stack Patterns by Variant

**For local development (Docker):**
- Use standard PostgreSQL 16 in Docker container (not Neon-specific)
- Connect Drizzle via standard `postgres` driver (node-postgres) or use `@neondatabase/serverless` in local mode
- Makefile wraps Docker Compose commands
- Next.js runs on host machine (not containerized) for fast Turbopack HMR

**For production (Vercel + Neon):**
- Use `@neondatabase/serverless` with neon-http driver for optimal serverless performance
- Environment variable `DATABASE_URL` switches between local PostgreSQL and Neon connection string
- Drizzle migrations run via CI/CD or manual `drizzle-kit migrate`

**For AniList API calls:**
- Use `graphql-request` as the transport layer
- Wrap in TanStack Query for caching, deduplication, and background refetch
- Server-side: Call directly in Server Components for initial page load (no TanStack Query needed)
- Client-side: Use TanStack Query for search-as-you-type and interactive updates

**For forms (login, register, add notes, rate):**
- Define Zod schema (reusable in domain layer for hexagonal architecture)
- Connect to react-hook-form via `@hookform/resolvers`
- Use shadcn/ui form components (built on react-hook-form)
- Server Actions for form submission (no API routes needed)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1.x | React 19.x | Bundled together. Do not install React separately at a different major version. |
| Next.js 16.1.x | TypeScript 5.1+ | Minimum requirement. Use 5.7+ for best experience. |
| Next.js 16.1.x | Node.js 20.9+ | Node.js 18 support was dropped in Next.js 16. |
| Tailwind CSS 4.2.x | PostCSS 8.x | Tailwind v4 uses a new PostCSS plugin (`@tailwindcss/postcss`). |
| shadcn/ui CLI v4 | Tailwind CSS 4.x | shadcn/ui v4 supports both Tailwind v3 and v4, but new projects should use v4. |
| shadcn/ui CLI v4 | radix-ui (unified) | Feb 2026 update. New-york style uses unified package. |
| Drizzle ORM 0.45.x | @neondatabase/serverless 1.0.x | Native integration via `drizzle-orm/neon-http`. |
| Drizzle ORM 0.45.x | Drizzle Kit 0.45.x | Must match major/minor versions. |
| Better Auth 1.5.x | Drizzle ORM 0.45.x | Via `@better-auth/drizzle-adapter` 1.5.x. |
| react-hook-form 7.71.x | @hookform/resolvers 5.2.x | Resolvers 5.x is designed for RHF 7.x. |
| @hookform/resolvers 5.2.x | Zod 4.3.x | Auto-detects Zod v3 and v4 at runtime. |
| next-intl 4.8.x | Next.js 14-16 | Supports App Router in Next.js 14+. |
| @tanstack/react-query 5.90.x | React 18-19 | Works with both React 18 and 19. |

## Neon Free Tier Budget Analysis

For a single-user anime/manga tracker:

| Resource | Limit | Expected Usage | Headroom |
|----------|-------|----------------|----------|
| Storage | 0.5 GB | ~50 MB (user data, tracked entries, notes) | Abundant |
| Compute | 100 CU-hours/month | ~10-20 CU-hours (light personal use) | Comfortable |
| Egress | 5 GB/month | < 1 GB (small JSON payloads) | Abundant |
| Projects | 20 | 1 | Abundant |

The free tier is more than adequate for this use case. The app stores only tracking metadata (status, progress, ratings, notes) and references to AniList IDs -- actual anime/manga data (covers, descriptions) is fetched from AniList on demand.

## Sources

- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) -- Turbopack stability, breaking changes, Node.js requirements (HIGH confidence)
- [Next.js 16.1 Blog Post](https://nextjs.org/blog/next-16-1) -- Latest stable release details (HIGH confidence)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- ESLint changes, migration path (HIGH confidence)
- [shadcn/ui Changelog - CLI v4](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) -- Latest shadcn CLI features (HIGH confidence)
- [shadcn/ui Changelog - Unified Radix](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) -- Radix unified package migration (HIGH confidence)
- [Tailwind CSS v4.0 Blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, performance improvements (HIGH confidence)
- [Drizzle ORM - Neon Setup](https://orm.drizzle.team/docs/connect-neon) -- Native Neon driver integration (HIGH confidence)
- [Neon Pricing](https://neon.com/pricing) -- Free tier limits and constraints (HIGH confidence)
- [AniList API Docs](https://docs.anilist.co/) -- Rate limits, GraphQL endpoint, data model (HIGH confidence)
- [AniList Rate Limiting](https://docs.anilist.co/guide/rate-limiting) -- 90 req/min limit (HIGH confidence)
- [next-intl Docs](https://next-intl.dev/) -- App Router integration, Server Component support (HIGH confidence)
- [Better Auth Docs](https://better-auth.com/) -- Installation, Drizzle adapter, credentials auth (HIGH confidence)
- [Better Auth Drizzle Adapter](https://better-auth.com/docs/adapters/drizzle) -- Adapter setup and compatibility (HIGH confidence)
- [Drizzle vs Prisma Comparison (Bytebase)](https://www.bytebase.com/blog/drizzle-vs-prisma/) -- Bundle size, serverless performance (MEDIUM confidence)
- [TanStack Query Docs](https://tanstack.com/query/latest) -- v5 features, Suspense support (HIGH confidence)
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) -- Version verification (HIGH confidence)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes) -- Dark mode implementation (HIGH confidence)
- [shadcn/ui Dark Mode Guide](https://ui.shadcn.com/docs/dark-mode/next) -- next-themes integration (HIGH confidence)

---
*Stack research for: Personal anime/manga tracking web application*
*Researched: 2026-03-08*
