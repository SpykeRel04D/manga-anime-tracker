---
phase: 5
slug: list-ui-and-browsing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.mts` |
| **Quick run command** | `pnpm test -- --reporter=verbose tests/list/` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --reporter=verbose tests/list/`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | LIST-01 | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | LIST-02 | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | LIST-02 | unit | `pnpm test -- tests/list/get-status-counts.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-04 | 01 | 1 | LIST-03 | unit | `pnpm test -- tests/list/get-tracking-list.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-05 | 01 | 1 | LIST-04 | unit | `pnpm test -- tests/list/get-media-details.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/list/get-tracking-list.test.ts` — stubs for LIST-01, LIST-02, LIST-03 (mock `db` pattern from existing `tests/tracking/*.test.ts`)
- [ ] `tests/list/get-status-counts.test.ts` — stubs for LIST-02 count tab behavior
- [ ] `tests/list/get-media-details.test.ts` — stubs for LIST-04 adapter method (mock `fetch` + `anilistRateLimiter`)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cover image grid responsive layout (2/3-4/5-6 cols) | LIST-01 | Visual layout verification | Resize browser to mobile/tablet/desktop breakpoints, verify column counts |
| Status badge and progress indicator display | LIST-01 | Visual rendering | Check grid cards show correct badge colors and episode/chapter counts |
| Infinite scroll pagination | LIST-01 | Scroll behavior | Scroll to bottom of list, verify next page loads seamlessly |
| Filter tab UI interaction | LIST-02 | Interactive UI | Click each status tab, verify list updates and URL params change |
| Sort dropdown UI interaction | LIST-03 | Interactive UI | Select each sort option, verify list reorders and URL params change |
| Detail page metadata display | LIST-04 | Visual layout | Click a tracked entry, verify synopsis, genres, studios, relations render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
