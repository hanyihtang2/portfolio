---
id: {{FEATURE_ID}}
title: {{FEATURE_TITLE}}
status: draft             # draft | ready | active | completed | archived
priority: P1              # P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
target_release: v0.1.0
lead: human
created_at: {{DATE}}
branch_prefix: feat/{{FEATURE_SLUG}}
areas:
  - {{PRIMARY_AREA}}
---

# PRD: {{FEATURE_TITLE}}

## 1. Executive Summary & Problem Statement
*What problem are we solving for the portfolio, its visitors, or development workflows? Why now?*

## 2. User Stories
- **As a** [visitor / recruiter / developer]
- **I want to** [action]
- **So that** [value / outcome]

## 3. Scope & Key Capabilities
### In Scope
- [Feature capability 1]
- [Feature capability 2]

### Out of Scope
- [Explicit non-goals for this release milestone]

## 4. User Experience & Flows
*Describe screen layouts, interactive behaviors, terminal outputs, or automation sequences.*

## 5. Technical Architecture & Constraints
- **Primary Code Areas**: (See `pm/areas.json`)
- **Impacted Files & Collections**: (e.g. `src/content/projects/`, `scripts/`)
- **Dependencies & Tools**: (e.g. TypeScript, AST tools, GitHub Actions)
- **Constraints**: (Zero build regressions, offline safety, preserving case-study narrative prose)

## 6. Acceptance Criteria
- [ ] Core happy path functional and verified
- [ ] Edge cases handled cleanly
- [ ] Static build passes with zero errors (`npm run build`)
- [ ] Code formatted and linted cleanly

## 7. Task Breakdown Index
*Tasks are tracked in `tasks/` under `0-backlog`, `1-in-progress`, `2-review`, and `3-done`.*
- [ ] `TASK-001`: [Title]
- [ ] `TASK-002`: [Title]
