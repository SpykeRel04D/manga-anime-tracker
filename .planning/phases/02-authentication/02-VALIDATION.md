---
phase: 2
slug: authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | vitest.config.ts (project root) |
| **Quick run command** | `pnpm test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | AUTH-01,02,03 | unit | `pnpm vitest run tests/auth/schema.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | AUTH-01 | unit | `pnpm vitest run tests/auth/registration-lock.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | AUTH-03 | unit | `pnpm vitest run tests/auth/proxy.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | AUTH-01 | unit | `pnpm vitest run tests/auth/signup.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | AUTH-02 | unit | `pnpm vitest run tests/auth/login.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | AUTH-03 | unit | `pnpm vitest run tests/auth/session.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/auth/schema.test.ts` — auth schema tables (session, account, verification) exist with correct columns
- [ ] `tests/auth/proxy.test.ts` — proxy matcher logic and redirect behavior
- [ ] `tests/auth/registration-lock.test.ts` — single-user registration lock logic
- [ ] `tests/auth/signup.test.ts` — signup flow stubs
- [ ] `tests/auth/login.test.ts` — login flow stubs
- [ ] `tests/auth/session.test.ts` — session persistence stubs

*Note: Better Auth's internal logic (password hashing, session creation, cookie management) is tested by the library. Our tests focus on schema correctness, configuration, proxy logic, and registration lock business logic.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Session survives browser refresh | AUTH-03 | Browser behavior | 1. Log in 2. Refresh page 3. Confirm still logged in |
| Session survives tab close/reopen | AUTH-03 | Browser behavior | 1. Log in 2. Close tab 3. Reopen URL 4. Confirm still logged in |
| Redirect to login for protected routes | AUTH-03 | Full proxy chain | 1. Log out 2. Navigate to /dashboard 3. Confirm redirect to /login |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
