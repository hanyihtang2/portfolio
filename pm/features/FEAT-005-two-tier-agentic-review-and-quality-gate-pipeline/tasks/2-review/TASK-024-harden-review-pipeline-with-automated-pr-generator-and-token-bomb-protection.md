---
id: TASK-024
parent_feature: FEAT-005
title: Harden Review Pipeline with Automated PR Generator and Token-Bomb Protection
status: review
priority: P1
areas:
  - review/agentic
  - automation/ci
  - sync/cli
target_paths:
  - scripts/review/prepare-evidence.ts
  - scripts/review/generate-pr-body.ts
  - scripts/review/prepare-pr.ts
  - scripts/review/verdict.ts
  - package.json
  - pm/standards/TIER_1_REVIEWER_SPEC.md
branch: feat/feat-005-harden-review-pipeline-and-pr-generator
dependencies:
  - TASK-019
  - TASK-021
assigned_to: human
created_at: 2026-10-30
updated_at: 2026-10-30
---

# TASK-024: Harden Review Pipeline with Automated PR Generator and Token-Bomb Protection

## 1. Objective
Harden the Two-Tier Agentic Review pipeline before extracting to a standalone ways-of-working repository by:
1. Eliminating git diff token-bombs (excluding lockfiles, media, and build artifacts, with truncation safety caps).
2. Implementing an automated PR description generator (`agent:pr-body`) that matches Tier 2 CI validation requirements exactly.
3. Adding deterministic schema validation and persistence for Tier 1 review verdicts (`.review/verdict-<task-id>.json`).
4. Creating an end-to-end `agent:prepare-pr` CLI command that automates task stage movement (`1-in-progress` -> `2-review`), Kanban regeneration, and PR body formatting.

## 2. Context & Standards
- Governing Feature: `pm/features/FEAT-005-two-tier-agentic-review-and-quality-gate-pipeline/prd.md`
- Tier 2 Quality Gate: `.github/workflows/agent-quality-gate.yml`
- Machine-Readable Schema: `pm/standards/schemas/review-verdict.schema.json`
- Review Contract: `pm/standards/AGENT_REVIEW_CONTRACT.md`

## 3. Acceptance Criteria
- [x] `scripts/review/prepare-evidence.ts` filters out lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), media, binary files, and `.review/` artifacts from git diffs with a 50KB safety truncation limit.
- [x] Configurable deterministic check command supported via environment or `areas.json`.
- [x] Machine-readable review verdict persistence and schema validation implemented (`scripts/review/verdict.ts`).
- [x] Automated PR body generator implemented (`scripts/review/generate-pr-body.ts`) producing markdown that directly satisfies all 5 required sections and JSON verdict format of `.github/workflows/agent-quality-gate.yml`.
- [x] Integrated `npm run agent:prepare-pr <task-id>` command implemented that verifies deterministic pass, validates verdict, auto-moves task to `2-review`, regenerates Kanban/Roadmap, and outputs the PR description.
- [x] `package.json` scripts updated with `agent:pr-body` and `agent:prepare-pr`.
- [x] Verification tests passing cleanly (`npm run build`).
