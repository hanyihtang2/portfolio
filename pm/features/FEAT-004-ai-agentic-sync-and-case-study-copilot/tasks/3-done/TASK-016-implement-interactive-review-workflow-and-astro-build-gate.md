---
id: TASK-016
parent_feature: FEAT-004
title: Implement interactive review workflow and Astro build gate
status: done
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
updated_at: 2026-10-30
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
- [x] Catches broken image references, unclosed code fences, and invalid frontmatter enums.
- [x] Runs `npm run build` and reports timing and static route outputs.
- [x] Provides 100% confidence before git commits are cut.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Integrate directly into agent workflows as a mandatory pre-commit hook.

### Execution Log / Decisions
- Created `scripts/agent/verify-case-study.ts` with comprehensive frontmatter, image asset, and markdown syntax checks.
- Validated required fields (`title`, `description`, `publishDate`, `tags`, `status`), URLs, metrics structure, and roadmap phase completeness.
- Verified that referenced mockup images physically exist inside `public/`.
- Integrated full Astro static build verification gate (`npm run build` with `astro check && astro build`).
- Tested across all project files (`--all`) and individually (`--slug platemark`), verifying 0 errors.

