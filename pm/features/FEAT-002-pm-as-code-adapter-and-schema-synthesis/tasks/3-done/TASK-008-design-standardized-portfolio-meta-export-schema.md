---
id: TASK-008
parent_feature: FEAT-002
title: Design standardized portfolio-meta export schema
status: done
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/schemas/portfolio-meta.schema.json
  - pm/templates/portfolio-meta.example.json
branch: feat/feat-002-meta-schema
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-008: Design Standardized Portfolio-Meta Export Schema

## 1. Objective
Author a universal JSON Schema specification (`scripts/schemas/portfolio-meta.schema.json`) and example file that any sibling repository can implement (`npm run pm:export-portfolio`) to export its roadmap, tech stack, and metrics directly to the portfolio.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Motivation: Avoid writing custom brittle folder crawlers for every future project by defining an explicit export contract.

## 3. Technical Implementation Details
- JSON Schema Draft-07 format defining:
  - `slug`: string (e.g. `platemark`, `maker`, `commuteshift`)
  - `status`: enum `["Completed", "In Progress", "Concept"]`
  - `timeline`: string
  - `techStack`: languages, frameworks, tools, infrastructure
  - `metrics`: array of `{ label, value, description }`
  - `roadmap`: array of phases with `{ phase, title, status, targetQuarter, summary, deliverables }`
- Provide `pm/templates/portfolio-meta.example.json` for easy bootstrapping in MAKER.

## 4. Acceptance Criteria
- [x] Valid JSON Schema draft-07 specification.
- [x] Conforms exactly to Astro `src/content.config.ts` collection requirements.
- [x] Includes clear field documentation and validation rules.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure all optional and required fields match `src/content.config.ts` types.

