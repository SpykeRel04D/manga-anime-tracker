# Phase 1: Foundation and Design System - Research

**Researched:** 2026-03-08
**Domain:** Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Drizzle ORM, PostgreSQL, Docker DX, Hexagonal DDD
**Confidence:** HIGH

## Summary

This phase scaffolds a greenfield Next.js 16 project with pnpm, sets up Docker-based local development (PostgreSQL via docker-compose, Makefile commands), initializes Drizzle ORM with dual-environment support (local Docker PostgreSQL + Neon for production), establishes a Hexagonal DDD folder structure with auth and tracking bounded contexts, and creates a placeholder page using a warm dark theme with shadcn/ui components and Tailwind CSS v4.

Next.js 16 (current stable: 16.1.6) introduces several breaking changes from v15: Turbopack is now the default bundler, `middleware.ts` is deprecated in favor of `proxy.ts`, all request APIs (`params`, `searchParams`, `cookies`, `headers`) must be awaited, and `next lint` is removed (use ESLint CLI directly). The project is greenfield so no migration is needed, but these patterns must be followed from the start.

**Primary recommendation:** Use `create-next-app` for initial scaffolding, immediately configure the warm dark theme as the only theme (no light mode), set up Docker PostgreSQL with the same pattern as kern-ecommerce, and organize business logic under `src/modules/{context}/{domain,application,infrastructure}` with UI under `src/app/`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Next.js 16 App Router with pnpm
- TypeScript strict mode
- ESLint + Prettier config ported from kern-ecommerce project:
  - ESLint: `next/core-web-vitals` + `next/typescript`, consistent-type-imports error, no-console error (allow warn/error), explicit-function-return-type for TS files, no-unused-vars with `_` ignore pattern
  - Prettier: single quotes, no semicolons, printWidth 90, `@trivago/prettier-plugin-sort-imports` + `prettier-plugin-tailwindcss`, arrowParens avoid
  - PostCSS: `@tailwindcss/postcss`
- shadcn/ui + Tailwind CSS for components and styling
- Primary accent: Amber/Gold (amber-500 for primary, amber-300 for soft variant)
- Background: Warm dark tones (hsl ~30deg hue, 8% lightness base, 12% for cards)
- Visual identity: Subtle anime nods -- clean modern UI, cover art is the visual star
- Card style: Soft rounded (12-16px border-radius), subtle borders, soft shadows
- Typography: Inter font family
- English only for v1 -- no i18n scaffolding, no translation keys
- DSGN-03 and DSGN-04 deferred to future version
- Placeholder page: Mock cover image grid with 8-12 skeleton cards (shimmer/skeleton state)
- Responsive layout: 2 columns mobile, 3-4 tablet, 5-6 desktop
- Top nav bar with "My Anime Tracker" and placeholder links (My List, Search)
- Placeholder user avatar in nav
- ESLint + Prettier + PostCSS config from kern-ecommerce at `/Users/o105/Sites/dockerized/kern-ecommerce` (adapted -- remove payload/sqlite-specific overrides)

### Claude's Discretion
- Exact skeleton shimmer animation style
- Nav bar layout details (spacing, responsive collapse)
- Docker/Makefile implementation details
- Hexagonal DDD folder structure specifics
- Drizzle ORM schema design

