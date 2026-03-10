# Phase 2: Authentication - Research

**Researched:** 2026-03-08
**Domain:** Authentication (email/password), session management, route protection
**Confidence:** HIGH

## Summary

This phase implements email/password authentication for a single-user personal anime tracker built on Next.js 16.1.6 with Drizzle ORM and PostgreSQL (Neon production / Docker local). The recommended library is **Better Auth v1.5.x**, which has confirmed Next.js 16 compatibility (peer dependency resolved in v1.4.5+, multiple bug fixes since), a native Drizzle ORM adapter, built-in email/password support, database-backed sessions with sliding window refresh, and lifecycle hooks for implementing the single-user registration lock.

A critical architectural finding: Better Auth stores passwords in a separate `account` table, not in the `user` table. The existing `users` table has a `passwordHash` column that will go unused by Better Auth -- this column should be removed (or left nullable) since Better Auth manages credential storage internally via its `account` table. Better Auth requires four core tables: `user`, `session`, `account`, and `verification`. The existing `users` table can be mapped via `user.modelName: "users"` and Better Auth's schema generator will create the remaining tables.

Next.js 16 renames `middleware.ts` to `proxy.ts`. The proxy should use lightweight cookie-based checks (via `getSessionCookie`) for route protection, with full session validation happening in server components/actions via `auth.api.getSession()`. This follows the defense-in-depth pattern recommended after CVE-2025-29927.

**Primary recommendation:** Use Better Auth v1.5.x with Drizzle adapter (`provider: "pg"`), database sessions with 30-day expiry and 1-day sliding window, `proxy.ts` for route protection via cookie check, and `databaseHooks.user.create.before` for single-user registration lock.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Auth Page Design**: Centered minimal form card on warm dark background. Separate pages: /login and /signup (distinct routes, linked to each other). No nav bar on auth pages -- standalone layout, nav appears after login. Strictly functional -- no illustrations, decorative elements, or anime flair. App name "My Anime Tracker" displayed above the form.
- **Single-User Policy**: Registration locks after first user account is created. When signup is locked, /signup shows "Registration closed" message with link to login. Env variable `ALLOW_REGISTRATION=true` temporarily re-enables signup as escape hatch. Signup form collects email + password only (no display name -- `name` column in users table stays null).
- **Session Behavior**: 30-day session duration. Always persistent -- no "Remember me" checkbox. Sliding window: session timer resets on each app activity (re-login only after 30 days of inactivity). Logout button in avatar dropdown menu in nav bar (nav bar already has placeholder avatar).
- **Post-Login Flow**: After login -> redirect to main list page (home / currently placeholder grid). After signup -> auto-login, same redirect as login (no special first-time experience). Root URL (/) redirects unauthenticated users to /login. All app routes are protected -- entire app behind auth.
- **Auth Errors**: Inline error messages below the relevant form field (e.g., "Incorrect password" below password input). Standard red text, accessible styling.

