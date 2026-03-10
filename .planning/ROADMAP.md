# Roadmap: My Anime Tracker

## Overview

This roadmap delivers a personal anime/manga tracking application in five phases. The build order follows dependency chains: infrastructure and design system first (so every subsequent feature uses the right architecture, theme, and i18n from the start), then authentication (user identity gates all data), then AniList API integration (content discovery before tracking), then core tracking (the reason the app exists), and finally the list UI (the primary daily interface). Each phase delivers a coherent, verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation and Design System** - Project scaffolding, Docker DX, database, Hexagonal DDD structure, warm dark theme, responsive layout, and placeholder UI (completed 2026-03-08)
- [x] **Phase 2: Authentication** - Email/password signup, login, and persistent sessions (completed 2026-03-08)
- [x] **Phase 3: Search and API Integration** - AniList GraphQL adapter with rate limiting, anime/manga search with debounced input (completed 2026-03-08)
- [x] **Phase 4: Core Tracking** - Add/remove series, status management, episode/chapter progress, ratings, and notes (completed 2026-03-09)
- [ ] **Phase 5: List UI and Browsing** - Cover image grid with status badges, filtering, sorting, and detail pages

## Phase Details

### Phase 1: Foundation and Design System
**Goal**: A working development environment with the Hexagonal DDD project structure, database, warm dark theme with amber accents, responsive placeholder page, and Docker DX -- so every subsequent phase builds on correct architecture and design foundations
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Running `make up` starts the local development environment (Docker PostgreSQL + Next.js dev server) and the app loads in the browser
  2. The app displays a placeholder page using the warm cozy dark theme (warm dark tones, soft borders, amber accents) with responsive layout that adapts from mobile to desktop
  3. English only for v1 (DSGN-03 and DSGN-04 deferred per user decision)
  4. The codebase follows the Hexagonal DDD folder structure (domain, application, infrastructure, UI layers) with at least the auth and tracking bounded contexts scaffolded
  5. The database is accessible via Drizzle ORM with initial schema migrations applied (Neon for production, Docker PostgreSQL for local)
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md -- Next.js 16 scaffolding, Docker DX with Makefile, ESLint/Prettier/PostCSS config, Vitest setup
- [x] 01-02-PLAN.md -- Hexagonal DDD folder structure, Drizzle ORM schema (users + tracking), environment-aware DB connection, infrastructure tests
- [x] 01-03-PLAN.md -- Design system: warm dark theme, shadcn/ui, nav bar, responsive skeleton grid, visual verification

### Phase 2: Authentication
**Goal**: Users can securely create an account and log in, with sessions that survive browser refresh -- gating all future tracking features behind user identity
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can create a new account with email and password from a signup page
  2. User can log in with email and password from a login page and is redirected to the main app
  3. User session persists across browser refresh and tab close/reopen without requiring re-login
  4. Unauthenticated users are redirected to the login page when trying to access protected routes
**Plans:** 2/2 plans complete

Plans:
- [x] 02-01-PLAN.md -- Better Auth setup, database schema changes (users table + auth tables), server/client config, API route handler, proxy.ts route protection, registration lock tests
- [x] 02-02-PLAN.md -- Auth UI: login page, signup page, route group restructuring, auth-aware nav bar with logout dropdown, visual verification

### Phase 3: Search and API Integration
**Goal**: Users can search for any anime or manga by title and see rich search results -- establishing the AniList API adapter with rate limiting and caching that all future features depend on
**Depends on**: Phase 2
**Requirements**: SRCH-01, SRCH-02, SRCH-03
**Success Criteria** (what must be TRUE):
  1. User can type an anime title into a search field and see matching results appear after a brief debounce (no results flash or excessive API calls)
  2. User can type a manga title into a search field and see matching results appear after a brief debounce
  3. Each search result displays the cover art, title, type (anime/manga), airing/publishing status, and episode/chapter count
  4. Search works reliably without hitting AniList rate limits during normal use (multiple searches in sequence do not cause failures)
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md -- Domain entities, ports, AniList GraphQL adapter with rate limiting, search and add-to-list use cases, comprehensive tests
- [x] 03-02-PLAN.md -- Search page UI: debounced input with URL sync, horizontal result cards, type badges, add-to-list action with toast, visual verification

### Phase 4: Core Tracking
**Goal**: Users can build and manage their personal anime/manga tracking list -- adding series, setting statuses, updating progress, rating, taking notes, and removing entries
**Depends on**: Phase 3
**Requirements**: TRCK-01, TRCK-02, TRCK-03, TRCK-04, TRCK-05, TRCK-06
**Success Criteria** (what must be TRUE):
  1. User can add an anime or manga to their tracking list directly from search results
  2. User can set and change the status of any tracked entry (Watching, Completed, On Hold, Dropped, Plan to Watch/Read)
  3. User can update current episode (anime) or chapter (manga) using increment, decrement, or direct number input
  4. User can rate any tracked entry on a 1-10 scale and edit or remove the rating
  5. User can add, edit, and view personal notes on any tracked entry
**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md -- Schema migration (lastSyncedAt), all tracking use cases (get, update-status/progress/rating/notes, remove, refresh-metadata), AniList adapter extension, comprehensive TDD tests
- [x] 04-02-PLAN.md -- Edit page UI at /tracking/[id] with auto-save (status dropdown, progress stepper, star rating, notes textarea), remove confirmation, metadata refresh, search card integration, visual verification

### Phase 5: List UI and Browsing
**Goal**: Users can visually browse, filter, sort, and inspect their tracked collection -- the cover image grid that is the primary daily interface
**Depends on**: Phase 4
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04
**Success Criteria** (what must be TRUE):
  1. User sees their tracked series as a visual grid of cover images with status badges and progress indicators, using a responsive layout (2 columns mobile, 3-4 tablet, 5-6 desktop)
  2. User can filter their list by status (Watching, Completed, On Hold, Dropped, Plan to Watch/Read) and by type (anime/manga)
  3. User can sort their list by rating, title, or date added
  4. User can click a tracked entry to view a detail page showing full metadata (synopsis, genres, studios/authors, airing status, related series)
**Plans:** 2/3 plans executed

Plans:
- [ ] 05-01-PLAN.md -- Data layer: domain entities (MediaDetails), use cases (getTrackingList, getStatusCounts, getMediaDetails), AniList adapter extension, comprehensive TDD tests
- [ ] 05-02-PLAN.md -- Home page grid: cover cards with status badges and progress bars, filter/sort toolbar with URL sync, infinite scroll, empty states, visual verification
- [ ] 05-03-PLAN.md -- Detail page: extended metadata section (synopsis, genres, studios/authors, related series), AniList data integration, visual verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Design System | 3/3 | Complete   | 2026-03-08 |
| 2. Authentication | 2/2 | Complete | 2026-03-08 |
| 3. Search and API Integration | 2/2 | Complete   | 2026-03-08 |
| 4. Core Tracking | 2/2 | Complete | 2026-03-09 |
| 5. List UI and Browsing | 2/3 | In Progress|  |
