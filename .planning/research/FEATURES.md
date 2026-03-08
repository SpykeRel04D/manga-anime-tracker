# Feature Research

**Domain:** Personal anime/manga tracking application
**Researched:** 2026-03-08
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features every anime/manga tracker has. Missing any of these makes the product feel broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Search anime/manga from external API | Core discovery mechanism; every tracker (MAL, AniList, Kitsu) has this. Without it, users cannot find content to track. | MEDIUM | AniList GraphQL API is the recommended data source. Needs debounced search, display of cover art + basic info in results. |
| Add to personal tracking list | Fundamental purpose of a tracker. Every competitor does this. | LOW | One-click add from search results. Should auto-set status to "Plan to Watch/Read". |
| Status management (Watching, Completed, On Hold, Dropped, Plan to Watch/Read) | Universal across MAL, AniList, Kitsu, Anime-Planet. These exact 5 categories are the industry standard. | LOW | Use the standard 5 statuses. Custom statuses are a differentiator, not table stakes. |
| Episode/chapter progress tracking | Users need to know "where did I leave off?" -- the core value proposition. All trackers track current episode/chapter. | LOW | Increment/decrement buttons, direct input. For manga, track chapter count (volume tracking is secondary). |
| Rating system (1-10 scale) | MAL uses 1-10, AniList offers multiple scales. A scoring mechanism is expected. | LOW | Start with 1-10 integer scale (MAL standard). AniList's multi-scale options (100-point, 5-star, smiley) are differentiators. |
| Personal notes per entry | MAL and AniList both support notes. Users write "stopped at fight scene" or "friend recommended". | LOW | Simple text field per tracked entry. No rich text needed. |
| Cover image grid/card view | Visual browsing is expected in modern trackers. AniList's card layout is the gold standard. Cover art is the primary visual identity of anime/manga. | MEDIUM | Grid of cover images with status badges, progress indicators. Responsive columns. This is a core UX requirement from PROJECT.md. |
| Filter and sort lists | Every tracker lets you filter by status and sort by rating, title, date added. Without this, large lists become unusable. | MEDIUM | Filter by: status, type (anime/manga). Sort by: rating, title, date added, last updated. |
| Dark theme | AniList has native dark mode. MAL users install "Comfortable Dark Mode" extensions. Dark mode is standard in media apps. | LOW | Default dark theme per PROJECT.md. Warm/cozy aesthetic differentiates from AniList's cooler dark palette. |
| Authentication (single-user login) | Protects personal data. Even personal apps need auth to prevent unauthorized access when deployed. | MEDIUM | Email/password auth. Single-user scope simplifies this -- no registration flow needed beyond initial setup. |
| Responsive/mobile-friendly layout | Users check their list on phones before starting a show. AniList and MAL both have mobile apps. A non-responsive web app is unusable. | MEDIUM | Mobile-first responsive design. Cover grid should collapse gracefully (2 columns on mobile, 3-4 on tablet, 5-6 on desktop). |

### Differentiators (Competitive Advantage)

