# Pitfalls Research

**Domain:** Personal anime/manga tracking web app (external API, free-tier hosting, hexagonal DDD)
**Researched:** 2026-03-08
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: AniList API Rate Limit Cascade Failure

**What goes wrong:**
The AniList API is currently in a degraded state, limited to 30 requests per minute (normally 90 req/min). A burst limiter also throttles rapid-fire requests. Exceeding either limit triggers a 1-minute timeout on ALL requests -- not just the excess ones. A search-heavy UI that fires requests on keystroke or loads multiple related entities (sequels, prequels, characters) per page can exhaust the budget in seconds, locking the app out for a full minute. Users see empty results and assume the app is broken.

**Why it happens:**
Developers treat the external API like a local database -- fire a request for every UI interaction. GraphQL's flexibility encourages fetching exactly what you need per component, which means many small requests instead of fewer batched ones. During development with low traffic this never surfaces. It hits hard when a user rapidly searches, browses, or navigates between detail pages.

**How to avoid:**
1. Implement a client-side request queue with token bucket rate limiting (max 25 req/min to stay safely under the 30 req/min degraded limit).
2. Debounce search input (300-500ms minimum) so typing "Naruto" doesn't fire 6 requests.
3. Use GraphQL query batching -- request all related data (media + characters + relations) in a single query rather than separate requests.
4. Cache API responses aggressively in your database. Anime metadata rarely changes -- cache for 7 days minimum. Only user-specific data (progress, ratings) lives in your DB already.
5. Monitor `X-RateLimit-Remaining` response headers and back off proactively before hitting zero.

**Warning signs:**
- HTTP 429 errors in dev logs.
- Search feels "laggy" because requests are queued.
- Detail pages load partially (some data arrives, some gets rate-limited).

**Phase to address:**
Phase 1 (Foundation/Infrastructure). The API adapter must include rate limiting and caching from day one. Retrofitting rate limiting into an app with scattered API calls is painful.

---

### Pitfall 2: Hexagonal DDD Over-Engineering for a CRUD-Dominant App

**What goes wrong:**
The project is fundamentally a personal tracker: add entries, update progress, filter lists. About 80% of operations are straightforward CRUD with minimal business logic. Full hexagonal DDD -- value objects for every primitive, separate domain models from persistence models, ports/adapters for every boundary, repository abstractions for a single database -- creates 3-5x more files than necessary. A simple "update episode progress" operation flows through UseCase -> Port -> Adapter -> Repository -> Mapper -> Entity -> back up the chain. Development grinds to a halt under boilerplate.

**Why it happens:**
Architecture is chosen at project start when enthusiasm is high and the domain seems complex. "Track anime with statuses, ratings, notes, and progress" sounds like it has business logic. In practice, most operations are: read from DB, update a field, write to DB. The DDD tax (value objects, aggregates, domain events) adds complexity without proportional benefit for this domain.

**How to avoid:**
Apply "Lite Hexagonal" -- use the boundaries without the ceremony:
1. **Keep the layer separation** (domain/application/infrastructure/UI) but skip value objects for primitives. A `rating: number` with validation in the entity is fine -- no `Rating` value object needed.
2. **Skip repository abstractions** if there's only one database. Use the ORM directly in the infrastructure layer. Abstract only when you have a real second implementation (e.g., the external API adapter).
3. **Domain models = Persistence models** for simple entities. Only separate them when the domain shape genuinely differs from the DB schema.
4. **Use cases are useful** -- keep them as the orchestration layer. But a use case that does nothing but call one repository method should be inlined.
5. **Reserve full DDD** for the one genuinely complex area: the API integration layer (rate limiting, caching, data transformation). That's where ports/adapters earn their keep.

**Warning signs:**
- Adding a simple field (e.g., "notes") requires touching 6+ files.
- Use cases that are one-line pass-throughs to repositories.
- Spending more time on architecture than features.
- Mapper classes that copy fields 1:1 between identical shapes.

**Phase to address:**
Phase 1 (Project Setup/Architecture). Decide on "Lite Hexagonal" boundaries before writing code. Document which patterns apply where. Revisit if business logic grows.

---

### Pitfall 3: Neon Free Tier Compute Exhaustion and Silent Suspension

**What goes wrong:**
Neon's free tier provides 100 CU-hours/month per project. A 0.25 CU instance runs for ~400 hours/month -- sounds generous until you realize that's about 13 hours/day. If the compute stays awake continuously (e.g., due to background jobs, health checks, or ORM connection keep-alive), you burn through compute hours faster than expected. When exhausted, Neon doesn't error gracefully -- **it suspends compute until the next billing cycle**. Your entire app goes down silently mid-month.

