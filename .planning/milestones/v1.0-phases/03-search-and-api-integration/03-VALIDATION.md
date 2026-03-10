---
phase: 3
slug: search-and-api-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 3 — Validation Strategy

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
| 03-01-01 | 01 | 0 | SRCH-01, SRCH-02 | unit | `pnpm vitest run tests/search/anilist-adapter.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 0 | SRCH-03 | unit | `pnpm vitest run tests/search/search-result-mapping.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 0 | N/A | unit | `pnpm vitest run tests/search/rate-limiter.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 0 | N/A | unit | `pnpm vitest run tests/search/add-tracking-entry.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 0 | SRCH-01, SRCH-02 | unit | `pnpm vitest run tests/search/anilist-adapter.test.ts -t "error"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/search/anilist-adapter.test.ts` — stubs for SRCH-01, SRCH-02 (mock fetch, verify query shape and response mapping)
- [ ] `tests/search/search-result-mapping.test.ts` — stubs for SRCH-03 (entity mapping: null title fallback, field extraction)
- [ ] `tests/search/rate-limiter.test.ts` — covers rate limiter token bucket (consume, refill, reject when empty)
- [ ] `tests/search/add-tracking-entry.test.ts` — covers add-to-list use case (validate input, check for duplicates)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Debounced input feels responsive | SRCH-01, SRCH-02 | UX perception — timing is subjective | Type a query, verify results appear after brief pause without flashing |
| Skeleton loading matches card layout | SRCH-03 | Visual layout verification | Search with throttled network, check skeleton cards match final layout |
| Toast notification appears on add | N/A | Visual feedback verification | Click "Add to list", verify toast appears and fades |
| URL syncs with search query | SRCH-01 | Browser behavior | Type query, verify URL updates; refresh page, verify query persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
