---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [better-auth, drizzle-orm, postgresql, proxy, sessions, registration-lock]

# Dependency graph
requires:
  - phase: 01-02
    provides: "Drizzle ORM schema with users table, env-aware DB connection"
provides:
  - "Better Auth v1.5.4 server configuration with Drizzle adapter"
  - "Auth schema tables: sessions, accounts, verifications"
  - "Updated users table compatible with Better Auth (no passwordHash, added emailVerified/image)"
  - "Better Auth client instance for React components"
  - "API catch-all route handler at /api/auth/[...all]"
  - "Cookie-based proxy.ts for route protection"
  - "Single-user registration lock logic (extracted use-case + databaseHook)"
  - "shadcn/ui components: input, label, card, dropdown-menu"
affects: [02-02, 03, 04, 05]

# Tech tracking
tech-stack:
  added: [better-auth@1.5.4, shadcn/ui-input, shadcn/ui-label, shadcn/ui-card, shadcn/ui-dropdown-menu]
  patterns: [better-auth-drizzle-adapter, cookie-based-proxy, registration-lock-database-hook, defense-in-depth-auth]

key-files:
  created:
    - src/db/schema/auth.ts
    - src/lib/auth.ts
    - src/lib/auth-client.ts
    - src/app/api/auth/[...all]/route.ts
    - src/proxy.ts
    - src/modules/auth/application/use-cases/check-registration-open.ts
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - src/components/ui/card.tsx
    - src/components/ui/dropdown-menu.tsx
    - tests/auth/schema.test.ts
    - tests/auth/registration-lock.test.ts
    - tests/auth/proxy.test.ts
  modified:
    - src/db/schema/users.ts
    - src/db/schema/index.ts
    - tests/db/connection.test.ts
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "Better Auth v1.5.4 with Drizzle adapter (provider: pg) for auth backend"
  - "Database sessions with 30-day expiry and 1-day sliding window (not JWT)"
  - "Registration lock via databaseHooks.user.create.before with ALLOW_REGISTRATION env escape hatch"
  - "proxy.ts (Next.js 16 convention) for cookie-based route protection with defense-in-depth"
  - "text type for Better Auth table PKs (not uuid) since Better Auth generates string IDs internally"

patterns-established:
  - "Better Auth Drizzle adapter with schema mapping: user: schema.users for plural table name"
  - "Cookie-based proxy: lightweight getSessionCookie check in proxy, full validation in server components"
  - "Registration lock as extracted testable use-case with dependency injection for DB query"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03]

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 2 Plan 1: Auth Backend Setup Summary

**Better Auth v1.5.4 with Drizzle adapter, database sessions (30-day/1-day sliding), cookie-based proxy.ts route protection, and single-user registration lock with 97 passing tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T20:38:40Z
- **Completed:** 2026-03-08T20:42:50Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Better Auth v1.5.4 installed and configured with Drizzle adapter for PostgreSQL
- Database schema updated: users table modified (passwordHash removed, emailVerified/image added), session/account/verification tables created
- API route handler responds at /api/auth/* via catch-all route
- Proxy.ts redirects unauthenticated users to /login, allows public paths (/login, /signup, /api/auth)
- Single-user registration lock implemented via databaseHook and extracted testable use-case
- 97 tests pass: 50 existing + 47 new (27 auth schema + 4 registration lock + 11 proxy + 5 updated users)

## Task Commits

Each task was committed atomically (TDD: RED then GREEN):

1. **Task 1: Install Better Auth, update database schema, create auth configuration**
   - `597bb8e` test(02-01): add failing tests for auth schema, users table update, and registration lock
   - `7f56569` feat(02-01): install Better Auth, update schema, configure auth backend
2. **Task 2: Create proxy.ts for route protection with tests**
   - `4040d95` test(02-01): add failing tests for proxy route protection
   - `c543819` feat(02-01): create proxy.ts for cookie-based route protection

## Files Created/Modified
- `src/db/schema/auth.ts` - Sessions, accounts, verifications table definitions for Better Auth
- `src/db/schema/users.ts` - Updated: removed passwordHash, added emailVerified and image columns
- `src/db/schema/index.ts` - Barrel export now includes auth tables
- `src/lib/auth.ts` - Better Auth server config with Drizzle adapter, 30-day sessions, registration lock
- `src/lib/auth-client.ts` - Better Auth client instance for React components
- `src/app/api/auth/[...all]/route.ts` - Catch-all API route handler for Better Auth
- `src/proxy.ts` - Cookie-based route protection with public path allowlist
- `src/modules/auth/application/use-cases/check-registration-open.ts` - Testable registration lock logic
- `src/components/ui/input.tsx` - shadcn/ui input component (pre-installed for Plan 02)
- `src/components/ui/label.tsx` - shadcn/ui label component (pre-installed for Plan 02)
- `src/components/ui/card.tsx` - shadcn/ui card component (pre-installed for Plan 02)
- `src/components/ui/dropdown-menu.tsx` - shadcn/ui dropdown-menu component (pre-installed for Plan 02)
- `tests/auth/schema.test.ts` - 27 tests verifying auth table column shapes
- `tests/auth/registration-lock.test.ts` - 4 tests for registration lock logic
- `tests/auth/proxy.test.ts` - 11 tests for proxy route protection
- `tests/db/connection.test.ts` - Updated users table shape tests (no passwordHash, has emailVerified/image)

## Decisions Made
- **Better Auth v1.5.4:** Chosen for native Drizzle adapter, database sessions, built-in email/password, hooks for registration lock, confirmed Next.js 16 support
- **Database sessions (not JWT):** 30-day expiry with 1-day sliding window for revocability and no token size limits
- **Text PKs for auth tables:** Better Auth generates string IDs internally, so sessions/accounts/verifications use text primary keys (users table keeps uuid)
- **Registration lock extraction:** Logic extracted into a testable use-case function with dependency injection, separate from the databaseHook that calls it
- **Defense-in-depth:** Proxy does lightweight cookie check; full session validation to happen in server components (Plan 02)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- **db:push failed (Docker not running):** Schema push to local PostgreSQL skipped because Docker container was not running. Schema definitions are correct and tested. User should run `docker compose up -d` then `pnpm db:push` to apply.
- **Build requires NEON_DATABASE_URL:** Next.js production build fails without `NEON_DATABASE_URL` because `src/db/drizzle.ts` eagerly creates DB connection at import time. Build succeeds with env var set (verified with dummy URL). This is a pre-existing design pattern from Phase 1, not introduced by this plan.

## User Setup Required

None - no external service configuration required. The `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` environment variables should be set for production deployment but are not required for local development (Better Auth uses defaults).

## Next Phase Readiness
- Auth backend fully configured, ready for UI layer (Plan 02) to build login/signup pages
- Better Auth client instance ready for React component integration
- shadcn/ui form components (input, label, card, dropdown-menu) pre-installed
- Proxy active for route protection; auth pages can be built at /login and /signup
- Registration lock tested and ready to enforce single-user policy

## Self-Check: PASSED

- All 17 claimed files verified present
- All 4 task commits verified in git log (597bb8e, 7f56569, 4040d95, c543819)

---
*Phase: 02-authentication*
*Completed: 2026-03-08*
