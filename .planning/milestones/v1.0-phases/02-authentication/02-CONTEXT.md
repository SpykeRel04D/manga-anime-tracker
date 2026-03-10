# Phase 2: Authentication - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Email/password signup, login, and persistent sessions. Users can create an account, log in, and stay logged in across browser refreshes. Unauthenticated users are redirected to login. Registration locks after the first user (single-user personal app). Search, tracking, and list features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Auth Page Design
- Centered minimal form card on warm dark background
- Separate pages: /login and /signup (distinct routes, linked to each other)
- No nav bar on auth pages — standalone layout, nav appears after login
- Strictly functional — no illustrations, decorative elements, or anime flair
- App name "My Anime Tracker" displayed above the form

### Single-User Policy
- Registration locks after first user account is created
- When signup is locked, /signup shows "Registration closed" message with link to login
- Env variable `ALLOW_REGISTRATION=true` temporarily re-enables signup as escape hatch
- Signup form collects email + password only (no display name — `name` column in users table stays null)

### Session Behavior
- 30-day session duration
- Always persistent — no "Remember me" checkbox
- Sliding window: session timer resets on each app activity (re-login only after 30 days of inactivity)
- Logout button in avatar dropdown menu in nav bar (nav bar already has placeholder avatar)

### Post-Login Flow
- After login → redirect to main list page (home / currently placeholder grid)
- After signup → auto-login, same redirect as login (no special first-time experience)
- Root URL (/) redirects unauthenticated users to /login
- All app routes are protected — entire app behind auth

### Auth Errors
- Inline error messages below the relevant form field (e.g., "Incorrect password" below password input)
- Standard red text, accessible styling

### Claude's Discretion
- Auth library choice (Better Auth, NextAuth.js, or custom — research should validate Next.js 16 compatibility per STATE.md blocker)
- Password hashing algorithm and configuration
- CSRF protection approach
- Form validation library (if any)
- Exact error message wording (security-conscious — don't reveal whether email exists)
- Session storage mechanism (JWT vs database sessions)
- Middleware implementation for route protection

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `users` table (src/db/schema/users.ts): Already has id, email, passwordHash, name, createdAt, updatedAt columns — schema is ready for auth
- Avatar component (src/components/ui/avatar.tsx): Can be used for nav bar user dropdown
- Button component (src/components/ui/button.tsx): For form submit buttons
- Nav bar (src/components/layout/nav-bar.tsx): Has placeholder avatar — needs auth-aware state (logged in vs logged out)

### Established Patterns
- Next.js 16 App Router with src/app/ directory (layout.tsx, page.tsx)
- shadcn/ui components with Tailwind CSS and warm dark theme (oklch colors)
- ThemeProvider forces dark mode (enableSystem=false)
- Drizzle ORM for database access

### Integration Points
- Nav bar avatar → needs auth state to show dropdown with logout
- App layout → needs session provider/context
- All routes → need middleware for auth redirect
- users table → auth library needs to use existing schema or adapter

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The auth should feel invisible: clean form, log in, use the app.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-03-08*
