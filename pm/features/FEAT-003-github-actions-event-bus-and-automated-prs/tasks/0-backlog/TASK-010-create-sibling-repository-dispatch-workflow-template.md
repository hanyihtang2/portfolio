---
id: TASK-010
parent_feature: FEAT-003
title: "Create sibling repository dispatch workflow template"
status: backlog
priority: P1
areas:
  - automation/ci
target_paths:
  - pm/templates/notify-portfolio.yml
branch: feat/feat-003-dispatch-template
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-010: Create Sibling Repository Dispatch Workflow Template

## 1. Objective
Author a portable GitHub Actions workflow template (`pm/templates/notify-portfolio.yml`) that can be placed in `PlateMark`, `MAKER`, and `CommuteShift` to dispatch release events to the portfolio.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target secret: `PORTFOLIO_SYNC_PAT` in sibling repositories

## 3. Technical Implementation Details
- Triggers on:
  - `push: tags: ['v*.*.*']`
  - `workflow_dispatch` (manual test trigger)
- Action:
  - Uses `peter-evans/repository-dispatch@v3`
  - Sends `event-type: project-updated`
  - Payload parameters: `project`, `releaseTag`, `commitSha`, `actor`

## 4. Acceptance Criteria
- [ ] Valid YAML syntax conforming to GitHub Actions specs.
- [ ] Passes project slug and release tag reliably in client payload.
- [ ] Safe fallback when run on test branches.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Keep action pinned to verified commit SHAs or trusted major version tags (`@v3`).