### Deferred Ideas (OUT OF SCOPE)
- i18n support (EN/ES/CA) with language selector dropdown -- deferred from v1
- Translation keys for all UI text -- deferred alongside i18n
- Language auto-detection from browser -- deferred
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | App deploys to Vercel free tier | Next.js 16 + Vercel: standard deployment, no special config needed. Turbopack builds by default. |
| INFR-02 | App uses Neon PostgreSQL free tier for user data | Drizzle ORM `drizzle-orm/neon-http` driver with `@neondatabase/serverless`. Dual-env config pattern researched. |
| INFR-03 | Local development uses Docker with Makefile commands (make up, make halt, make destroy) | Docker Compose pattern from kern-ecommerce: PostgreSQL 17-alpine, named volumes, Makefile includes. |
| INFR-04 | Codebase follows Hexagonal DDD architecture (Domain, Application, Infrastructure, UI layers) | Folder structure: `src/modules/{context}/{domain,application,infrastructure}` + `src/app/` for UI. |
| DSGN-01 | App uses a warm cozy dark theme (warm dark tones, soft borders, amber accents) | shadcn/ui CSS variables with oklch colors, custom warm palette, next-themes with forced dark mode. |
| DSGN-02 | App layout is responsive and mobile-first (2 columns mobile, 3-4 tablet, 5-6 desktop) | Tailwind CSS responsive grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`. |
| DSGN-03 | App supports English, Spanish, and Catalan with English as default | **DEFERRED** per user decision. English only for v1. |
| DSGN-04 | All UI text uses translation keys (no hardcoded strings) | **DEFERRED** per user decision. No i18n scaffolding for v1. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^16.1.6 | Full-stack React framework | App Router, Turbopack default, React 19.2 support |
| react | ^19.2.0 | UI library | Required by Next.js 16 |
| react-dom | ^19.2.0 | React DOM renderer | Required by Next.js 16 |
| typescript | ^5.7 | Type safety | Strict mode, Next.js 16 requires TS 5.1+ |
| tailwindcss | ^4.x | Utility-first CSS | v4 with `@tailwindcss/postcss` plugin, oklch colors |
| drizzle-orm | ^0.45.1 | TypeScript ORM | Type-safe SQL, PostgreSQL native, migration support |
| @neondatabase/serverless | latest | Neon PostgreSQL driver | Serverless-optimized for Vercel production |
| pg | latest | Node PostgreSQL driver | Standard driver for local Docker PostgreSQL |
| next-themes | ^0.4.x | Theme management | Dark mode with class strategy, shadcn/ui recommended |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| drizzle-kit | ^0.31.x | Migration CLI | Schema generation, push, migrate commands |
| @eslint/eslintrc | latest | ESLint compat layer | FlatCompat for next/core-web-vitals extends |
| eslint | ^9.x | Linting | Flat config format (Next.js 16 default) |
| eslint-config-next | ^16.x | Next.js ESLint rules | core-web-vitals + typescript presets |
| prettier | ^3.x | Code formatting | Single quotes, no semis, import sorting |
| @trivago/prettier-plugin-sort-imports | ^5.x | Import ordering | Consistent import organization |
| prettier-plugin-tailwindcss | ^0.7.x | Tailwind class sorting | Auto-sort utility classes in templates |
| @tailwindcss/postcss | ^4.x | PostCSS integration | Tailwind v4 PostCSS plugin |
| lucide-react | latest | Icon library | shadcn/ui default icon set |
| class-variance-authority | latest | Component variants | Used by shadcn/ui components |
| clsx | latest | Conditional classes | Used by shadcn/ui cn utility |
| tailwind-merge | latest | Tailwind class merging | Used by shadcn/ui cn utility |
| dotenv | latest | Environment variables | Drizzle config file env loading |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| drizzle-orm | Prisma | Drizzle is lighter, SQL-first, better for Neon serverless. Prisma has richer ecosystem but heavier runtime. |
| pg (local) | postgres.js | pg is more established with Docker PostgreSQL. postgres.js is newer but less battle-tested in non-serverless contexts. |
| next-themes | Manual dark class | next-themes handles SSR hydration, system detection, localStorage. Manual approach is fragile. |

**Installation:**
```bash
# Create Next.js project
pnpm create next-app@latest manga-anime-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
pnpm add drizzle-orm @neondatabase/serverless pg next-themes dotenv

# Dev dependencies
pnpm add -D drizzle-kit @types/pg @eslint/eslintrc eslint eslint-config-next prettier @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss @tailwindcss/postcss