Features that make this personal tracker better than just using AniList directly. Since this is a personal single-user app, the advantage is in customization, speed, and personal ownership.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Internationalization (EN/ES/CA) | AniList is English-only (community translations exist but are incomplete). MAL has a Japanese site but limited i18n. Native Catalan support is unique in this space. | MEDIUM | 3 languages from day one per PROJECT.md. Use next-intl or similar. Translation keys for all UI text, not for anime titles (those come from API in their original/romaji form). |
| Cozy/warm dark aesthetic | AniList's dark mode is cool/blue. MAL has no native dark mode. A warm, inviting theme (amber accents, soft borders, warm grays) creates emotional differentiation. | LOW | Not just "dark mode" but an intentional cozy visual identity. Warm color palette, rounded corners, generous spacing. Think "reading nook" not "dashboard". |
| Zero-cost self-owned data | Users own their data on their own database, not locked into MAL/AniList accounts. No platform risk (MAL has had ownership changes, Kitsu has had reliability issues). | LOW | Data lives in user's own Neon PostgreSQL. No vendor lock-in for tracking data. |
| Fast, minimal UI with no social clutter | AniList and MAL are cluttered with forums, reviews, social feeds, recommendations from strangers. A personal tracker strips this away for pure utility. | LOW | Deliberate simplicity. No feeds, no forums, no community features. Just your list, your progress, your notes. |
| Quick episode/chapter increment | One-tap progress update from the grid/card view without navigating to a detail page. Reduces friction for the most common action. | LOW | "+1" button visible on each card in the grid. Most trackers require clicking into an entry to update progress. |
| Start/end date tracking | AniList and MAL track when you started and finished a series. Useful for personal history. | LOW | Auto-set start date when status changes to "Watching/Reading". Auto-set end date when status changes to "Completed". Manual override available. |
| Re-watch/re-read counter | AniList tracks repeat count. Useful for tracking how many times you have revisited a favorite. | LOW | Simple integer counter. Increment when marking "Completed" on something already completed. |
| Local statistics dashboard | AniList provides genre breakdowns, hours watched, and completion charts. Having this locally gives personal insights without sharing data. | HIGH | Genre distribution, total entries by status, completion rate. Phase 2+ feature. Requires aggregating data from tracked entries + API metadata. |
| Import from MAL/AniList (XML/JSON) | Power users switching from existing trackers need to bring their data. MAL exports XML, AniList can export via API. | HIGH | Phase 2+ feature. Parse MAL XML format (industry standard export format). Map to internal data model. |
| PWA with offline list viewing | View your tracking list offline (cached). Mobile users can check what to watch next without internet. | MEDIUM | Service worker caches list data. Search requires network (API calls), but viewing your own list works offline. Future consideration. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but actively harm a personal single-user tracker.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social features (forums, reviews, activity feeds) | "AniList has it" | Massive scope increase. Requires moderation, user management, content policies. Completely opposed to single-user scope. Creates maintenance burden with zero value for a personal app. | Link out to AniList/MAL for community discussion. Keep the tracker focused on tracking. |
| Internal anime/manga database | "What if the API goes down?" | Maintaining a catalog of 23,000+ anime and 62,000+ manga is a full-time job. Data goes stale immediately. Duplicates effort of established databases. | Cache API responses locally for resilience. If AniList API has downtime, show cached data. Do not build your own catalog. |
| Multiple scoring systems (100-point, 5-star, smiley) | AniList offers this | Engineering complexity for a single user. You know your own scale. Multiple systems create conversion headaches and complicate statistics. | Stick with 1-10 integer scale. Simple, universally understood, matches MAL convention. |
| Custom CSS/theme editor | MAL allows custom list CSS | Massive surface area for bugs. CSS injection risks. Maintenance nightmare. For a single user who controls the codebase, just edit the theme directly. | The cozy warm theme IS the theme. If you want changes, modify the Tailwind config. |
| Recommendation engine | "Suggest what to watch next" | Requires ML/collaborative filtering or large dataset. AniList and MAL already do this well with millions of users of data. A single-user app cannot generate meaningful recommendations. | Link to AniList's recommendation page for a given anime. Use the API's "related" and "recommendations" fields to show what others recommend. |
| Auto-tracking via streaming services | Taiga and MAL-Sync detect what you are watching and auto-update. | Requires browser extensions, streaming service integrations, media player detection. Enormous integration surface. Breaks constantly as services change APIs. | Manual "+1" button is simple and reliable. The user clicks one button after watching an episode. |
| Real-time notifications (new episodes, airing schedule) | "Tell me when a new episode drops" | Requires background jobs, push notification infrastructure, airing schedule data sync. Complex infrastructure for something push notification services and AniList already handle. | Out of scope per PROJECT.md. Users already get notifications from Crunchyroll/streaming apps. |
| Admin panel / backoffice | "Manage users and content" | No users to manage, no content to moderate. Pure overhead for a single-user personal app. | Direct database access via Neon dashboard for any admin needs. |
| Video streaming / content hosting | "Watch anime in the app" | Illegal without licenses. Massive storage/bandwidth costs. Completely different product category. | This is a tracker, not a streaming service. Link to where the anime can be watched if that data is available from the API. |

## Feature Dependencies