Additionally, cold starts (300-500ms, up to several seconds after prolonged inactivity) stack with Vercel's own cold starts, creating a "double cold start" problem where the first request after inactivity can take 3-5 seconds.

**Why it happens:**
Developers don't monitor CU-hour consumption. The auto-suspend feature (scales to zero after 5 minutes of inactivity) is the saving grace, but connection poolers or ORMs that keep connections alive can prevent suspension. Also, during development with Docker running Postgres locally, you never experience the production cold start behavior.

**How to avoid:**
1. Use Neon's pooled connection string (`-pooler` endpoint) -- PgBouncer in transaction mode masks cold starts and properly releases connections.
2. Configure your ORM/connection to NOT keep connections alive. No connection pool warming, no keepalive pings.
3. Let auto-suspend work -- the 5-minute inactivity timeout is your friend for a personal project with intermittent usage.
4. Storage limit is 0.5 GB per project. Cache anime metadata selectively -- don't dump the entire AniList catalog. Only cache entries the user has interacted with.
5. Monitor compute usage in the Neon dashboard weekly during the first month.

**Warning signs:**
- Database connection times increasing over the month.
- Neon dashboard showing higher-than-expected CU-hour consumption.
- "Connection refused" errors mid-month with no code changes.

**Phase to address:**
Phase 1 (Infrastructure setup) for connection configuration. Phase 2+ for monitoring and tuning. The Docker local dev should include documentation about production database behavior differences.

---

### Pitfall 4: Docker on macOS File System Performance Destroying DX

**What goes wrong:**
Docker volume mounts on macOS use a virtualization layer (VirtioFS or gRPC-FUSE) to share files between the host and container. For a Next.js project with thousands of files in `node_modules`, this creates severe performance issues: hot reload takes 5-10 seconds instead of instant, `npm install` takes 3-5x longer, and the dev server startup is painfully slow. Developers abandon Docker and run natively, defeating the purpose of the reproducible environment.

**Why it happens:**
macOS doesn't run Docker natively -- it uses a Linux VM. Every file system operation crosses the VM boundary. Next.js's file watcher (Watchpack) can't detect changes via native FS events through the virtualization layer, requiring polling (`WATCHPACK_POLLING=true`), which is CPU-intensive and still slower than native.

**How to avoid:**
1. **Named volumes for `node_modules`** -- never mount `node_modules` from host. Use a Docker named volume so `node_modules` lives inside the container's native filesystem.
2. **Named volume for `.next`** -- the build cache directory gets massive reads/writes during HMR. Keep it container-native.
3. **Only mount `src/` and config files** from the host, not the entire project root.
4. Set `WATCHPACK_POLLING=true` in docker-compose environment.
5. Consider making Docker optional for the app (required only for Postgres) -- run Next.js natively on the host, only containerize the database. This is a pragmatic compromise for a single-developer project.

**Warning signs:**
- Hot reload taking more than 2 seconds consistently.
- High CPU usage from Docker Desktop.
- Developer reflexively running `npm run dev` outside Docker.

**Phase to address:**
Phase 1 (Docker/Makefile setup). Get this right before any feature development. A bad Docker DX poisons the entire project experience.

---

### Pitfall 5: next-intl Silently Opting Into Dynamic Rendering

**What goes wrong:**
next-intl with the App Router opts pages into dynamic rendering by default when `useTranslations` is used in Server Components. For a personal tracker app, this means every page is server-rendered on each request instead of being statically generated or cached. Combined with Vercel's 150k function invocations/month limit on the free tier and Neon cold starts, this creates unnecessary latency and risks hitting free tier limits.

**Why it happens:**
next-intl needs to resolve the locale from the request, which requires dynamic context (cookies, headers). Without explicit configuration, Next.js can't statically render these pages. Developers add translations, pages work fine in dev, and only notice the dynamic rendering when checking Vercel build output or experiencing slow page loads in production.

**How to avoid:**
1. Call `setRequestLocale(locale)` in every layout and page component that uses translations -- this enables static rendering for known locales.
2. Export `generateStaticParams` returning all supported locales (`['en', 'es', 'ca']`) from your `[locale]` layout.
3. Pass `locale`, `now`, and `timeZone` explicitly to `NextIntlClientProvider` instead of relying on dynamic resolution.
4. Check the Next.js build output (`next build`) for "Dynamic" vs "Static" indicators on each route.

**Warning signs:**
- Build output shows all routes as "Dynamic" (lambda icon).
- Pages feel slower than expected for static content.
- Vercel function invocation count climbing faster than page views.