# shadcn/ui initialization
pnpm dlx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                          # Next.js App Router (UI/Presentation layer)
│   ├── layout.tsx                # Root layout (font, theme provider, nav)
│   ├── page.tsx                  # Home page (placeholder grid)
│   ├── globals.css               # Theme CSS variables + Tailwind imports
│   └── favicon.ico
├── modules/                      # Hexagonal DDD bounded contexts
│   ├── auth/                     # Auth bounded context (scaffolded)
│   │   ├── domain/               # Entities, value objects, repository interfaces
│   │   │   ├── entities/
│   │   │   └── ports/            # Repository port interfaces
│   │   ├── application/          # Use cases / application services
│   │   │   └── use-cases/
│   │   └── infrastructure/       # Adapters (DB, external services)
│   │       └── adapters/
│   └── tracking/                 # Tracking bounded context (scaffolded)
│       ├── domain/
│       │   ├── entities/
│       │   └── ports/
│       ├── application/
│       │   └── use-cases/
│       └── infrastructure/
│           └── adapters/
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui generated components
│   ├── layout/                   # Layout components (nav, footer)
│   └── shared/                   # App-specific shared components
├── db/                           # Database layer
│   ├── schema/                   # Drizzle schema definitions
│   │   ├── index.ts              # Schema barrel export
│   │   ├── users.ts              # User table schema
│   │   └── tracking.ts           # Tracking table schema
│   ├── drizzle.ts                # DB connection (env-aware)
│   └── migrations/               # Generated migration files
├── lib/                          # Shared utilities
│   └── utils.ts                  # cn() helper from shadcn/ui
└── config/                       # App configuration
    └── site.ts                   # Site metadata, nav links
```

### Pattern 1: Hexagonal DDD with Next.js App Router
**What:** Business logic lives in `src/modules/`, completely decoupled from Next.js. The App Router (`src/app/`) is the UI adapter that calls application services. Infrastructure adapters (database, APIs) implement domain port interfaces.
**When to use:** All business logic -- never put domain logic in route handlers or React components.
**Example:**
```typescript
// src/modules/auth/domain/ports/user-repository.port.ts
export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>
  create(user: CreateUserDTO): Promise<User>
}

// src/modules/auth/infrastructure/adapters/drizzle-user.repository.ts
import type { UserRepositoryPort } from '../../domain/ports/user-repository.port'

export class DrizzleUserRepository implements UserRepositoryPort {
  constructor(private db: DrizzleDB) {}
  // implementation using drizzle queries
}
```

### Pattern 2: Environment-Aware Database Connection
**What:** Single `db/drizzle.ts` that automatically uses Neon serverless in production and node-postgres locally.
**When to use:** Always -- the DB connection module.
**Example:**
```typescript
// src/db/drizzle.ts
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

function createDb() {
  const url = process.env.DATABASE_URL!
  if (process.env.NODE_ENV === 'production') {
    const sql = neon(url)
    return drizzleNeon({ client: sql, schema })
  }
  return drizzlePg({ connection: url, schema })
}

export const db = createDb()
```

### Pattern 3: Forced Dark Theme with Custom Warm Palette
**What:** Use `next-themes` with `forcedTheme="dark"` or simply `defaultTheme="dark"` with no toggle. Define custom CSS variables for the warm amber palette.
**When to use:** Root layout setup -- the app has no light theme.
**Example:**
```typescript
// src/app/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 4: Docker Compose + Makefile (kern-ecommerce Pattern)
**What:** Minimal docker-compose.yaml for PostgreSQL only (Next.js runs on host via `pnpm dev`). Makefile delegates to `.docker/Makefile` includes.
**When to use:** Local development setup.
**Example structure:**
```
.docker/
├── docker-compose.yaml       # PostgreSQL 17-alpine only
├── Makefile                  # Includes from make/*.mk
└── make/
    ├── 01_setup.mk           # node_modules setup
    └── 02_docker.mk          # up, halt, destroy targets
Makefile                      # Root Makefile includes .docker/Makefile
```

