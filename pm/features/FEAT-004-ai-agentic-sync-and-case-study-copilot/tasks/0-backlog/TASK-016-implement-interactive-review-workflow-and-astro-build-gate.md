---
id: TASK-016
parent_feature: FEAT-004
title: "Implement interactive review workflow and Astro build gate"
status: backlog
priority: P1
areas:
  - sync/cli
  - content/projects
target_paths:
  - scripts/agent/verify-case-study.ts
branch: feat/feat-004-review-gate
dependencies:
  - TASK-015
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-016: Implement Interactive Review Workflow and Astro Build Gate

## 1. Objective
Build an automated verification check (`scripts/agent/verify-case-study.ts`) that validates any AI-drafted case-study markdown file against Astro's Content Layer schema and static build checks prior to committing.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target command: `npm run build`

## 3. Technical Implementation Details
- Validates:
  - Schema conformity (all required frontmatter keys present, dates valid, URLs valid).
  - Heading hierarchy (H2 and H3 structures used for jump-to navigation).
  - Markdown image links resolve to real files in `public/`.
  - Astro static build passes without warnings or errors.
- Output actionable diagnostic error messages if validation fails.

## 4. Acceptance Criteria
- [ ] Catches broken image references, unclosed code fences, and invalid frontmatter enums.
- [ ] Runs `npm run build` and reports timing and static route outputs.
- [ ] Provides 100% confidence before git commits are cut.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Integrate directly into agent workflows as a mandatory pre-commit hook.

