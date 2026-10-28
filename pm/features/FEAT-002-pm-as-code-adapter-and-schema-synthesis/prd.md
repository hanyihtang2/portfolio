---
id: FEAT-002
title: "PM-as-Code Adapter and Dynamic Roadmap Synthesizer"
status: completed
priority: P1
target_release: v0.2.0
lead: human
created_at: 2026-10-28
branch_prefix: feat/feat-002-pm-adapter
areas:
  - sync/cli
  - content/projects
---

# PRD: PM-as-Code Adapter and Dynamic Roadmap Synthesizer (Phase 2)

## 1. Executive Summary & Problem Statement
While Phase 1 synchronizes high-level tech stacks and status strings, deep project management data—specifically the interactive product roadmap, phase statuses, and completed deliverables—remains manually maintained. 

PlateMark pioneers repository-native PM-as-Code with 17 features and 40+ granular tasks organized into `0-backlog`, `1-in-progress`, `2-review`, and `3-done`. This feature builds a compiler that translates PlateMark's version-controlled PM system directly into the portfolio's 5-phase roadmap schema, dynamically computing progress percentages and pulling verified milestone deliverables. It also standardizes a `portfolio-meta.json` export spec for MAKER and CommuteShift.

---

## 2. User Stories
- **As a portfolio visitor**, I want to click the "Product Roadmap" tab on PlateMark and see real-time milestone progress reflecting merged pull requests and finished tasks.
- **As the product engineer**, I want task deliverables in my portfolio roadmap to update automatically as tasks move into `3-done` in the source repository.
- **As an engineering leader**, I want to inspect a clear, standardized JSON export format (`portfolio-meta.json`) that any repository can implement to feed the portfolio.

---

## 3. Scope & Key Capabilities

### In Scope
- **PlateMark Feature-to-Phase Roadmap Compiler**:
  - Groups PlateMark's 17 features by `target_release` (`v0.1.0` - `v0.5.0`) into 5 clean portfolio phases:
    1. Phase 1: Spatial Data Schema & Map Viewport (`Completed`)
    2. Phase 2: Design System, Multi-Axis Filtering & Mobile Atlas (`Completed`)
    3. Phase 3: Better Auth Allowlist & Netlify Deployment (`In Progress`)
    4. Phase 4: Place Curation Workspace & Geocoding (`Planned`)
    5. Phase 5: Collaborative Notebooks & Sharing (`Planned`)
- **Automated Deliverables Extraction**:
  - Reads Markdown files inside `tasks/3-done/` and extracts task titles as completed deliverables (`deliverables: [...]`).
- **Standardized `portfolio-meta.json` Export Specification**:
  - Schema definition allowing other repositories (MAKER, CommuteShift) to export roadmap and metric objects without requiring the portfolio to parse their internal folder structures.
- **Live Metrics Calculation**:
  - Counts total shipped features, task completion rates (`done / total`), and test suite assertions.

### Out of Scope
- Automated Git tag pushing (covered in Phase 3).
- Rewriting case study paragraphs (covered in Phase 4).

---

## 4. Technical Architecture & Constraints
- **Primary Code Areas**: `scripts/adapters/`, `scripts/extractors/`, `pm/areas.json`.
- **Schema Compliance**: Deliverables and phases must strictly adhere to the `roadmap` schema defined in `src/content.config.ts`.
- **Resilience**: If a feature folder has no done tasks, default to deliverables defined in `prd.md`.

---

## 5. Acceptance Criteria
- [x] Portfolio roadmap items for PlateMark match `pm/ROADMAP.md` task execution counts.
- [x] Deliverable bullet points reflect actual merged tasks in `tasks/3-done/`.
- [x] `portfolio-meta.json` schema is documented with a valid JSON schema draft-07.
- [x] `npm run build` succeeds cleanly with the generated roadmap data.

---

## 6. Task Breakdown Index
- [x] `TASK-006`: Build PlateMark feature-to-phase roadmap compiler
- [x] `TASK-007`: Extract task deliverables from completed tasks (`tasks/3-done/`)
- [x] `TASK-008`: Design standardized `portfolio-meta.json` export schema
- [x] `TASK-009`: Calculate live repository operational metrics