### Anti-Patterns to Avoid
- **Domain logic in route handlers:** Never put business rules in `app/api/` route files or page components. Route handlers should only call application services.
- **Direct DB queries in React components:** Always go through the application layer, even for simple reads.
- **Hardcoding Neon driver everywhere:** Use the environment-aware connection pattern so local dev and production use the correct driver automatically.
- **Using `next lint`:** Removed in Next.js 16. Use `eslint .` directly via npm scripts.
- **Synchronous request APIs:** All `params`, `searchParams`, `cookies()`, `headers()` must be awaited in Next.js 16.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode management | Custom localStorage + class toggle | next-themes | Handles SSR hydration, flash-of-wrong-theme, system detection |
| Component variants | Custom className logic | class-variance-authority (cva) | Type-safe variants, composable, shadcn/ui standard |
| Class merging | String concatenation | tailwind-merge + clsx (cn helper) | Resolves Tailwind conflicts correctly |
| Skeleton loading | Custom CSS animation | shadcn/ui Skeleton component | Consistent with design system, accessible |
| Database migrations | Raw SQL files | drizzle-kit generate/migrate | Type-safe, tracked, reversible |
| Environment switching | Custom env parsing | dotenv + NODE_ENV check | Standard pattern, well-tested |
| Icon system | Custom SVG imports | lucide-react | Tree-shakeable, consistent size/stroke, shadcn/ui default |
| PostCSS config | Manual Tailwind plugin setup | @tailwindcss/postcss | Official Tailwind v4 PostCSS integration |

**Key insight:** shadcn/ui provides a complete design system foundation. The skeleton component, button variants, navigation menus, and avatar components are all available as copy-paste primitives. Use them rather than building from scratch.

## Common Pitfalls

### Pitfall 1: Synchronous Request API Access (Next.js 16 Breaking Change)
**What goes wrong:** Using `params.slug` or `searchParams.query` without `await` -- Next.js 15 had temporary sync compat but Next.js 16 removes it entirely.
**Why it happens:** Old tutorials and muscle memory from Next.js 14/15.
**How to avoid:** Always `const { slug } = await params` in pages/layouts/routes. Use `PageProps<'/path/[slug]'>` type helper.
**Warning signs:** Runtime errors about accessing properties on a Promise.

### Pitfall 2: Using `next lint` (Removed in Next.js 16)
**What goes wrong:** `next lint` command no longer exists. Build no longer runs linting.
**Why it happens:** Habit from Next.js 14/15 projects.
**How to avoid:** Configure ESLint directly: `"lint": "eslint ."` in package.json scripts.
**Warning signs:** "Command not found" errors in CI/CD.

### Pitfall 3: Tailwind v4 Color Format Change (oklch vs hsl)
**What goes wrong:** Defining shadcn/ui CSS variables in hsl format when Tailwind v4 expects oklch.
**Why it happens:** Most shadcn/ui tutorials pre-date Tailwind v4. The official shadcn docs now use oklch.
**How to avoid:** Use oklch format for all CSS variable definitions. Check the shadcn/ui Tailwind v4 migration docs.
**Warning signs:** Colors looking different than expected, or color functions not working.

### Pitfall 4: Drizzle Neon Driver in Local Development
**What goes wrong:** Using `drizzle-orm/neon-http` driver against Docker PostgreSQL -- it will fail because it uses Neon's HTTP proxy protocol.
**Why it happens:** Single connection string without environment detection.
**How to avoid:** Use the environment-aware connection pattern (Pattern 2 above). Neon driver for production, node-postgres for local.
**Warning signs:** Connection errors in local dev, "neon" related error messages.

### Pitfall 5: Missing `default.js` for Parallel Routes (Next.js 16)
**What goes wrong:** Builds fail if any parallel route slot lacks a `default.js` file.
**Why it happens:** New requirement in Next.js 16 (was optional before).
**How to avoid:** Not immediately relevant for Phase 1 (no parallel routes), but be aware for future phases.
**Warning signs:** Build errors mentioning missing default export.

