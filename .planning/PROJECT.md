# My Anime Tracker

## What This Is

A personal web application for tracking anime and manga progress — which series you're watching/reading, what episode/chapter you're on, your ratings, and notes. It pulls anime/manga data from a public API (no internal catalog), so users search, find, and add series to their personal list.

## Core Value

Quickly see where I left off on any anime or manga, and never lose track of my watching/reading progress.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up and log in with email/password
- [ ] User can search anime and manga via a public API
- [ ] User can add an anime or manga to their personal tracking list
- [ ] User can set status for each entry (Watching, Completed, On Hold, Dropped, Plan to Watch/Read)
- [ ] User can update current episode (anime) or chapter (manga) progress
- [ ] User can rate a series (1-10 scale)
- [ ] User can add personal notes to any tracked entry
- [ ] User can view their tracked series as a visual grid of cover images with status badges and progress
- [ ] User can filter/sort their list by status, rating, or type (anime/manga)
- [ ] App supports English, Spanish, and Catalan (English default)
- [ ] Dark theme by default with a cozy/warm aesthetic

### Out of Scope

- Public profiles or social features — single-user app
- Internal anime/manga database — all data sourced from external API
- Admin panel / backoffice — not needed for personal use
- Real-time notifications
- Mobile native app — web-first, PWA considered for future
- Video streaming or content hosting

## Context

- **User profile**: Single user (the developer), experienced TypeScript developer
- **Data source**: Public anime/manga API (to be decided during research — candidates: AniList GraphQL, Jikan/MAL REST, Kitsu)
- **Existing code**: Some files exist in the repo but no established architecture yet
- **Deployment target**: Free-tier hosting (Vercel + Neon PostgreSQL or similar)
- **Visual direction**: Cozy/warm dark theme — warm dark tones, soft borders, comfortable feel. Cover art prominent in grid views. Anime-themed but not overwhelming.
- **Internationalization**: 3 languages (EN, ES, CA) — English default

## Constraints

- **Cost**: Must run on free tiers — Vercel for hosting, Neon (or similar) for database
- **Tech stack**: TypeScript, shadcn/ui + Tailwind CSS
- **Architecture**: Hexagonal DDD — Domain, Application, Infrastructure, UI layers
- **Local dev**: Docker-based with Makefile (make, make up, make halt, make destroy)
- **No Supabase**: User dislikes the cold-start/sleep behavior
- **Framework**: Modern React meta-framework (Next.js, Vite-based — to be decided)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hexagonal DDD architecture | User preference, clean separation of concerns | — Pending |
| Free-tier stack (Vercel + Neon) | Zero cost for personal project | — Pending |
| shadcn/ui + Tailwind | User preference, good DX with TypeScript | — Pending |
| Docker for local dev | Reproducible environment, Makefile commands | — Pending |
| No backoffice | Personal app, not needed | — Pending |
| Dark theme default (cozy/warm) | Matches anime viewing context, user preference | — Pending |

---
*Last updated: 2026-03-08 after initialization*
