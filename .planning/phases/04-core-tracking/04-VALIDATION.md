---
phase: 4
slug: core-tracking
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.mts` |
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
| 04-01-01 | 01 | 0 | TRCK-02 | unit | `pnpm vitest run tests/tracking/update-status.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | TRCK-03 | unit | `pnpm vitest run tests/tracking/update-progress.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | TRCK-04 | unit | `pnpm vitest run tests/tracking/update-rating.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 0 | TRCK-05 | unit | `pnpm vitest run tests/tracking/update-notes.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 0 | TRCK-06 | unit | `pnpm vitest run tests/tracking/remove-entry.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-06 | 01 | 0 | -- | unit | `pnpm vitest run tests/tracking/refresh-metadata.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-07 | 01 | 0 | -- | unit | `pnpm vitest run tests/tracking/get-tracking-entry.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | TRCK-02 | unit | `pnpm vitest run tests/tracking/update-status.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | TRCK-03 | unit | `pnpm vitest run tests/tracking/update-progress.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 1 | TRCK-04 | unit | `pnpm vitest run tests/tracking/update-rating.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-04 | 02 | 1 | TRCK-05 | unit | `pnpm vitest run tests/tracking/update-notes.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-05 | 02 | 1 | TRCK-06 | unit | `pnpm vitest run tests/tracking/remove-entry.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-06 | 02 | 1 | TRCK-01 | unit | `pnpm vitest run tests/tracking/search-integration.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/tracking/` directory — create for all phase 4 tests
- [ ] `tests/tracking/update-status.test.ts` — stubs for TRCK-02
- [ ] `tests/tracking/update-progress.test.ts` — stubs for TRCK-03 (including clamp + auto-complete)
- [ ] `tests/tracking/update-rating.test.ts` — stubs for TRCK-04
- [ ] `tests/tracking/update-notes.test.ts` — stubs for TRCK-05
- [ ] `tests/tracking/remove-entry.test.ts` — stubs for TRCK-06
- [ ] `tests/tracking/refresh-metadata.test.ts` — stubs for metadata refresh with cooldown
- [ ] `tests/tracking/get-tracking-entry.test.ts` — stubs for single entry fetch
- [ ] `tests/tracking/search-integration.test.ts` — stubs for TRCK-01 enhanced search integration

*Test pattern follows existing `tests/search/add-tracking-entry.test.ts`: mock `@/db/drizzle`, `@/db/schema`, and `drizzle-orm`, then test use case logic in isolation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Star rating hover preview | TRCK-04 | Visual hover state requires browser interaction | Hover over stars 1-10, verify lighter shade fill on hover |
| Auto-resize textarea | TRCK-05 | CSS/DOM behavior not testable in unit tests | Type multi-line notes, verify textarea grows |
| Toast confirmations | All | Sonner toast rendering requires browser | Perform each action, verify toast appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
