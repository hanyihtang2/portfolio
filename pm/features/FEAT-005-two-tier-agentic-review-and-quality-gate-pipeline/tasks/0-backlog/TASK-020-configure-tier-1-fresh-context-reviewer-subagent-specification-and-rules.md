---
id: TASK-020
parent_feature: FEAT-005
title: "Configure Tier 1 Fresh Context Reviewer Subagent Specification and Rules"
status: backlog           # backlog | in-progress | review | done
priority: P1              # P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
areas:
  - review/agentic
target_paths:
  - pm/standards/TIER_1_REVIEWER_SPEC.md
  - scripts/review/reviewer-prompt-template.md
  - .gemini/rules/reviewer-subagent.md
branch: feat/feat-005-configure-tier-1-fresh-context-reviewer-subagent-specification-and-rules
dependencies:
  - TASK-018
  - TASK-019
assigned_to: human        # human | agent:coder | agent:research
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-020: Configure Tier 1 Fresh Context Reviewer Subagent Specification and Rules

## 1. Objective
Define the operational specification, system prompt, tool constraints, and orchestration protocol for the Tier 1 Reviewer Subagent. This guarantees that the subagent evaluates code with zero conversational history, operates under strict read-only permissions, and communicates via the standardized review verdict contract.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md` (FEAT-005 Two-Tier Agentic Review and Quality Gate Pipeline)
- Review Contract: `pm/standards/AGENT_REVIEW_CONTRACT.md` (TASK-018)
- Evidence Input: Prepared by `scripts/review/prepare-evidence.ts` (TASK-019)

## 3. Technical Implementation Details
1. **Tier 1 Reviewer Subagent Specification (`pm/standards/TIER_1_REVIEWER_SPEC.md`):**
   - **Isolation Boundary:** The subagent must run in a separate context window from the primary coding agent. It receives only the Evidence Pack (PRD criteria, diff, area rules, build status).
   - **Permission Boundary (Least Privilege):** Read-only tools only (`read_file`, `search_files`, non-mutating terminal commands). The reviewer is strictly forbidden from directly editing source code files.
   - **Evaluation Axes:**
     1. Acceptance Criteria fulfillment (does the diff satisfy every item in the task checklist?).
     2. Edge case and error handling (null safety, unhandled rejections, boundary limits).
     3. Security posture (no unescaped inputs, no hardcoded secrets, no sensitive exposures).
     4. Scope containment (did the primary agent modify files outside `target_paths` or `pm/areas.json`?).

2. **Prompt Template (`scripts/review/reviewer-prompt-template.md`):**
   - A standardized system prompt for the reviewer subagent enforcing:
     - Anti-hallucination / Anti-nitpicking directives (ignore minor formatting unless covered by linter).
     - Grounding requirements (must cite exact file, line numbers, and a concrete failure scenario).
     - Output formatting conforming strictly to `pm/standards/schemas/review-verdict.schema.json`.

3. **Orchestration & Loop Control:**
   - **Iteration 1:** Primary agent finishes implementation -> triggers evidence compilation -> invokes Reviewer Subagent.
   - **Decision Gate:**
     - If `verdict === "PASS"`: Proceed to stage transition (`2-review`) and PR creation.
     - If `verdict === "CHANGES_REQUESTED"` and `iteration === 1`: Primary agent parses P0/P1 findings, modifies code, re-verifies build, and re-invokes reviewer for Iteration 2.
     - If `verdict === "CHANGES_REQUESTED"` and `iteration === 2`: Abort loop and escalate to human with full findings log.

4. **Agent Guidelines / Antigravity Rule (`.gemini/rules/reviewer-subagent.md`):**
   - Documented rules for Antigravity agents so any agent in this workspace knows how and when to invoke the reviewer subagent.

## 4. Acceptance Criteria
- [ ] `pm/standards/TIER_1_REVIEWER_SPEC.md` authored detailing lifecycle, tool permissions, and escalation rules.
- [ ] `scripts/review/reviewer-prompt-template.md` created with tested prompt instructions.
- [ ] Workspace rule `.gemini/rules/reviewer-subagent.md` documented and verified.
- [ ] Static build passes cleanly (`npm run build`).

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> - Ensure the prompt template explicitly bans vague advice like "consider refactoring for modularity." Every finding must be an actionable defect or missing test.

### Execution Log / Decisions
*(Leave blank for agent to fill during task execution)*
