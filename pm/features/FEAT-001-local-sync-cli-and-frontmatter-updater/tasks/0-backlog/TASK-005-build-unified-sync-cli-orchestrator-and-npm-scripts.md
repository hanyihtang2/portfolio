---
id: TASK-005
parent_feature: FEAT-001
title: "Build unified sync CLI orchestrator and npm scripts"
status: backlog
priority: P0
areas:
  - sync/cli
target_paths:
  - scripts/sync-projects.ts
  - package.json
branch: feat/feat-001-sync-orchestrator
dependencies:
  - TASK-001
  - TASK-002
  - TASK-003
  - TASK-004
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-005: Build Unified Sync CLI Orchestrator and npm Scripts

## 1. Objective
Create the main CLI entrypoint (`scripts/sync-projects.ts`) and wire npm scripts in `package.json` to allow one-command execution across all sibling repositories.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Tasks: `TASK-001` through `TASK-004`
- Command: `npm run sync:projects`

## 3. Technical Implementation Details
- CLI flags support:
  - `--project <slug>`: Sync only one project (e.g. `platemark`)
  - `--dry-run`: Log changes without writing files
  - `--verbose`: Show detailed inspection logs
- Sibling mapping configuration:
  - `platemark` $\rightarrow$ `../PlateMark` $\rightarrow$ `src/content/projects/platemark.md`
  - `maker` $\rightarrow$ `../MAKER` $\rightarrow$ `src/content/projects/maker.md`
  - `commuteshift` $\rightarrow$ `../CommuteShift` $\rightarrow$ `src/content/projects/commuteshift.md`
- Script registration in `package.json`:
  - `"sync:projects": "node --experimental-strip-types scripts/sync-projects.ts"`
  - `"sync:platemark": "node --experimental-strip-types scripts/sync-projects.ts --project platemark"`

## 4. Acceptance Criteria
- [ ] Running `npm run sync:projects` executes cleanly with Node 26.
- [ ] Terminal outputs an aesthetic summary of scanned repositories and changes.
- [ ] `npm run build` passes with zero errors following a sync run.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure graceful exit code 0 when sibling repos are missing or skipped.