### Pitfall 6: Docker PostgreSQL Port Conflicts
**What goes wrong:** Port 5432 already in use by host PostgreSQL or another container.
**Why it happens:** Common when developers have PostgreSQL installed locally.
**How to avoid:** Use a non-standard port mapping (e.g., `5433:5432`) in docker-compose, and set `DATABASE_URL` accordingly.
**Warning signs:** "port already in use" errors on `make up`.

### Pitfall 7: ESLint Flat Config Confusion
**What goes wrong:** Mixing `.eslintrc` legacy format with flat config format.
**Why it happens:** Next.js 16 defaults to flat config. The kern-ecommerce pattern uses `FlatCompat` wrapper.
**How to avoid:** Use `eslint.config.mjs` with `FlatCompat` for `next/core-web-vitals` extends (they still use legacy format internally).
**Warning signs:** ESLint config parsing errors, rules not being applied.

## Code Examples

### Warm Dark Theme CSS Variables
```css
/* src/app/globals.css */
/* Source: shadcn/ui theming docs + custom warm palette */
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

:root {
  /* Warm dark theme -- only dark mode, no light theme */
  --radius: 0.75rem;
  --background: oklch(0.17 0.015 60);        /* Warm dark base ~8% lightness, 30deg hue */
  --foreground: oklch(0.93 0.01 80);          /* Warm off-white */
  --card: oklch(0.22 0.015 60);              /* Cards ~12% lightness */
  --card-foreground: oklch(0.93 0.01 80);
  --popover: oklch(0.22 0.015 60);
  --popover-foreground: oklch(0.93 0.01 80);
  --primary: oklch(0.77 0.15 75);            /* Amber-500 equivalent */
  --primary-foreground: oklch(0.17 0.015 60);
  --secondary: oklch(0.25 0.015 60);
  --secondary-foreground: oklch(0.93 0.01 80);
  --muted: oklch(0.25 0.015 60);
  --muted-foreground: oklch(0.65 0.01 60);
  --accent: oklch(0.87 0.12 85);             /* Amber-300 equivalent */
  --accent-foreground: oklch(0.17 0.015 60);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.30 0.015 60);            /* Subtle warm border */
  --input: oklch(0.30 0.015 60);
  --ring: oklch(0.77 0.15 75);               /* Amber ring */
  --chart-1: oklch(0.77 0.15 75);
  --chart-2: oklch(0.70 0.12 160);
  --chart-3: oklch(0.60 0.15 250);
  --chart-4: oklch(0.75 0.10 330);
  --chart-5: oklch(0.65 0.15 30);
}

/* Since this is dark-only, .dark uses same values */
.dark {
  --background: oklch(0.17 0.015 60);
  --foreground: oklch(0.93 0.01 80);
  --card: oklch(0.22 0.015 60);
  --card-foreground: oklch(0.93 0.01 80);
  --popover: oklch(0.22 0.015 60);
  --popover-foreground: oklch(0.93 0.01 80);
  --primary: oklch(0.77 0.15 75);
  --primary-foreground: oklch(0.17 0.015 60);
  --secondary: oklch(0.25 0.015 60);
  --secondary-foreground: oklch(0.93 0.01 80);
  --muted: oklch(0.25 0.015 60);
  --muted-foreground: oklch(0.65 0.01 60);
  --accent: oklch(0.87 0.12 85);
  --accent-foreground: oklch(0.17 0.015 60);
  --destructive: oklch(0.58 0.22 27);
  --border: oklch(0.30 0.015 60);
  --input: oklch(0.30 0.015 60);
  --ring: oklch(0.77 0.15 75);
  --chart-1: oklch(0.77 0.15 75);
  --chart-2: oklch(0.70 0.12 160);
  --chart-3: oklch(0.60 0.15 250);
  --chart-4: oklch(0.75 0.10 330);
  --chart-5: oklch(0.65 0.15 30);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

### ESLint Flat Config (Adapted from kern-ecommerce)
```javascript
// eslint.config.mjs
// Source: kern-ecommerce eslint.config.mjs (payload/sqlite overrides removed)
import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['public', '.next', 'next-env.d.ts', '.docker'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
    },
  },
]

