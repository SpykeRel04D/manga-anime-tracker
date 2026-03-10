# Phase 1: Foundation and Design System - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffolding (Next.js 16 App Router + pnpm), Docker DX with Makefile, PostgreSQL database with Drizzle ORM, Hexagonal DDD folder structure, warm dark theme with amber accents, responsive layout, and placeholder page verifying the design system. i18n deferred to future version — English only for v1.

</domain>

<decisions>
## Implementation Decisions

### Framework and Tooling
- Next.js 16 App Router with pnpm
- TypeScript strict mode
- ESLint + Prettier config (established conventions):
  - ESLint: `next/core-web-vitals` + `next/typescript`, consistent-type-imports error, no-console error (allow warn/error), explicit-function-return-type for TS files, no-unused-vars with `_` ignore pattern
  - Prettier: single quotes, no semicolons, printWidth 90, `@trivago/prettier-plugin-sort-imports` + `prettier-plugin-tailwindcss`, arrowParens avoid
  - PostCSS: `@tailwindcss/postcss`
- shadcn/ui + Tailwind CSS for components and styling

### Theme Palette and Personality
- Primary accent: Amber/Gold (amber-500 for primary, amber-300 for soft variant)
- Background: Warm dark tones (hsl ~30deg hue, 8% lightness base, 12% for cards)
- Visual identity: Subtle anime nods — clean modern UI, the content (cover art) is the anime, the UI frames it elegantly
- Card style: Soft rounded (12-16px border-radius), subtle borders, soft shadows
- Typography: Inter font family

### Language
- English only for v1 — no i18n scaffolding, no translation keys
- Anime/manga titles always shown in original/English form (not translated)
- Requirements DSGN-03 and DSGN-04 deferred to future version

### Placeholder Page
- Mock cover image grid with 8-12 skeleton cards (shimmer/skeleton state)
- Responsive layout: 2 columns mobile, 3-4 tablet, 5-6 desktop
- Top nav bar with app name "My Anime Tracker" and placeholder links (My List, Search)
- Placeholder user avatar in nav

### Claude's Discretion
- Exact skeleton shimmer animation style
- Nav bar layout details (spacing, responsive collapse)
- Docker/Makefile implementation details
- Hexagonal DDD folder structure specifics
- Drizzle ORM schema design

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, codebase is empty

### Established Patterns
- Linting/formatting patterns from established project conventions

### Integration Points
- Vercel for production deployment
- Neon PostgreSQL for production database
- Docker PostgreSQL for local development

</code_context>

<specifics>
## Specific Ideas

- ESLint + Prettier + PostCSS config adapted from established project conventions (payload/sqlite-specific overrides removed)
- Theme inspired by warm candlelight — amber accents on dark warm backgrounds
- Cover art should be the visual star — UI is a clean frame around it

</specifics>

<deferred>
## Deferred Ideas

- i18n support (EN/ES/CA) with language selector dropdown — deferred from v1, was originally DSGN-03 and DSGN-04
- Translation keys for all UI text — deferred alongside i18n
- Language auto-detection from browser — deferred

</deferred>

---

*Phase: 01-foundation-and-design-system*
*Context gathered: 2026-03-08*
