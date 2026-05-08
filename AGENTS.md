# AGENTS.md

Operating notes for AI agents working in this repository. Keep changes small,
follow the patterns already in `src/`, and respect the project conventions
listed below.

## Project

Personal manga/anime tracker. Next.js 16 App Router, React 19, Better Auth,
Drizzle ORM. Local Postgres via Docker, Neon HTTP in production. Single user
in practice; signup is gated by `ALLOW_REGISTRATION` once one user exists.

## Stack

- Next.js `16.x` (App Router) + React `19.x`
- Better Auth (`better-auth`) — email/password sessions, cookie-based
- Drizzle ORM (`drizzle-orm`) — schema in `src/db/schema/`
- PostgreSQL — `pg` driver locally, `@neondatabase/serverless` in production
- Tailwind CSS v4 + `@base-ui/react` + shadcn-style primitives
- Vitest for tests (node environment)
- Package manager: **pnpm** (`packageManager: pnpm@10.x`). Do not use npm/yarn.

## Layout

```
src/
  app/                Next.js App Router
    (app)/            Authenticated app routes (search, tracking, ...)
    (auth)/           Login/signup
    api/auth/         Better Auth handler
    layout.tsx        Root layout
  components/
    ui/               shadcn-style primitives (button, card, ...)
    layout/, shared/  Composed layout pieces
    theme-provider.tsx
  config/
  db/
    drizzle.ts        Singleton db client (Neon in prod, pg locally)
    schema/           Drizzle table definitions (auth, tracking, users)
    migrations/       Generated SQL migrations
  lib/
    auth.ts           Better Auth server config
    auth-client.ts    Better Auth client
    env.ts            Env access (throws when required vars missing in prod)
    anilist/          AniList HTTP rate limiter etc.
  modules/            Hexagonal DDD bounded contexts
    auth/
    tracking/
  proxy.ts            Next.js middleware (renamed from default `middleware.ts`)
tests/                Vitest specs mirroring src/ feature areas
.docker/              Local Postgres compose stack + Makefile include
```

Path alias: `@/*` → `src/*` (configured in `tsconfig.json` and
`vitest.config.mts`).

## Architecture: Hexagonal DDD

Each bounded context under `src/modules/<context>/` has the same four layers,
and `tests/architecture/structure.test.ts` enforces them:

```
src/modules/<context>/
  domain/
    entities/         Pure types and domain models
    ports/            Interfaces the use cases depend on
  application/
    use-cases/        One file per action, exported function
  infrastructure/
    adapters/         Implementations of ports (DB, HTTP, ...)
```

Rules:

- Domain has no infrastructure imports. Ports are interfaces only.
- Use cases call ports — never adapters or `db` directly.
- Adapters live in `infrastructure/` and are wired at the call site
  (typically a server action or route handler).
- One use case per file (`add-tracking-entry.ts`, `update-status.ts`, ...).
  Filenames are kebab-case; exports are camelCase.
- When you add a new bounded context, create all four layer directories so
  the architecture test keeps passing.

## Auth

- `src/lib/auth.ts` configures Better Auth.
- Sessions are cookie-based; `src/proxy.ts` (Next middleware) redirects
  unauthenticated requests away from non-public paths.
- Public path prefixes: `/login`, `/signup`, `/api/auth`.
- The middleware file is intentionally named `proxy.ts` (not the default
  `middleware.ts`). Keep it that way unless explicitly asked to rename.
- Registration policy: signup is allowed when no users exist OR
  `ALLOW_REGISTRATION=true`. See `src/modules/auth/application/use-cases/`.

## Database

- Drizzle schema lives in `src/db/schema/` and is re-exported from
  `src/db/schema/index.ts`. The `db` singleton is in `src/db/drizzle.ts`.
- Local: Docker Postgres on `localhost:5433` (`.docker/docker-compose.yaml`).
- Production: Neon over HTTP (`@neondatabase/serverless`).
- Migrations are **applied manually** to Neon. Generate locally with
  `pnpm db:generate`, review the SQL, then run it against Neon via the SQL
  editor or `psql`. Do not auto-run migrations on deploy.

## Environment

`src/lib/env.ts` is the single read point for env vars. Add new required
production vars there with the `getRequiredEnv` helper so missing values
fail fast in prod and stay optional locally.

Local (`.env.local`):
- `LOCAL_DATABASE_URL` — required
- `BETTER_AUTH_URL` — defaults to `http://localhost:3000`
- `BETTER_AUTH_SECRET` — optional locally
- `ALLOW_REGISTRATION` — `true` | `false`

Production (Vercel):
- `NEON_DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` — required
- `ALLOW_REGISTRATION=false`, `NODE_ENV=production`

## Conventions

- TypeScript strict mode. `@typescript-eslint/explicit-function-return-type`
  is **error** — every exported function and component needs an explicit
  return type.
- `@typescript-eslint/consistent-type-imports` is **error** — use
  `import type { X }` for type-only imports.
- `no-console` is **error** except `console.warn` and `console.error`.
- Unused vars must be prefixed with `_`.
- Prettier: single quotes, no semicolons, 90 cols, no trailing arrow parens
  on single arg, sorted imports (`@/*` first, then relative, separated by a
  blank line), Tailwind class sorting on `cn`/`cva`.
- Components: prefer Server Components. Add `'use client'` only when needed
  (state, effects, browser APIs).
- Server actions live next to the route in `src/app/.../actions.ts`. They
  call use cases from `src/modules/<context>/application/use-cases/`.

## Commands

```bash
pnpm dev                # Next dev server
pnpm build              # Production build
pnpm start              # Run built app
pnpm lint               # ESLint
pnpm format             # Prettier write
pnpm format:check       # Prettier check
pnpm test               # Vitest (verbose)
pnpm db:generate        # Drizzle: generate SQL from schema
pnpm db:migrate         # Drizzle: apply migrations (local)
pnpm db:push            # Drizzle: push schema (local only)
pnpm db:studio          # Drizzle Studio
```

`Makefile` includes `.docker/Makefile` for the local Postgres stack.

## Tests

- Vitest, node environment, specs in `tests/**/*.test.ts`.
- Tests mirror feature areas (`tests/auth/`, `tests/tracking/`, ...).
- `tests/architecture/structure.test.ts` guards the hexagonal layout — keep
  it green when adding a new module.
- Adapters that hit external services (AniList, DB) are tested with mocks;
  see `tests/search/anilist-adapter.test.ts` and the adapter unit tests.
- Run the full suite with `pnpm test` before declaring work complete.

## What to do before claiming a task is done

1. `pnpm lint` — must pass.
2. `pnpm test` — must pass.
3. For UI changes, open the affected page in the dev server and exercise
   the golden path. If you can't run a browser, say so explicitly.
4. For schema changes, generate the migration, review the SQL, and note in
   the PR that it must be applied manually to Neon.

## Things to avoid

- Don't introduce new state managers, ORMs, or auth libs without a real need.
- Don't bypass the hexagonal layout — no DB calls inside `domain/` or
  `application/`, no UI imports inside `modules/`.
- Don't rename `src/proxy.ts` back to `middleware.ts` unless asked.
- Don't auto-apply DB migrations in CI/deploy. Production migrations are
  manual.
- Don't add `console.log` to committed code.
- Don't commit `.env*` files (only `.env.example`).
