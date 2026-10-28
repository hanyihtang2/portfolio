---
id: TASK-011
parent_feature: FEAT-003
title: "Build portfolio receiver workflow for repository_dispatch"
status: backlog
priority: P1
areas:
  - automation/ci
target_paths:
  - .github/workflows/project-sync.yml
branch: feat/feat-003-receiver-workflow
dependencies:
  - TASK-010
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-011: Build Portfolio Receiver Workflow for repository_dispatch

## 1. Objective
Create `.github/workflows/project-sync.yml` in the portfolio repository to handle incoming `project-updated` events, checkout the portfolio, and execute headless project synchronization.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target path: `.github/workflows/project-sync.yml`

## 3. Technical Implementation Details
- Triggers on:
  ```yaml
  on:
    repository_dispatch:
      types: [project-updated]
    workflow_dispatch:
      inputs:
        project:
          description: 'Project slug to sync'
          required: true
          default: 'platemark'
  ```
- Workflow steps:
  1. `actions/checkout@v4` with write permissions.
  2. `actions/setup-node@v4` with Node 24 and cache.
  3. `npm ci`
  4. Run headless sync command targeting `github.event.client_payload.project`.
  5. Run `npm run build` as a verification sanity check.

## 4. Acceptance Criteria
- [ ] Workflow correctly parses payload parameters (`client_payload.project`).
- [ ] Runs build check to guarantee no invalid markdown is introduced.
- [ ] Fails gracefully with actionable logs if sync errors occur.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Grant minimal required permissions in YAML: `contents: write`, `pull-requests: write`.

