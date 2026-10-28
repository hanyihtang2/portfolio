---
id: TASK-007
parent_feature: FEAT-002
title: Extract task deliverables from completed tasks
status: done
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/adapters/platemark-deliverables.ts
branch: feat/feat-002-deliverables-extraction
dependencies:
  - TASK-006
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-007: Extract Task Deliverables from Completed Tasks

## 1. Objective
Create a function that scans `pm/features/<FEAT-ID>/tasks/3-done/` across PlateMark features and formats finished task titles into bulleted deliverable strings for the portfolio roadmap.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target field: `deliverables: string[]` under each phase in `roadmap`

## 3. Technical Implementation Details
- Parse task frontmatter `title` from each `TASK-*.md` in `3-done/`.
- Clean up title formatting (strip internal ticket IDs, capitalize cleanly).
- Limit to top 4–5 key milestone deliverables per phase to prevent UI clutter.
- Fallback gracefully to `prd.md` scope items if a feature has zero completed tasks yet.

## 4. Acceptance Criteria
- [x] Finished tasks in PlateMark appear as deliverables in the portfolio roadmap.
- [x] Deliverable titles read clearly for external visitors and recruiters.
- [x] No empty bullet points or unparsed template tags.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure string sanitization removes raw markdown delimiters or ticket prefixes.