```
[Search API Integration]
    |
    +--requires--> [API Client Setup]
    |
    +--enables---> [Add to Tracking List]
                       |
                       +--enables--> [Status Management]
                       |                 |
                       |                 +--enables--> [Progress Tracking (episode/chapter)]
                       |                 |
                       |                 +--enables--> [Rating]
                       |                 |
                       |                 +--enables--> [Notes]
                       |
                       +--enables--> [Cover Grid View]
                                         |
                                         +--requires--> [Filter/Sort]
                                         |
                                         +--enhances--> [Quick Progress Increment]

[Authentication]
    |
    +--required-by--> [All tracking features]

[i18n Setup]
    |
    +--should-precede--> [All UI text] (easier to add from the start than retrofit)

[Dark Theme / Design System]
    |
    +--should-precede--> [All UI components] (build components with theme from day one)

[Statistics Dashboard]
    |
    +--requires--> [Tracking List with entries]
    +--requires--> [Genre/metadata from API cached locally]

[Import from MAL/AniList]
    |
    +--requires--> [Tracking List data model finalized]
    +--requires--> [API Client (to resolve entries)]
```

### Dependency Notes

- **Authentication must come first:** Every tracking feature depends on knowing who the user is, even in single-user mode. Set up auth before any list features.
- **i18n should be scaffolded early:** Retrofitting i18n into an existing app is painful. Set up the translation infrastructure before building UI components. All UI text should go through translation keys from the start.
- **Design system before features:** The cozy warm dark theme should be established as a design system (colors, spacing, typography, component variants) before building feature UIs. Prevents inconsistency and rework.
- **API client is foundational:** Search, adding entries, and fetching metadata all depend on the API client. This should be one of the first infrastructure pieces.
- **Statistics require data:** The statistics dashboard is meaningless without tracked entries. It is a natural later-phase feature that benefits from having real usage data.
- **Import requires stable schema:** Importing from MAL/AniList requires the tracking data model to be finalized. Building import before the model is stable guarantees rework.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to replace manually tracking in a spreadsheet.

- [ ] **Authentication (email/password)** -- Protects the single user's data on a deployed app
- [ ] **Search anime/manga via AniList API** -- Core discovery, cannot track what you cannot find
- [ ] **Add to tracking list with status** -- The fundamental tracking action
- [ ] **Episode/chapter progress tracking** -- "Where did I leave off?" is the core value
- [ ] **1-10 rating** -- Quick quality assessment for personal reference
- [ ] **Personal notes** -- Context that makes tracking personal ("friend recommended", "stopped because boring")
- [ ] **Cover image grid view with status badges** -- Visual library browsing, the primary UI
- [ ] **Filter by status, sort by rating/title** -- List usability at scale
- [ ] **Dark theme (cozy/warm)** -- The visual identity, built into components from the start
- [ ] **i18n (EN/ES/CA)** -- Scaffolded from day one, all UI text through translation keys
- [ ] **Responsive layout** -- Usable on phone, tablet, and desktop

### Add After Validation (v1.x)

Features to add once core tracking is working and being used daily.

- [ ] **Quick "+1" progress increment from grid view** -- Add when daily use reveals friction in updating progress
- [ ] **Start/end date tracking** -- Add when wanting personal history data
- [ ] **Re-watch/re-read counter** -- Add when re-visiting completed series
- [ ] **Detail page with full API metadata** -- Synopsis, genres, studios, airing status, related series. Add when wanting more context about tracked entries
- [ ] **List sorting by date added / last updated** -- Add when the list grows large enough to need temporal sorting

### Future Consideration (v2+)

Features to defer until the core tracker is stable and in daily use.