### Claude's Discretion
- Auth library choice (Better Auth, NextAuth.js, or custom -- research should validate Next.js 16 compatibility per STATE.md blocker)
- Password hashing algorithm and configuration
- CSRF protection approach
- Form validation library (if any)
- Exact error message wording (security-conscious -- don't reveal whether email exists)
- Session storage mechanism (JWT vs database sessions)
- Middleware implementation for route protection

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up with email and password | Better Auth `emailAndPassword: { enabled: true }` + signup page at /signup + single-user lock via `databaseHooks.user.create.before` |
| AUTH-02 | User can log in with email and password | Better Auth `signIn.email` client method + login page at /login + post-login redirect to / |
| AUTH-03 | User session persists across browser refresh | Better Auth database sessions with `expiresIn: 2592000` (30 days) + `updateAge: 86400` (1 day sliding window) + cookie-based session token |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.5.4 | Authentication framework | Native Drizzle adapter, database sessions, email/password built-in, hooks for custom logic, confirmed Next.js 16 support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui input | (already installed cli) | Form input component | Login/signup form fields |
| shadcn/ui label | (already installed cli) | Form label component | Accessible form labels |
| shadcn/ui card | (already installed cli) | Card container | Auth form card wrapper |
| shadcn/ui dropdown-menu | (already installed cli) | Dropdown component | Avatar logout menu in nav bar |

No additional form validation library is needed. HTML5 native validation (`type="email"`, `required`, `minLength`) combined with server-side Better Auth validation is sufficient for this simple two-field form. This avoids adding react-hook-form + zod for a form that has exactly two inputs.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Better Auth | Auth.js v5 (next-auth@5.0.0-beta.30+) | Auth.js v5 still in beta, stores password differently, less ergonomic hooks for custom signup logic, JWT-default sessions require explicit database adapter setup |
| Better Auth | Custom implementation (bcrypt + iron-session) | Full control but hand-rolling session management, CSRF protection, sliding window refresh, cookie security -- significant footgun surface |
| No form library | react-hook-form + zod | Overkill for 2-field forms with server-side validation; adds ~15KB client bundle for minimal benefit |

**Installation:**
```bash
pnpm add better-auth
```

Additionally, install shadcn/ui components needed for auth pages:
```bash
pnpm dlx shadcn@latest add input label card dropdown-menu
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/                    # Auth route group (no nav bar layout)
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── signup/
│   │   │   └── page.tsx           # Signup page
│   │   └── layout.tsx             # Auth layout (centered card, no nav)
│   ├── (app)/                     # Protected app route group (with nav bar)
│   │   ├── layout.tsx             # App layout (nav bar + session provider)
│   │   └── page.tsx               # Main list page (current home)
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts       # Better Auth API handler
│   ├── layout.tsx                 # Root layout (unchanged)
│   └── globals.css                # Theme (unchanged)
├── lib/
│   ├── auth.ts                    # Better Auth server instance
│   └── auth-client.ts             # Better Auth client instance
├── db/
│   ├── schema/
│   │   ├── users.ts               # Modified: remove passwordHash, add Better Auth fields
│   │   ├── auth.ts                # NEW: session, account, verification tables
│   │   ├── tracking.ts            # Unchanged
│   │   └── index.ts               # Re-export all schemas
│   └── drizzle.ts                 # Unchanged
├── modules/
│   └── auth/
│       ├── domain/
│       │   └── entities/           # User entity types
│       ├── application/
│       │   └── use-cases/          # Registration lock logic
│       └── infrastructure/
│           └── adapters/           # Better Auth adapter configuration
└── proxy.ts                        # Route protection (at src/ level)
```

### Pattern 1: Route Groups for Auth vs App Layout
**What:** Use Next.js route groups `(auth)` and `(app)` to apply different layouts without affecting URL paths.
**When to use:** When auth pages need a different layout (no nav bar) than the main app (with nav bar).
**Example:**
```typescript
// src/app/(auth)/layout.tsx
// Source: Next.js App Router route groups documentation
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md px-4">
        <h1 className="text-foreground mb-6 text-center text-2xl font-bold">
          My Anime Tracker
        </h1>
        {children}
      </div>
    </div>
  )
}
```

### Pattern 2: Cookie-Based Proxy + Server-Side Validation (Defense in Depth)
**What:** Lightweight cookie check in proxy.ts for fast redirects; full session validation in server components.
**When to use:** Always. Never rely solely on proxy for authentication.
**Example:**
```typescript
// src/proxy.ts
// Source: Better Auth Next.js 16 integration docs
import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  // Public paths that don't require auth
  const publicPaths = ["/login", "/signup", "/api/auth"]
  const isPublic = publicPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
```

```typescript
// In a server component or server action:
// Source: Better Auth docs - server-side session retrieval
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const session = await auth.api.getSession({
  headers: await headers()
})
```

### Pattern 3: Single-User Registration Lock via Database Hook
**What:** Use Better Auth's `databaseHooks.user.create.before` to check if a user already exists before allowing signup.
**When to use:** Single-user personal apps where registration should lock after first account.
**Example:**
```typescript
// Source: Better Auth hooks documentation + databaseHooks
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/db/drizzle"
import * as schema from "@/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,  // Map 'users' table to Better Auth's 'user' model
    },
  }),
  user: {
    modelName: "users",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,   // 30 days
    updateAge: 60 * 60 * 24,          // 1 day sliding window
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Allow registration if env override is set
          if (process.env.ALLOW_REGISTRATION === "true") {
            return
          }
          // Check if any user exists
          const existingUsers = await db.select().from(schema.users).limit(1)
          if (existingUsers.length > 0) {
            throw new APIError("FORBIDDEN", {
              message: "Registration is closed",
            })
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
})
```

### Pattern 4: Auth-Aware Nav Bar with Logout Dropdown
**What:** Nav bar checks session state and shows avatar dropdown with logout for authenticated users.
**When to use:** In the `(app)` layout where the nav bar appears.
**Example:**
```typescript
// Client-side logout using Better Auth client
import { authClient } from "@/lib/auth-client"

const handleLogout = async () => {
  await authClient.signOut()
  // Better Auth handles cookie cleanup; redirect to /login
  window.location.href = "/login"
}
```

### Anti-Patterns to Avoid
- **Proxy-only auth:** Never rely solely on proxy.ts for authentication. CVE-2025-29927 demonstrated that middleware/proxy can be bypassed. Always verify sessions server-side at data access points.
- **Storing passwords in user table:** Better Auth manages passwords in the `account` table. Do not add custom password columns to the user table.
- **Custom session management:** Do not hand-roll session tokens, cookie management, or sliding window logic. Better Auth handles all of this.
- **Client-side auth checks only:** Always validate sessions on the server. Client-side `useSession()` is for UI state, not security.
- **Revealing email existence in errors:** Do not say "No account with this email" -- use generic messages like "Invalid email or password" to prevent email enumeration.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt/argon2 setup | Better Auth built-in (scrypt default) | Scrypt is memory-hard, CPU-intensive; Better Auth configures salt rounds and timing correctly |
| Session management | Custom token generation + cookie management | Better Auth database sessions | Sliding window, secure cookie flags, SameSite, HttpOnly all handled automatically |
| CSRF protection | Custom CSRF token middleware | Better Auth built-in (Origin validation + SameSite + Sec-Fetch-* headers) | Multi-layered CSRF protection out of the box |
| Rate limiting | Custom rate limiter | Better Auth built-in rate limiting | Applies stricter limits to auth endpoints automatically |
| Cookie security | Manual Set-Cookie headers | Better Auth cookie management | HttpOnly, Secure, SameSite=Lax, proper domain scoping |
| Registration lock | Custom middleware checking user count | Better Auth `databaseHooks.user.create.before` | Runs inside Better Auth's transaction, cannot be bypassed |

**Key insight:** Authentication has an enormous footgun surface. Every custom implementation risks session fixation, CSRF, timing attacks, cookie misconfiguration, or email enumeration. Better Auth bundles solutions for all of these, tested across thousands of deployments.

## Common Pitfalls

### Pitfall 1: Existing `passwordHash` Column Conflict
**What goes wrong:** The existing `users` table has a `passwordHash` column from Phase 1 scaffolding. Better Auth stores passwords in the `account` table, not the `user` table. If left as `NOT NULL`, Better Auth's user creation will fail because it does not populate this field.
**Why it happens:** Phase 1 anticipated a custom auth implementation; Better Auth has a different schema design.
**How to avoid:** Remove the `passwordHash` column from the `users` table schema, or make it nullable (`.default(null)`). Better Auth manages credentials entirely through the `account` table. Generate a new migration after schema change.
**Warning signs:** User creation fails with "NOT NULL constraint" error on `password_hash`.

### Pitfall 2: Better Auth Default Table Name is `user` (Singular)
**What goes wrong:** Better Auth expects a table named `user` by default. The existing project uses `users` (plural). Without configuration, Better Auth tries to create/access a `user` table that doesn't exist.
**Why it happens:** Different naming conventions.
**How to avoid:** Set `user: { modelName: "users" }` in the Better Auth config, and pass the schema mapping in the Drizzle adapter: `schema: { ...schema, user: schema.users }`.
**Warning signs:** "relation 'user' does not exist" PostgreSQL error.

### Pitfall 3: Missing `emailVerified` and `image` Columns on Users Table
**What goes wrong:** Better Auth's core user schema expects `emailVerified` (boolean) and `image` (string, optional) columns. The existing `users` table does not have these.
**Why it happens:** Phase 1 scaffolded a simpler user schema.
**How to avoid:** Add `emailVerified` (boolean, default false) and `image` (text, nullable) columns to the `users` table. Use Better Auth's schema generator (`npx auth generate`) to see the exact required schema, then reconcile.
**Warning signs:** Column not found errors during signup/login.

### Pitfall 4: Proxy.ts File Location
**What goes wrong:** The proxy.ts file must be at the project root or inside `src/` at the same level as the `app` directory. Placing it inside `app/` or elsewhere means it will not be detected.
**Why it happens:** Next.js convention requires specific file placement.
**How to avoid:** Place at `src/proxy.ts` (since the project uses `src/` directory).
**Warning signs:** Proxy never executes, unauthenticated users can access all routes.

### Pitfall 5: Auth API Route Must Be Catch-All
**What goes wrong:** Better Auth needs a catch-all route at `/api/auth/[...all]/route.ts`. If you create `/api/auth/route.ts` (without the catch-all), most auth endpoints will 404.
**Why it happens:** Better Auth exposes many endpoints (sign-up, sign-in, sign-out, get-session, etc.) under the `/api/auth/*` prefix.
**How to avoid:** Always use the `[...all]` catch-all segment.
**Warning signs:** Auth endpoints return 404 or "not found".

### Pitfall 6: Server Actions Require `nextCookies` Plugin
**What goes wrong:** When using Better Auth's server-side API methods (like `auth.api.signInEmail`) in server actions, cookies may not be set properly without the `nextCookies` plugin.
**Why it happens:** Next.js server actions have a different cookie-setting mechanism than route handlers.
**How to avoid:** Always include `plugins: [nextCookies()]` in the Better Auth configuration.
**Warning signs:** Login succeeds server-side but session cookie is not set, user appears logged out.

### Pitfall 7: Registration Check Race Condition
**What goes wrong:** If two signup requests arrive simultaneously when no users exist, both could pass the "check if user exists" test and create two accounts.
**Why it happens:** Time-of-check-to-time-of-use (TOCTOU) issue in the databaseHook.
**How to avoid:** For a personal single-user app, this is extremely unlikely. For extra safety, add a unique constraint or use a database-level lock. The `ALLOW_REGISTRATION` env var provides an escape hatch regardless.
**Warning signs:** Multiple user accounts exist when only one was expected.

## Code Examples

Verified patterns from official sources:

### Better Auth Server Configuration
```typescript
// src/lib/auth.ts
// Source: https://better-auth.com/docs/installation
// Source: https://better-auth.com/docs/adapters/drizzle
// Source: https://better-auth.com/docs/concepts/hooks
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { APIError } from "better-auth/api"
import { db } from "@/db/drizzle"
import * as schema from "@/db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  user: {
    modelName: "users",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true, // Auto sign-in after signup (user decision)
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,  // 30 days in seconds
    updateAge: 60 * 60 * 24,        // refresh every 1 day of activity
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (process.env.ALLOW_REGISTRATION === "true") return
          const existingUsers = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .limit(1)
          if (existingUsers.length > 0) {
            throw new APIError("FORBIDDEN", {
              message: "Registration is closed",
            })
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
})
```

### Better Auth Client
```typescript
// src/lib/auth-client.ts
// Source: https://better-auth.com/docs/installation
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()
// baseURL defaults to current origin, which is correct for Next.js
```

### API Route Handler
```typescript
// src/app/api/auth/[...all]/route.ts
// Source: https://better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { GET, POST } = toNextJsHandler(auth)
```

### Client-Side Sign Up
```typescript
// Source: https://better-auth.com/docs/basic-usage
import { authClient } from "@/lib/auth-client"

const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "", // name stays empty per user decision
})
```

### Client-Side Sign In
```typescript
// Source: https://better-auth.com/docs/basic-usage
import { authClient } from "@/lib/auth-client"

const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "securepassword",
})
```

### Client-Side Session Hook
```typescript
// Source: https://better-auth.com/docs/concepts/session-management
import { authClient } from "@/lib/auth-client"

// In a React component
const { data: session, isPending } = authClient.useSession()
```

### Server-Side Session Check
```typescript
// Source: https://better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect("/login")
  }
  return <div>Welcome {session.user.email}</div>
}
```

### Client-Side Sign Out
```typescript
// Source: https://better-auth.com/docs/basic-usage
import { authClient } from "@/lib/auth-client"

await authClient.signOut()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 (2025) | File and function rename; proxy.ts at project/src root |
| Middleware-only auth | Defense-in-depth (proxy + server validation) | Post CVE-2025-29927 (Mar 2025) | Must validate sessions at data access layer, not just proxy |
| NextAuth.js v4 | Auth.js v5 / Better Auth | 2024-2025 | NextAuth v4 deprecated; Auth.js v5 still beta; Better Auth emerged as stable alternative |
| JWT sessions | Database sessions | Trend 2024-2025 | Database sessions preferred for revocability, no token size limits, sliding window refresh |
| Password in user table | Password in account table (Better Auth) | Better Auth design | Separates identity from authentication method, supports multiple providers per user |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in Next.js 16, renamed to `proxy.ts`
- NextAuth.js v4: End of life; migrate to Auth.js v5 or Better Auth
- Middleware-only auth protection: Unsafe since CVE-2025-29927; always validate server-side

## Open Questions

1. **Schema migration strategy for existing `users` table**
   - What we know: The existing table has `passwordHash` (NOT NULL) that Better Auth won't use. Better Auth needs `emailVerified` and `image` columns. Three new tables (session, account, verification) must be created.
   - What's unclear: Whether to use `npx auth generate` to auto-generate the Drizzle schema file for the three new tables, or hand-write them to match project conventions.
   - Recommendation: Use `npx auth generate` to see the canonical schema, then hand-write Drizzle schema files matching the project's existing patterns (snake_case columns, explicit types). Remove `passwordHash` from users table. Run `drizzle-kit generate` then `drizzle-kit migrate`.

2. **Signup page behavior when registration is locked**
   - What we know: User wants "Registration closed" message with link to login. The `databaseHooks` approach only fires when signup is attempted.
   - What's unclear: Whether to also check user count on the signup page load (server component) to show the message proactively, or only show it after a failed attempt.
   - Recommendation: Check on page load via server component (query user count). Show "Registration closed" immediately if locked, rather than letting the user fill out a form that will fail. The `databaseHooks` remains as a server-side safety net.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | vitest.config.ts (project root) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User can sign up with email/password | unit | `pnpm vitest run tests/auth/signup.test.ts -x` | Wave 0 |
| AUTH-01 | Registration locks after first user | unit | `pnpm vitest run tests/auth/registration-lock.test.ts -x` | Wave 0 |
| AUTH-02 | User can log in with email/password | unit | `pnpm vitest run tests/auth/login.test.ts -x` | Wave 0 |
| AUTH-03 | Session persists across refresh | unit | `pnpm vitest run tests/auth/session.test.ts -x` | Wave 0 |
| AUTH-03 | Proxy redirects unauthenticated users | unit | `pnpm vitest run tests/auth/proxy.test.ts -x` | Wave 0 |

**Note on test scope:** Better Auth's internal logic (password hashing, session creation, cookie management) is tested by the library itself. Our tests should focus on:
1. Schema correctness (auth tables exist with expected columns)
2. Auth configuration correctness (proper Better Auth config structure)
3. Proxy matcher/redirect logic (using `unstable_doesProxyMatch` from `next/experimental/testing/server`)
4. Registration lock business logic (databaseHook behavior)

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth/schema.test.ts` -- covers auth schema tables (session, account, verification) exist with correct columns
- [ ] `tests/auth/proxy.test.ts` -- covers proxy matcher logic and redirect behavior
- [ ] `tests/auth/registration-lock.test.ts` -- covers single-user registration lock logic
- [ ] Update `tests/db/connection.test.ts` -- add new auth schema table checks

## Sources

### Primary (HIGH confidence)
- [Better Auth - Installation](https://better-auth.com/docs/installation) - Core setup, email/password config
- [Better Auth - Next.js Integration](https://better-auth.com/docs/integrations/next) - Route handler, proxy.ts, server components, nextCookies plugin
- [Better Auth - Drizzle Adapter](https://better-auth.com/docs/adapters/drizzle) - Adapter setup, schema mapping, provider config
- [Better Auth - Session Management](https://better-auth.com/docs/concepts/session-management) - expiresIn, updateAge, sliding window, cookie cache
- [Better Auth - Hooks](https://better-auth.com/docs/concepts/hooks) - createAuthMiddleware, databaseHooks, APIError
- [Better Auth - Security](https://better-auth.com/docs/reference/security) - Password hashing (scrypt), CSRF, rate limiting
- [Better Auth - Database](https://better-auth.com/docs/concepts/database) - Core table requirements (user, session, account, verification)
- [Better Auth - Users & Accounts](https://better-auth.com/docs/concepts/users-accounts) - Password storage in account table
- [Better Auth - Options](https://better-auth.com/docs/reference/options) - disableSignUp, session config, user modelName
- [Next.js - proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - File convention, matcher, migration from middleware

### Secondary (MEDIUM confidence)
- [Better Auth GitHub #5263](https://github.com/better-auth/better-auth/issues/5263) - Next.js 16 support confirmed resolved
- [Better Auth GitHub #6439](https://github.com/better-auth/better-auth/issues/6439) - Peer dependency fixed in v1.4.5+
- [Better Auth GitHub #5724](https://github.com/better-auth/better-auth/issues/5724) - Dynamic signup prevention via database hooks
- [Auth0 Blog - Next.js 16 Auth](https://auth0.com/blog/whats-new-nextjs-16/) - Defense-in-depth, CVE-2025-29927 context
- [better-auth npm](https://www.npmjs.com/package/better-auth) - Current version v1.5.4

### Tertiary (LOW confidence)
- None. All findings verified with primary documentation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Better Auth v1.5.x officially documents all features used; Next.js 16 compatibility confirmed resolved via GitHub issues
- Architecture: HIGH - Route groups, proxy.ts, catch-all API routes all documented in official Next.js and Better Auth docs
- Pitfalls: HIGH - Schema conflicts identified by comparing existing code against Better Auth's documented schema requirements

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable libraries, 30-day validity)