**Phase to address:**
Phase where i18n is introduced. Must be configured correctly from the first i18n integration -- retrofitting static rendering after building all pages dynamically is a full audit of every layout and page.

---

### Pitfall 6: Stale Cached Anime Data Creating User Confusion

**What goes wrong:**
You cache anime/manga metadata from AniList to avoid rate limits (Pitfall 1). But anime data changes: airing schedules update, episode counts change mid-season, cover images get updated, new seasons are announced. If you cache for 7 days and an anime starts airing this week, the user sees stale episode counts and outdated status. Worse: if you store episode count as "12" when cached but it becomes "24" (split cour announcement), the user's progress tracking breaks -- they think they finished the show at ep 12.

**Why it happens:**
Developers implement caching as a simple TTL without considering that different data has different freshness requirements. Metadata for a 2005 completed anime can be cached forever. Metadata for a currently-airing show needs refreshing every few hours.

**How to avoid:**
1. **Tiered caching strategy:**
   - Completed/old anime: 30-day cache TTL
   - Currently airing: 6-hour cache TTL
   - User-initiated refresh: "Refresh" button on detail pages to force re-fetch
2. Store `status` (RELEASING, FINISHED, NOT_YET_RELEASED) from AniList and use it to determine cache TTL.
3. Store the `lastFetchedAt` timestamp with cached data so you can audit staleness.
4. Never cache user progress/ratings in the API cache -- that's your domain data in your database.

**Warning signs:**
- Episode counts in the UI don't match AniList.
- Users can set progress beyond the cached episode count.
- "Last updated" timestamps showing data from weeks ago for airing shows.

**Phase to address:**
Phase where API integration is built. The caching strategy must be defined alongside the API adapter, not bolted on later.

---

### Pitfall 7: Authentication Middleware as the Sole Security Layer

**What goes wrong:**
Next.js middleware (running at the edge) handles route protection: redirect unauthenticated users to login. Developers treat this as sufficient security. But middleware can be bypassed -- notably CVE-2025-29927 demonstrated that middleware-only auth in Next.js was exploitable. Even without CVEs, server actions, API routes, and data fetching functions that don't independently verify the session are vulnerable.

**Why it happens:**
Middleware-based auth feels complete: unauthorized users get redirected, protected pages render correctly. It's the approach shown in many tutorials. The mental model is "middleware guards the door, everything inside is safe." But server actions and API routes are separate entry points that middleware doesn't always protect consistently.

**How to avoid:**
1. Verify authentication at every data access point, not just at the route level. Use React's `cache()` to memoize the auth check within a single render so it's cheap to call everywhere.
2. Use NextAuth.js v5's `auth()` function in server components, server actions, and API routes independently.
3. Middleware handles redirects for UX (send unauthed users to login). Data access layer handles security (reject unauthorized data requests).
4. Update Next.js to 15.2.3+ to patch CVE-2025-29927.

**Warning signs:**
- Server actions that don't check session before modifying data.
- API routes accessible without auth headers.
- Auth check exists only in middleware.ts and nowhere else.

