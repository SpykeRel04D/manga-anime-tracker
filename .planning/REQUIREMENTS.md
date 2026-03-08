# Requirements: My Anime Tracker

**Defined:** 2026-03-08
**Core Value:** Quickly see where I left off on any anime or manga, and never lose track of my watching/reading progress.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh

### Search

- [ ] **SRCH-01**: User can search anime by title via AniList API with debounced input
- [ ] **SRCH-02**: User can search manga by title via AniList API with debounced input
- [ ] **SRCH-03**: Search results display cover art, title, type, airing status, and episode/chapter count

### Tracking

- [ ] **TRCK-01**: User can add an anime or manga to their personal tracking list from search results
- [ ] **TRCK-02**: User can set status for each entry (Watching, Completed, On Hold, Dropped, Plan to Watch/Read)
- [ ] **TRCK-03**: User can update current episode (anime) or chapter (manga) with increment, decrement, and direct input
- [ ] **TRCK-04**: User can rate a tracked entry on a 1-10 scale
- [ ] **TRCK-05**: User can add or edit personal notes on any tracked entry
- [ ] **TRCK-06**: User can remove an entry from their tracking list

### List UI

- [ ] **LIST-01**: User can view their tracked series as a visual grid of cover images with status badges and progress indicators
- [ ] **LIST-02**: User can filter their list by status (Watching, Completed, etc.) and type (anime/manga)
- [ ] **LIST-03**: User can sort their list by rating, title, or date added
- [ ] **LIST-04**: User can view a detail page for a tracked entry showing full metadata (synopsis, genres, studios/authors, airing status, related series)

### Design

- [ ] **DSGN-01**: App uses a warm cozy dark theme by default (warm dark tones, soft borders, amber accents)
- [ ] **DSGN-02**: App layout is responsive and mobile-first (2 columns mobile, 3-4 tablet, 5-6 desktop)
- [ ] **DSGN-03**: App supports English, Spanish, and Catalan with English as default
- [ ] **DSGN-04**: All UI text uses translation keys (no hardcoded strings)

### Infrastructure

- [ ] **INFR-01**: App deploys to Vercel free tier
- [ ] **INFR-02**: App uses Neon PostgreSQL free tier for user data
- [ ] **INFR-03**: Local development uses Docker with Makefile commands (make up, make halt, make destroy)
- [ ] **INFR-04**: Codebase follows Hexagonal DDD architecture (Domain, Application, Infrastructure, UI layers)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Tracking Enhancements

- **TRCK-07**: Quick "+1" progress increment directly from grid cards without opening detail
- **TRCK-08**: Auto-set start date when status changes to Watching/Reading
- **TRCK-09**: Auto-set end date when status changes to Completed
- **TRCK-10**: Re-watch/re-read counter for completed series

### Advanced Features

- **ADVN-01**: Local statistics dashboard (genre distribution, completion rate, entries by status)
- **ADVN-02**: Import tracking data from MAL (XML) or AniList (API)
- **ADVN-03**: PWA with offline list viewing
- **ADVN-04**: Export data as JSON/CSV

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social features (forums, reviews, activity feeds) | Single-user personal app — zero value, massive complexity |
| Internal anime/manga database | Maintaining 85k+ entries is a full-time job — use AniList API |
| Admin panel / backoffice | No users to manage, no content to moderate |
| Multiple scoring systems | 1-10 is sufficient for single user, avoids conversion headaches |
| Custom CSS/theme editor | Single user controls codebase directly |
| Recommendation engine | Requires ML/large datasets — AniList already does this |
| Auto-tracking from streaming services | Enormous integration surface, breaks constantly |
| Real-time notifications | Complex infrastructure for something streaming apps already handle |
| Mobile native app | Web-first approach, responsive design covers mobile use |
| Video streaming / content hosting | Different product category entirely, legal issues |
| Light theme | Cozy dark is the opinionated visual identity |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| SRCH-01 | — | Pending |
| SRCH-02 | — | Pending |
| SRCH-03 | — | Pending |
| TRCK-01 | — | Pending |
| TRCK-02 | — | Pending |
| TRCK-03 | — | Pending |
| TRCK-04 | — | Pending |
| TRCK-05 | — | Pending |
| TRCK-06 | — | Pending |
| LIST-01 | — | Pending |
| LIST-02 | — | Pending |
| LIST-03 | — | Pending |
| LIST-04 | — | Pending |
| DSGN-01 | — | Pending |
| DSGN-02 | — | Pending |
| DSGN-03 | — | Pending |
| DSGN-04 | — | Pending |
| INFR-01 | — | Pending |
| INFR-02 | — | Pending |
| INFR-03 | — | Pending |
| INFR-04 | — | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 0
- Unmapped: 24 ⚠️

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*
