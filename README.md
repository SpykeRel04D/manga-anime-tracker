# Manga Anime Tracker

Personal Next.js app for tracking anime and manga with:
- Next.js App Router
- Better Auth with email/password sessions
- Drizzle ORM
- PostgreSQL locally and Neon in production

## Local development

1. Copy `.env.example` to `.env.local`.
2. Start the local PostgreSQL container stack you use for development.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.

Required local env vars:
- `LOCAL_DATABASE_URL`
- `BETTER_AUTH_URL`

Optional local env vars:
- `BETTER_AUTH_SECRET`
- `ALLOW_REGISTRATION`

## Production target

The project is prepared for:
- App hosting on `Vercel Hobby`
- Database on `Neon Free`
- Git-based deploys from `GitHub`

This matches the current runtime model:
- Next.js server routes and auth handlers require server execution
- production DB access already uses Neon HTTP in [src/db/drizzle.ts](/home/spykerel04d/Sites/manga-anime-tracker/src/db/drizzle.ts)

## Production environment variables

Set these in Vercel:

```bash
BETTER_AUTH_URL=https://your-project.vercel.app
BETTER_AUTH_SECRET=<long-random-secret>
NEON_DATABASE_URL=postgresql://...
ALLOW_REGISTRATION=false
NODE_ENV=production
```

Notes:
- `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, and `NEON_DATABASE_URL` are treated as required in production.
- `ALLOW_REGISTRATION=false` keeps signup closed after your first account is created.

## Database bootstrap

The repo includes an initial Drizzle migration at [src/db/migrations/0000_glossy_spirit.sql](/home/spykerel04d/Sites/manga-anime-tracker/src/db/migrations/0000_glossy_spirit.sql).

Recommended flow:
1. Create a Neon project.
2. Connect with your Neon SQL editor or `psql`.
3. Run the SQL from that migration once.
4. Deploy the app to Vercel.

For future schema changes:
1. Generate or write a new migration locally.
2. Review it.
3. Apply it manually to Neon.
4. Deploy the app after the schema change is in place.

This keeps production schema changes explicit and safe for a personal app.

## First production login

The app allows signup when either:
- no users exist yet, or
- `ALLOW_REGISTRATION=true`

Recommended first-run flow:
1. Deploy with `ALLOW_REGISTRATION=false`.
2. Create the first account if signup is open because the database is empty.
3. If needed, temporarily switch `ALLOW_REGISTRATION=true`, create your account, and set it back to `false`.

## Useful commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:push
```
