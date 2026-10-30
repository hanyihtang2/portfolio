---
id: TASK-015
parent_feature: FEAT-004
title: Build Git diff and commit synthesizer for narrative drafting
status: done
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/agent/synthesize-commits.ts
branch: feat/feat-004-commit-synthesizer
dependencies:
  - TASK-014
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-30
---

# TASK-015: Build Git Diff and Commit Synthesizer for Narrative Drafting

## 1. Objective
Create a helper script (`scripts/agent/synthesize-commits.ts`) that extracts commit logs and diff summaries between the portfolio's last sync date and current `HEAD` of a sibling repository to feed into the AI agent prompt.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target paths: `scripts/agent/`

## 3. Technical Implementation Details
- Read last `publishDate` or sync commit timestamp from `src/content/projects/<slug>.md`.
- Run `git log --since="<date>" --oneline` in the sibling repository.
- Filter out merge commits and style chores.
- Categorize commits by conventional commit prefix (`feat`, `fix`, `perf`, `refactor`).
- Output a compact Markdown summary ready for AI contextual consumption.

## 4. Acceptance Criteria
- [x] Successfully queries git history across sibling directories.
- [x] Filters out noise (e.g. formatting and lint fix commits).
- [x] Produces clean summary under 1,000 tokens for efficient LLM context loading.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure script runs via child_process without requiring external git libraries.

### Execution Log / Decisions
- Implemented `scripts/agent/synthesize-commits.ts` with zero external dependencies using `node:child_process` and `node:fs`.
- Supported `--project <slug>`, `--limit <n>`, `--since <date>`, and `--all` flags.
- Added conventional commit parsing and categorization (`feat`, `perf`, `refactor`, `fix`, `docs`).
- Added deep integration with `pm/features/` to inspect closed PRDs and finished task deliverables.
- Verified live execution against `../PlateMark`, generating a structured synthesis summary.