export default eslintConfig
```

### Prettier Config
```json
{
  "singleQuote": true,
  "semi": false,
  "printWidth": 90,
  "proseWrap": "always",
  "quoteProps": "consistent",
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "plugins": ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "cva"],
  "importOrder": ["^@/(.*)$", "^[./]"],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### Docker Compose for Local PostgreSQL
```yaml
# .docker/docker-compose.yaml
services:
  postgres:
    image: postgres:17-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - '5433:5432'
    environment:
      POSTGRES_USER: manga_tracker
      POSTGRES_PASSWORD: manga_tracker
      POSTGRES_DB: manga_tracker
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U manga_tracker']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Drizzle Config (Dual-Environment)
```typescript
// drizzle.config.ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: isProd
      ? process.env.NEON_DATABASE_URL!
      : process.env.LOCAL_DATABASE_URL!,
  },
})
```

### Responsive Skeleton Grid
```typescript
// Source: shadcn/ui Skeleton component pattern
import { Skeleton } from '@/components/ui/skeleton'

function SkeletonCard(): React.ReactElement {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[280px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function PlaceholderGrid(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 (Oct 2025) | Rename file and export function |
| Sync `params`/`searchParams` | Async `await params` | Next.js 16 (Oct 2025) | All route params must be awaited |
| `next lint` command | `eslint .` directly | Next.js 16 (Oct 2025) | Configure ESLint CLI in package.json |
| HSL color format (shadcn) | OKLCH color format | Tailwind v4 / shadcn 2025 | All CSS variables use oklch() |
| `experimental.turbopack` | Top-level `turbopack` config | Next.js 16 (Oct 2025) | Config location changed |
| `experimental.ppr` | `cacheComponents` | Next.js 16 (Oct 2025) | PPR flag renamed |
| `.eslintrc` / legacy config | `eslint.config.mjs` flat config | ESLint v9 / Next.js 16 | Default format changed |
| Webpack default bundler | Turbopack default bundler | Next.js 16 (Oct 2025) | No `--turbopack` flag needed |

**Deprecated/outdated:**
- `next lint`: Removed entirely. Use ESLint CLI directly.
- `middleware.ts`: Deprecated, renamed to `proxy.ts`. Still works but will be removed.
- `next/legacy/image`: Deprecated, use `next/image`.
- `images.domains`: Deprecated, use `images.remotePatterns`.
- `serverRuntimeConfig` / `publicRuntimeConfig`: Removed, use env variables.

## Open Questions

1. **Exact oklch values for warm amber theme**
   - What we know: Amber-500 is approximately `oklch(0.77 0.15 75)`, amber-300 is approximately `oklch(0.87 0.12 85)`. Background should be ~8% lightness with warm hue (~30-60 degrees).
   - What's unclear: Exact oklch conversions from the hsl values described by user need visual tuning.
   - Recommendation: Start with the values in the code example above, verify visually during implementation, and fine-tune. The planner should include a "visual review" step.

2. **Drizzle ORM v1 beta vs v0.45 stable**
   - What we know: v0.45.1 is latest stable. v1.0.0-beta.16 is latest beta (March 2026). Beta has migration infrastructure improvements.
   - What's unclear: Whether v1 beta is production-ready enough for a new project.
   - Recommendation: Use v0.45.1 stable. The beta is actively changing and may introduce breaking changes between beta versions. Migration to v1 can happen when it goes stable.

3. **shadcn/ui + Next.js 16 compatibility**
   - What we know: shadcn/ui supports Tailwind v4 and React 19. Next.js 16 uses React 19.2.
   - What's unclear: No explicit "Next.js 16 tested" statement from shadcn/ui.
   - Recommendation: Use `pnpm dlx shadcn@latest init` -- it detects the framework and configures accordingly. HIGH confidence this works based on React 19 compatibility.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (matches kern-ecommerce pattern) |
| Config file | `vitest.config.mts` -- Wave 0 |
| Quick run command | `pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFR-01 | Next.js builds successfully | smoke | `pnpm build` | N/A (build command) |
| INFR-02 | Drizzle connects to PostgreSQL | integration | `pnpm vitest run tests/db/connection.test.ts -x` | Wave 0 |
| INFR-03 | Docker PostgreSQL starts via Makefile | smoke | `make up && make halt` | N/A (manual/CI) |
| INFR-04 | Hexagonal folder structure exists | unit | `pnpm vitest run tests/architecture/structure.test.ts -x` | Wave 0 |
| DSGN-01 | Theme CSS variables defined correctly | unit | `pnpm vitest run tests/theme/variables.test.ts -x` | Wave 0 |
| DSGN-02 | Responsive grid renders placeholder cards | manual-only | Visual check in browser at multiple viewpoints | N/A -- CSS grid, not testable in JSDOM |
| DSGN-03 | DEFERRED | N/A | N/A | N/A |
| DSGN-04 | DEFERRED | N/A | N/A | N/A |

### Sampling Rate
- **Per task commit:** `pnpm vitest run --reporter=verbose`
- **Per wave merge:** `pnpm vitest run && pnpm build`
- **Phase gate:** Full suite green + successful build + visual placeholder page review

### Wave 0 Gaps
- [ ] `vitest.config.mts` -- Vitest configuration with path aliases
- [ ] `vitest.setup.ts` -- Test setup (if needed)
- [ ] `tests/db/connection.test.ts` -- Drizzle PostgreSQL connection test
- [ ] `tests/architecture/structure.test.ts` -- Verify hexagonal folder structure exists
- [ ] Framework install: `pnpm add -D vitest @vitejs/plugin-react` -- Vitest for testing

## Sources

### Primary (HIGH confidence)
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) -- All breaking changes, new features, version requirements
- [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Migration steps, async APIs, proxy.ts
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) -- CSS variable structure, oklch format
- [shadcn/ui theming docs](https://ui.shadcn.com/docs/theming) -- Dark mode setup, variable naming
- [Drizzle ORM + Neon tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon) -- Schema, config, migration commands
- [Drizzle ORM + PostgreSQL setup](https://orm.drizzle.team/docs/get-started/postgresql-new) -- node-postgres driver setup
- [Neon local + serverless guide](https://neon.com/guides/drizzle-local-vercel) -- Dual-environment configuration
- kern-ecommerce project at `/Users/o105/Sites/dockerized/kern-ecommerce` -- ESLint, Prettier, PostCSS, Docker, Makefile patterns (read directly)

### Secondary (MEDIUM confidence)
- [shadcn/ui dark mode with next-themes](https://ui.shadcn.com/docs/dark-mode/next) -- ThemeProvider setup pattern
- [Next.js font optimization docs](https://nextjs.org/docs/app/getting-started/fonts) -- Inter font setup via next/font/google
- [Hexagonal architecture Next.js template](https://github.com/kuzeofficial/next-hexagonal-architecture) -- Folder structure reference

### Tertiary (LOW confidence)
- oklch color values for warm amber palette -- Calculated approximations, need visual verification during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified against official docs and current releases
- Architecture: HIGH -- Hexagonal DDD pattern well-documented, kern-ecommerce Docker pattern read directly
- Pitfalls: HIGH -- All pitfalls sourced from Next.js 16 official breaking changes documentation
- Theme colors: MEDIUM -- oklch values are approximations of the desired warm amber palette, need visual tuning

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable ecosystem, 30-day validity)