**Phase to address:**
Phase where authentication is implemented. Must be part of the auth architecture from day one.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skipping API response caching | Simpler code, always fresh data | Rate limit exhaustion, app lockouts, slow pages | Never -- implement basic caching from the start |
| Storing raw AniList response JSON in DB | Fast to implement, no mapper needed | Schema coupling to external API, painful migrations when AniList changes response shape | MVP only -- replace with mapped domain models before adding features |
| Hardcoding English strings, adding i18n later | Faster initial development | Extracting strings from 50+ components is tedious and error-prone | Acceptable for Phase 1 if i18n is Phase 2, but use a pattern (constants/keys) from the start |
| Single CSS theme without design tokens | Quick UI development | Theme changes require find-and-replace across all components | Never with shadcn/ui -- it already uses CSS variables. Use them from day one |
| Skipping loading/error states for API calls | Faster UI prototyping | Jarring UX when API is slow or rate-limited (which it will be) | Never -- skeleton loaders are table stakes for external API apps |
| One massive GraphQL query per page | Fewer requests (helps rate limiting) | Over-fetching data, slow initial page loads, wasted bandwidth | Acceptable if you carefully select only needed fields |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| AniList GraphQL API | Querying separate endpoints for related data (media + relations + characters as 3 requests) | Use GraphQL's nested queries to fetch all related data in a single request |
| AniList GraphQL API | Not handling the `isAdult` flag -- Apple/Google stores reject apps with unfiltered NSFW content | Filter `isAdult: true` content at the API query level AND in the UI layer as defense-in-depth |
| AniList GraphQL API | Assuming stable API availability -- AniList may temporarily suspend access during outages | Build graceful degradation: show cached data with a "data may be outdated" banner when API is unreachable |
| Neon PostgreSQL | Using the direct connection string instead of the pooled one | Always use the `-pooler` connection string to get PgBouncer transaction pooling. Direct connections face cold starts and connection limits |
| Neon PostgreSQL | Running migrations with the pooled connection | Use the direct (non-pooled) connection for migrations since PgBouncer in transaction mode doesn't support DDL well. Keep both connection strings in env vars |
| NextAuth.js v5 | Storing sessions in JWT without database backing | For a personal app JWT is fine, but include `userId` in the token so server components can query user-specific data without an extra DB lookup |
| shadcn/ui + Tailwind | Using HSL color values without the `hsl()` wrapper in Tailwind v4 | Tailwind CSS v4 requires `hsl()`, `oklch()`, or `rgb()` wrappers around color variable values |
| Docker + Next.js | Mounting the entire project directory as a bind mount | Mount only source files. Use named volumes for `node_modules` and `.next` to avoid macOS FS performance penalty |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Double cold start (Vercel + Neon) | First request after inactivity takes 3-5 seconds | Use Neon pooled connection; accept the tradeoff for free tier -- add loading UI | Every session start after ~5-10 min inactivity |
| Unbounded search result rendering | UI freezes when rendering 50+ anime cards with cover images | Paginate results (max 20 per page); use `loading="lazy"` on images; virtual scroll for long lists | When users search broad terms like "dragon" returning 100+ results |
| Full anime detail fetch on list view | List page takes 3+ seconds to load because each card fetches full details | Fetch only list-level fields (title, cover, status, progress). Fetch full details only on detail page navigation | When user has 30+ tracked anime |
| Unoptimized cover images | Page loads megabytes of full-resolution cover images from AniList CDN | Use AniList's `large` (265x375) image variant for cards, not `extraLarge`. Use Next.js `<Image>` for automatic optimization and lazy loading | When user has 20+ entries on a single page |
| Translations bundle loaded entirely on client | Bundle size grows with each language added (EN + ES + CA = 3x translation files) | Use next-intl's Server Component rendering (translations stay server-side). Only send active locale's client-side translations | Noticeable with 3+ languages and 100+ translation keys |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing AniList API tokens in client-side code | Token theft, quota abuse under your account | All AniList API calls go through server-side routes/actions only. Never import API keys in client components |
| Middleware-only authentication (CVE-2025-29927) | Complete auth bypass, unauthorized data access | Verify auth at every data access point. Update Next.js to 15.2.3+ |
| No rate limiting on auth endpoints | Brute force login attacks | Add rate limiting (e.g., 5 attempts per minute per IP) on login/signup server actions |
| Storing plain text passwords | Account compromise if DB is leaked | Use bcrypt/argon2 via NextAuth.js credential provider. Never roll your own password storage |
| CSRF on server actions | Unauthorized state mutations via cross-site requests | Next.js server actions include CSRF protection by default, but verify it's not disabled. Use SameSite cookies |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No offline/cached state when API is down | App shows empty pages, user thinks their data is lost | Always render user's tracked list from local DB. Show "some details may be outdated" when API is unreachable |
| Forcing language selection before any content | Friction on first visit, especially for a personal app | Auto-detect from browser `Accept-Language` header, default to English. Allow changing in settings -- no modal on first visit |
| No skeleton loaders during API fetches | UI feels broken/slow, especially during cold starts | Show skeleton cards matching the grid layout while data loads |
| Losing progress context when navigating | User updates episode on detail page, goes back to list, doesn't see the update | Use optimistic updates or revalidate the list route after mutations |
| No confirmation before status changes | Accidentally marking a show "Completed" or "Dropped" | Use confirmation for destructive status changes (Dropped). Allow quick-update without confirmation for episode progress increment |
| Cover image grid with no fallback | Broken image icons when AniList CDN is slow or an anime has no cover | Provide a themed placeholder image. Use `onError` handler to swap to fallback |

## "Looks Done But Isn't" Checklist

