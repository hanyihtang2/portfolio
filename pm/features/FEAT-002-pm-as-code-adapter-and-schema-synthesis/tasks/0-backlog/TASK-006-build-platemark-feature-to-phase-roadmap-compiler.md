---
id: TASK-006
parent_feature: FEAT-002
title: "Build PlateMark feature-to-phase roadmap compiler"
status: backlog
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/adapters/platemark-roadmap.ts
branch: feat/feat-002-roadmap-compiler
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-006: Build PlateMark Feature-to-Phase Roadmap Compiler

## 1. Objective
Build an adapter (`scripts/adapters/platemark-roadmap.ts`) that reads PlateMark's 17 features from `../PlateMark/pm/features/` and aggregates them into the 5 portfolio roadmap phases with accurate `status` (`Completed`, `In Progress`, `Planned`).

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target schema: `roadmap` array in `src/content.config.ts`

## 3. Technical Implementation Details
- Map `target_release` clusters:
  - `v0.1.0` & `v0.2.0` $\rightarrow$ Phase 1 (Geospatial Data Core & Map Viewport)
  - `v0.2.1` & `v0.3.0` & `v0.4.0` $\rightarrow$ Phase 2 (Tactile Bistro Design System & Mobile Atlas)
  - `v0.4.1` & `v0.4.2` & `v0.5.0` (in flight) $\rightarrow$ Phase 3 (Better Auth & Netlify Deployment)
  - `v0.4.0` (Directory & Add Place) $\rightarrow$ Phase 4 (Place Curation Workspace)
  - `v0.5.0` (Sharing) $\rightarrow$ Phase 5 (Collaborative Notebooks & Sharing)
- Compute aggregate completion status:
  - If all features in a phase are `completed` $\rightarrow$ `status: "Completed"`
  - If some are `completed` or `active` $\rightarrow$ `status: "In Progress"`
  - If all are `ready` or `draft` $\rightarrow$ `status: "Planned"`

## 4. Acceptance Criteria
- [ ] Returns 5 correctly structured phases matching the portfolio roadmap layout.
- [ ] Status correctly shifts as features complete in PlateMark.
- [ ] Type-checked against the `projects` collection schema.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Retain clean target quarter strings (`Q4 2026`, `Q1 2027`, `Q2 2027`).