- [ ] **Local statistics dashboard** -- Defer because it requires enough tracked entries to be meaningful and is a significant UI build
- [ ] **Import from MAL/AniList** -- Defer because it requires stable data model and is only needed once
- [ ] **PWA offline support** -- Defer because it adds service worker complexity and the primary use case (checking list) requires internet anyway for search
- [ ] **Export data (JSON/CSV)** -- Defer because data portability is important but not urgent for v1

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Search anime/manga (API) | HIGH | MEDIUM | P1 |
| Add to tracking list | HIGH | LOW | P1 |
| Status management (5 statuses) | HIGH | LOW | P1 |
| Episode/chapter progress | HIGH | LOW | P1 |
| Rating (1-10) | HIGH | LOW | P1 |
| Personal notes | MEDIUM | LOW | P1 |
| Cover grid view with badges | HIGH | MEDIUM | P1 |
| Filter/sort lists | HIGH | MEDIUM | P1 |
| Authentication | HIGH | MEDIUM | P1 |
| Dark cozy theme (design system) | HIGH | MEDIUM | P1 |
| i18n (EN/ES/CA) | HIGH | MEDIUM | P1 |
| Responsive layout | HIGH | MEDIUM | P1 |
| Quick "+1" from grid | MEDIUM | LOW | P2 |
| Start/end dates | LOW | LOW | P2 |
| Re-watch/re-read count | LOW | LOW | P2 |
| Detail page (full metadata) | MEDIUM | MEDIUM | P2 |
| Additional sort options | LOW | LOW | P2 |
| Statistics dashboard | MEDIUM | HIGH | P3 |
| MAL/AniList import | LOW | HIGH | P3 |
| PWA offline | LOW | MEDIUM | P3 |
| Data export | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch (the MVP)
- P2: Should have, add when daily use reveals the need
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | MyAnimeList | AniList | Kitsu | Our Approach |
|---------|-------------|---------|-------|--------------|
| List tracking | 5 statuses, 1-10 rating, tags | 5 statuses, multiple rating scales, custom lists | 5 statuses, 1-20 rating | 5 statuses, 1-10 rating, notes. Keep it simple. |
| Progress tracking | Episode/chapter count | Episode/chapter + volume count | Episode count | Episode/chapter count. No volume tracking in v1. |
| Visual library | List view (old design), some card view | Beautiful card grid, list view, both dark/light | Card grid, social feed | Cover grid as primary view. Status badges on cards. Warm dark aesthetic. |
| Search/discovery | Extensive database, seasonal charts | GraphQL API, trending, seasonal | Search + social recommendations | Search via AniList API only. No seasonal charts or trending in v1. |
| Social features | Forums, clubs, reviews, recommendations | Activity feed, following, reviews | Social timeline, reactions | None. Single-user personal app. This is a feature, not a limitation. |
| Statistics | Basic (total entries, mean score) | Rich (genre distribution, watch time, staff stats) | Basic | Local stats dashboard in v2. Genre distribution and completion rates. |
| Themes | No native dark mode (extensions exist) | Dark/light toggle, cool-toned dark | Dark theme available | Warm cozy dark as the only theme. Opinionated visual identity. |
| i18n | Japanese + English | English (community translations) | English | EN/ES/CA from launch. Rare for a tracker to support Catalan. |
| Data portability | XML export | API-based export, XML import | API access | JSON export in v2. MAL XML import in v2. |
| Mobile | Native app (iOS/Android) | Third-party apps (AniHyou, Risuto) | Native app | Responsive web. PWA consideration for v2. |
| Offline | Native apps have some offline | No native offline | Native apps have some offline | Not in v1. PWA with cached list data in v2+. |

## Sources

- [MyAnimeList - Wikipedia](https://en.wikipedia.org/wiki/MyAnimeList) - Database size, feature overview, ownership history
- [AniList](https://anilist.co/) - Feature set, scoring systems, tracking capabilities
- [AniList features thread](https://anilist.co/forum/thread/6792) - Lesser-known features, custom lists, UI options
- [AniList AlternativeTo](https://alternativeto.net/software/anilist-co/about/) - Feature comparison, user perspectives
- [Kitsu](https://kitsu.io/) - Social-first tracking, feature set
- [Kitsu Alternatives - AlternativeTo](https://alternativeto.net/software/hummingbird-me/) - Competitive landscape
- [Yamtrack - GitHub](https://github.com/FuzzyGrim/Yamtrack) - Self-hosted tracker features, data model patterns
- [Taiga](https://taiga.moe/) - Desktop tracker, auto-detection features, API comparison
- [8 Best Anime Tracking Apps (2025)](https://weebvania.com/post/best-anime-database-tracking-sites/) - Feature comparison across trackers
- [5 Best Alternatives to MyAnimeList (2025)](https://mangatime.net/articles/myanimelist-alternatives/) - Competitive analysis
- [Redesigning MyAnimeList - Medium](https://medium.com/@selemskr/redesigning-myanimelist-giving-an-outdated-app-a-fresh-new-look-9e3414efa39b) - UI/UX design patterns for trackers
- [Otaku-keep tabs on - UX Case Study](https://medium.com/design-bootcamp/ui-ux-case-study-anime-tracking-app-54a531baced3) - Anime tracker design patterns

---
*Feature research for: Personal anime/manga tracking application*
*Researched: 2026-03-08*
