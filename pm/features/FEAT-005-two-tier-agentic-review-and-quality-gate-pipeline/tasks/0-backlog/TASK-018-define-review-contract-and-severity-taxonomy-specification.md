---
id: TASK-018
parent_feature: FEAT-005
title: "Define Review Contract and Severity Taxonomy Specification"
status: backlog           # backlog | in-progress | review | done
priority: P1              # P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
areas:
  - review/agentic
target_paths:
  - pm/standards/AGENT_REVIEW_CONTRACT.md
  - pm/standards/schemas/review-verdict.schema.json
branch: feat/feat-005-define-review-contract-and-severity-taxonomy-specification
dependencies: []
assigned_to: human        # human | agent:coder | agent:research
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-018: Define Review Contract and Severity Taxonomy Specification

## 1. Objective
Establish the foundational specification, severity classification rules, and machine-readable schema for all automated agent reviews across the portfolio and sibling projects. This prevents subjective bikeshedding and ensures reviewer subagents produce structured, actionable verdicts.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md` (FEAT-005 Two-Tier Agentic Review and Quality Gate Pipeline)
- Sibling areas: Maps to `pm/areas.json` under `review/agentic`.

## 3. Technical Implementation Details
1. **Severity Taxonomy Definition (`pm/standards/AGENT_REVIEW_CONTRACT.md`):**
   - **P0 (Blocker):** Code fails deterministic gates (`npm run build`, typecheck), breaks declared Acceptance Criteria in task/PRD, introduces unhandled runtime exceptions, breaks data integrity, or introduces security vulnerabilities (leaked secrets, injection, path traversal). **Triggers mandatory fix loop.**
   - **P1 (High):** Missing test coverage for new edge cases, breaking API contract changes without deprecation, missing error boundaries, or violation of directory boundaries specified in `pm/areas.json`. **Triggers mandatory fix loop.**
   - **P2 (Nit / Suggestion):** Readability improvements, optional refactors, comment clarifications. **Never blocks merge; included as optional suggestions.**

2. **Proof-of-Defect Requirement:**
   - Every P0/P1 finding must include concrete evidence:
     - Exact file path and line numbers in the diff.
     - The broken acceptance criterion or specific execution trace (e.g., *"Calling `extractMeta()` with an empty string throws TypeError on line 48"*).
     - Concrete suggested fix or snippet.

3. **Machine-Readable Verdict Schema (`pm/standards/schemas/review-verdict.schema.json`):**
   - JSON Schema defining the structured output from reviewer agents:
     - `verdict`: `"PASS"` | `"CHANGES_REQUESTED"`
     - `iteration`: integer (1 or 2)
     - `summary`: string
     - `findings`: array of `{ id, severity, file, line_start, line_end, criterion_id, description, evidence, suggested_fix }`
     - `blocking_count`: integer (sum of P0 + P1)

4. **Loop Termination Contract:**
   - PASS: If `blocking_count === 0`.
   - Iteration Limit: Hard ceiling of 2 iterations. If blockers persist after 2 passes, status transitions to `ESCALATED_TO_HUMAN` with a structured blocker breakdown.

## 4. Acceptance Criteria
- [ ] `pm/standards/AGENT_REVIEW_CONTRACT.md` authored with clear explanations, concrete examples, and anti-patterns.
- [ ] `pm/standards/schemas/review-verdict.schema.json` created and valid against Draft-07 JSON Schema.
- [ ] Zero build regressions (`npm run build` succeeds).
- [ ] Preserves all existing code and documentation integrity.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> - Ensure this document is modular and generalizable so sibling projects (PlateMark, MAKER, CommuteShift) can import or reference it with zero modifications.
> - Focus on strict, unambiguous rules rather than vague prose.

### Execution Log / Decisions
*(Leave blank for agent to fill during task execution)*