- [ ] **Search:** Debounce implemented AND empty state for no results AND loading state during fetch -- not just the results grid
- [ ] **Tracking list:** Sorting persisted across sessions (URL params or localStorage) -- not just in React state that resets on refresh
- [ ] **Progress update:** Validates against total episode/chapter count AND handles "unknown total" (ongoing manga) gracefully
- [ ] **i18n:** All user-facing strings translated including error messages, empty states, form validation, and metadata (page titles). Not just the happy path
- [ ] **Auth:** Session expiry handling -- what happens when the token expires mid-session? Redirect to login, not a white screen of death
- [ ] **API errors:** Graceful handling for 429 (rate limit), 500 (AniList down), and network timeouts -- not just success responses
- [ ] **Dark theme:** Tested on components with focus states, disabled states, and form validation error states -- not just default/hover
- [ ] **Mobile responsive:** Grid layout tested at 320px width (small phones) -- cover images and text don't overflow
- [ ] **Database:** Migrations work against Neon production (via direct connection string), not just local Docker Postgres

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Rate limit exhaustion (app locked out) | LOW | Wait 1 minute. Implement request queue and caching to prevent recurrence |
| Over-engineered DDD causing slow development | MEDIUM | Identify pure-CRUD entities, flatten their layer stack, keep hexagonal only for complex boundaries (API adapter). ~1-2 day refactor |
| Neon compute exhaustion mid-month | HIGH | No recovery on free tier until billing cycle resets. Upgrade to Launch plan ($19/mo) as emergency fix. Prevent by monitoring CU-hours weekly |
| Dynamic rendering on all pages | MEDIUM | Audit every page/layout for `setRequestLocale` call and `generateStaticParams` export. ~1 day refactor, but must test every route |
| Stale cached anime data | LOW | Add `lastFetchedAt` column, run a one-time cache invalidation, implement tiered TTL. ~half-day fix |
| Docker DX problems | LOW | Switch to hybrid: Dockerize only Postgres, run Next.js natively. Update Makefile commands. ~1 hour |
| Auth bypass via middleware-only | MEDIUM | Add auth checks to all server actions and data access functions. Audit every mutation endpoint. ~1 day |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| API rate limit cascade | Phase 1: Infrastructure | Automated test: 30+ rapid requests are queued, not fired simultaneously |
| Hexagonal DDD over-engineering | Phase 1: Architecture setup | Code review: simple CRUD operations touch max 3-4 files, not 6+ |
| Neon compute exhaustion | Phase 1: Infrastructure | Check Neon dashboard monthly. Alert if >70% CU-hours consumed by mid-month |
| Docker macOS performance | Phase 1: Dev environment | `time make up` completes in under 30s. Hot reload under 2s |
| next-intl dynamic rendering | Phase where i18n ships | `next build` output shows target pages as "Static" not "Dynamic" |
| Stale cached data | Phase where API integration ships | Airing anime shows fresh episode counts within 6 hours of AniList update |
| Auth middleware bypass | Phase where auth ships | Integration test: server action returns 401 without valid session, even if middleware is bypassed |
| Cover image performance | Phase where UI grid ships | Lighthouse performance score >90 on list page with 20+ entries |
| Translation completeness | Phase where i18n ships | Build-time check: all keys present in EN exist in ES and CA files |

## Sources

- [AniList API Rate Limiting docs](https://docs.anilist.co/guide/rate-limiting) -- 90 req/min standard, currently degraded to 30 req/min
- [AniList API Considerations](https://docs.anilist.co/guide/considerations) -- IP blocking, adult content filtering, API stability warnings
- [Neon Plans and Limits](https://neon.com/docs/introduction/plans) -- 100 CU-hours/month, 0.5 GB storage, auto-suspend behavior
- [Neon Connection Pooling](https://neon.com/docs/connect/connection-pooling) -- PgBouncer transaction mode, cold start mitigation
- [Neon Latency Benchmarking](https://neon.com/docs/guides/benchmarking-latency) -- cold start 300-500ms typical
- [Vercel Hobby Plan Limits](https://vercel.com/docs/plans/hobby) -- 150k function invocations/month, 10s function timeout
- [next-intl Server/Client Components](https://next-intl.dev/docs/environments/server-client-components) -- setRequestLocale, static rendering
- [Domain-Driven Hexagon (Sairyss)](https://github.com/Sairyss/domain-driven-hexagon) -- DDD pitfalls for simple CRUD apps
- [Next.js Hot Reload in Docker issue](https://github.com/vercel/next.js/issues/36774) -- WATCHPACK_POLLING requirement
- [CVE-2025-29927 Next.js middleware bypass](https://workos.com/blog/nextjs-app-router-authentication-guide-2026) -- never rely on middleware-only auth
- [Mihon AniList HTTP 429 issue](https://github.com/mihonapp/mihon/issues/372) -- real-world rate limit problems with AniList tracking

---
*Pitfalls research for: Personal anime/manga tracker with AniList API, Vercel+Neon free tier, hexagonal DDD, Next.js App Router*
*Researched: 2026-03-08*
