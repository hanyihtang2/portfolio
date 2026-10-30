---
id: TASK-022
parent_feature: FEAT-005
title: Create Cross-Repository Agentic Review Reference Guide and Rollout Kit
status: done
priority: P1
areas:
  - review/agentic
target_paths:
  - docs/guides/two-tier-agentic-review.md
branch: feat/feat-005-create-cross-repository-agentic-review-reference-guide-and-rollout-kit
dependencies:
  - TASK-018
  - TASK-019
  - TASK-020
  - TASK-021
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-30
---

# TASK-022: Create Cross-Repository Agentic Review Reference Guide and Rollout Kit

## 1. Objective
Author a comprehensive rollout guide and reference kit (`docs/guides/two-tier-agentic-review.md`) explaining the two-tier agentic review architecture and providing step-by-step copy-paste instructions for rolling it out to sibling repositories (PlateMark, MAKER, CommuteShift).

## 2. Context & PRD Reference
- Parent PRD: `../prd.md` (FEAT-005 Two-Tier Agentic Review and Quality Gate Pipeline)
- Serves as the canonical engineering blueprint referenced across all projects.

## 3. Technical Implementation Details
1. **Architectural Foundations & Rationale:**
   - Detailed explanation of single-agent context pollution and confirmation bias.
   - Why in-loop fresh-context subagents (Tier 1) beat post-hoc PR-only bots for the active fix loop.
   - Why Tier 2 PR workflows provide essential human-in-the-loop governance and organization-level auditing.

2. **Sibling Repository Adoption Checklist:**
   - Step 1: Copy `pm/standards/AGENT_REVIEW_CONTRACT.md` and verdict schema.
   - Step 2: Install or port `scripts/review/prepare-evidence.ts` (customizing the deterministic build command, e.g. `next build`, `vite build`, `turbo run test`).
   - Step 3: Install `.gemini/rules/reviewer-subagent.md` and prompt templates.
   - Step 4: Add `.github/pull_request_template.md` and `.github/workflows/agent-quality-gate.yml`.
   - Step 5: Configure branch protection rules requiring the quality gate to pass before human merge.

3. **Adapting to Different Tech Stacks:**
   - Customization recipes for:
     - **Monorepos (e.g. MAKER / Turbo):** Scoping diffs and package-level test runs.
     - **Single-Page Apps (e.g. CommuteShift):** Integrating React/Vite build checks.
     - **Full-Stack / Next.js (e.g. PlateMark):** Handling database migrations and API route contracts.

4. **Operational Playbook & Troubleshooting:**
   - Handling false-positive blocker claims.
   - Managing token costs and model selection (e.g., using lightweight fast models for evidence extraction vs. deep reasoning models for review).
   - Human escalation procedures when 2 review iterations fail.

## 4. Acceptance Criteria
- [x] `docs/guides/two-tier-agentic-review.md` created with comprehensive diagrams, checklists, and code snippets.
- [x] Includes copy-paste adoption recipes for PlateMark, MAKER, and CommuteShift.
- [x] Markdown links and cross-references to `pm/standards/` and `scripts/review/` are verified.
- [x] Static build passes cleanly (`npm run build`).

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> - Ensure this document reads like an elite engineering RFC and practical runbook.
> - Include concrete configuration examples rather than abstract descriptions.

### Execution Log / Decisions
- Authored comprehensive guide in `docs/guides/two-tier-agentic-review.md`.
- Documented single-agent context pollution and confirmation bias problem space.
- Provided 5-step adoption checklist for sibling repositories (PlateMark, MAKER, CommuteShift).
- Authored concrete configuration recipes for monorepos (Turborepo), SPAs (Vite/React), and full-stack apps (Next.js/Drizzle).
- Defined operational runbook covering false-positive mitigation, token optimization, and escalation protocol.
- Verified build and markdown links cleanly.
