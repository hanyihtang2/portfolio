---
id: TASK-004
parent_feature: FEAT-001
title: "Implement CommuteShift SPA extractor"
status: backlog
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/extractors/commuteshift.ts
branch: feat/feat-001-commuteshift-extractor
dependencies:
  - TASK-001
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-004: Implement CommuteShift SPA Extractor

## 1. Objective
Develop an extractor module (`scripts/extractors/commuteshift.ts`) that inspects `../CommuteShift/`, extracting Vite build configs, React version, Vercel deployment status, and test suite verification metrics.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target repo: `c:\Users\hanyi\projects\CommuteShift`
- Target file: `src/content/projects/commuteshift.md`

## 3. Technical Implementation Details
- Check if `../CommuteShift` exists.
- Read `package.json` for React 18, Vite 5, Tailwind CSS, Lucide.
- Check `vercel.json` for hosting metadata.
- Inspect `test-all.mjs` to extract automated fare matrix coverage (Zones 1–6 Peak/Off-Peak/Daily Cap).
- Verify git release tags or branch state.

## 4. Acceptance Criteria
- [ ] Correctly identifies React 18, Vite 5, Tailwind CSS, and Vercel infrastructure.
- [ ] Returns valid partial frontmatter conforming to `src/content.config.ts`.
- [ ] Safe fallback when run on machines where CommuteShift is not locally present.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Match schema expectations defined in `src/content.config.ts`.

