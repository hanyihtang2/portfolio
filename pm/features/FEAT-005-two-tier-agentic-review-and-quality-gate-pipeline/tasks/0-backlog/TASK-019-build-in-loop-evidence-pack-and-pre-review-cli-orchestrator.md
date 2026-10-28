---
id: TASK-019
parent_feature: FEAT-005
title: "Build In-Loop Evidence Pack and Pre-Review CLI Orchestrator"
status: backlog           # backlog | in-progress | review | done
priority: P1              # P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
areas:
  - review/agentic
  - sync/cli
target_paths:
  - scripts/review/prepare-evidence.ts
  - scripts/review/types.ts
  - package.json
branch: feat/feat-005-build-in-loop-evidence-pack-and-pre-review-cli-orchestrator
dependencies:
  - TASK-018
assigned_to: human        # human | agent:coder | agent:research
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-019: Build In-Loop Evidence Pack and Pre-Review CLI Orchestrator

## 1. Objective
Build an automated CLI tool that generates a self-contained "Evidence Pack" (Prompt Request) before a task is handed off to a reviewer subagent or pushed to a PR. The tool runs deterministic checks, extracts the git diff, queries `pm/areas.json` for touched domain rules, and compiles an isolated prompt bundle.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md` (FEAT-005 Two-Tier Agentic Review and Quality Gate Pipeline)
- Standards: Governed by `pm/standards/AGENT_REVIEW_CONTRACT.md` (TASK-018).

## 3. Technical Implementation Details
1. **CLI Script (`scripts/review/prepare-evidence.ts`):**
   - Provide an npm script: `npm run agent:review-pack [task-id] [base-branch]`.
   - Default `base-branch` to `main` (or `origin/main`).

2. **Deterministic Pre-Check Runner:**
   - Automatically executes:
     - TypeScript verification (`astro check` or `tsc --noEmit`).
     - Static build (`npm run build`).
   - If deterministic checks fail, abort immediately with error logs (LLM review must never waste tokens on code that does not build).

3. **Dynamic Context & Area Matching:**
   - Collects list of changed files via `git diff --name-only <base>...HEAD`.
   - Inspects `pm/areas.json` to find all area keys that match the changed file paths.
   - Includes relevant area descriptions and tech stack constraints in the output pack (progressive disclosure).

4. **Task Spec Extraction:**
   - Reads the specified task file (`pm/features/.../tasks/*/<task-id>*.md`).
   - Extracts the Objective, Acceptance Criteria checklist, and Target Paths.

5. **Evidence Pack Compilation (`.review/evidence-pack-[task-id].md`):**
   - Combines:
     1. Task Metadata & Acceptance Criteria.
     2. Matched Architectural Rules & Constraints.
     3. Deterministic Verification Logs (Build status: SUCCESS).
     4. Clean Git Diff (`git diff <base>...HEAD`).
   - Formats the pack so it is ready to be directly consumed by a fresh-context reviewer subagent.

## 4. Acceptance Criteria
- [ ] `scripts/review/prepare-evidence.ts` implemented in TypeScript using native node APIs.
- [ ] Script handles both committed branch diffs and staged working-tree changes cleanly.
- [ ] Added `npm run agent:review-pack` script to `package.json`.
- [ ] Generates well-formed markdown evidence pack in `.review/` directory (gitignored).
- [ ] Deterministic failure halts the process with actionable error reporting.
- [ ] Astro static build (`npm run build`) succeeds cleanly.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> - Keep the script zero-dependency outside existing repository modules.
> - Ensure `.review/` is added to `.gitignore` so generated evidence packs do not pollute git history.

### Execution Log / Decisions
*(Leave blank for agent to fill during task execution)*
