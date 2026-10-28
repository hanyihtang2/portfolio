---
id: TASK-009
parent_feature: FEAT-002
title: "Calculate live repository operational metrics"
status: backlog
priority: P2
areas:
  - sync/cli
target_paths:
  - scripts/adapters/metrics-calculator.ts
branch: feat/feat-002-metrics-calc
dependencies:
  - TASK-006
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-009: Calculate Live Repository Operational Metrics

## 1. Objective
Build a metrics calculator (`scripts/adapters/metrics-calculator.ts`) that extracts live engineering indicators (test assertion count, PM-as-Code feature count, Git commit counts) to populate the portfolio's top key metrics cards.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Visual target: Key metrics stat cards at the top of `/projects/[slug]`

## 3. Technical Implementation Details
- Extract from PlateMark:
  - Count test files or test assertions in `src/**/*.test.ts*` (e.g. `52+ Tests`).
  - Count features in `pm/features/` (e.g. `17 Initiatives`).
- Extract from MAKER:
  - Count shared workspace packages (e.g. `5 Packages`).
- Extract from CommuteShift:
  - Fare matrix test suite verification rate (e.g. `100% Passing`).

## 4. Acceptance Criteria
- [ ] Outputs four structured metrics `{ label, value, description }` per project.
- [ ] Values reflect real numbers discovered in the repositories.
- [ ] Gracefully falls back to existing values if tests/features cannot be counted.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Keep calculation fast (< 200ms) without running full test suites.

