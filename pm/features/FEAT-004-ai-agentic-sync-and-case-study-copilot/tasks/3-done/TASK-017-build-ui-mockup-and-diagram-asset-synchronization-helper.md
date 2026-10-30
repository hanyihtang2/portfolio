---
id: TASK-017
parent_feature: FEAT-004
title: Build UI mockup and diagram asset synchronization helper
status: done
priority: P2
areas:
  - sync/cli
  - content/projects
target_paths:
  - scripts/agent/sync-mockups.ts
branch: feat/feat-004-mockup-sync
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-30
---

# TASK-017: Build UI Mockup and Diagram Asset Synchronization Helper

## 1. Objective
Develop a script (`scripts/agent/sync-mockups.ts`) to discover new screenshot mockups, architecture diagrams, and preview images in sibling repositories and copy/optimize them for the portfolio's `public/images/projects/` directory.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Visual target: Desktop and mobile mockup showcase at top of case studies

## 3. Technical Implementation Details
- Scan sibling public folders (e.g. `../PlateMark/public/`, `../CommuteShift/public/`).
- Identify high-resolution PNG/WebP assets matching project naming patterns (`*-mockup.png`, `*-mobile.png`).
- Copy to `public/images/projects/<project-slug>-mockup.png`.
- Update `mockupImage`, `mockupCaption`, `mobileMockupImage`, `mobileMockupCaption` in frontmatter.

## 4. Acceptance Criteria
- [x] Safely copies assets without overwriting custom cropped hero images.
- [x] Updates frontmatter image paths to match `/images/projects/...`.
- [x] Verifies file presence in `public/` before updating frontmatter.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure paths use web-standard forward slashes.

### Execution Log / Decisions
- Built `scripts/agent/sync-mockups.ts` scanning sibling repositories (`PlateMark`, `MAKER`, `CommuteShift`) for desktop, mobile, and architectural diagram assets.
- Integrated safety checks: avoids overwriting existing target images unless `--force` is passed.
- Added `--dry-run` flag to preview proposed file operations before touching disk.
- Automatically links with `updateProjectFrontmatter` to update `mockupImage` and `mobileMockupImage` in `src/content/projects/<slug>.md`.

