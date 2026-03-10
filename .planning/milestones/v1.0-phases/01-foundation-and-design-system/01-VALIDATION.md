---
phase: 1
slug: foundation-and-design-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-08
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.mts` — Wave 0 installs |
| **Quick run command** | `pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm vitest run && pnpm build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run --reporter=verbose`
- **After every plan wave:** Run `pnpm vitest run && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | INFR-03 | smoke | `make up && make halt` | N/A | ⬜ pending |
| 01-01-02 | 01 | 0 | INFR-01 | smoke | `pnpm build` | N/A | ⬜ pending |
| 01-01-03 | 01 | 0 | INFR-04 | unit | `pnpm vitest run tests/architecture/structure.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | INFR-02 | integration | `pnpm vitest run tests/db/connection.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | DSGN-01 | unit | `pnpm vitest run tests/theme/variables.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | DSGN-02 | manual-only | Visual check at multiple viewports | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.mts` — Vitest configuration with path aliases
- [ ] `pnpm add -D vitest @vitejs/plugin-react` — Install test framework
- [ ] `tests/architecture/structure.test.ts` — Verify hexagonal folder structure exists
- [ ] `tests/db/connection.test.ts` — Drizzle PostgreSQL connection test
- [ ] `tests/theme/variables.test.ts` — Theme CSS variables defined correctly

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive grid adapts across breakpoints | DSGN-02 | CSS grid layout not testable in JSDOM | Open browser, resize from 320px to 1920px, verify 2→3→4→5→6 columns |
| Warm dark theme visual appearance | DSGN-01 | Color perception requires visual check | Verify amber accents, warm dark background, soft borders in browser |
| `make up` starts dev environment | INFR-03 | Requires Docker runtime | Run `make up`, verify Next.js loads at localhost:3000 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
