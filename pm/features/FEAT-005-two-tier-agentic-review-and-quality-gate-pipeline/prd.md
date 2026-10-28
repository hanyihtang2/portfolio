---
id: FEAT-005
title: Two-Tier Agentic Review and Quality Gate Pipeline
status: ready
priority: P1
target_release: v0.5.0
lead: human
created_at: 2026-10-28
branch_prefix: feat/two-tier-agentic-review-and-quality-gate-pipeline
areas:
  - review/agentic
  - automation/ci
  - sync/cli
---

# PRD: Two-Tier Agentic Review and Quality Gate Pipeline

## 1. Executive Summary & Problem Statement

As agentic coding becomes the primary mode of feature development across the portfolio and sibling projects (PlateMark, MAKER, CommuteShift), code quality and verification face two critical failure modes:

1. **Self-Review Blindness (In-Session):** A primary coding agent that writes code accumulates tens of thousands of tokens of trial-and-error, terminal errors, and intermediate reasoning. When asked to review its own output, it suffers from **confirmation bias** and **intent anchoring**—evaluating what it intended to write rather than what is actually in the code.
2. **Post-Hoc PR Latency & Disconnected Fix Loops (Remote CI):** Relying solely on PR-stage bots (e.g., CodeRabbit or webhook agents) disconnects the review from the coding session. By the time a PR comment is posted on GitHub, the primary agent's execution context is terminated. Re-triggering automated fixes across PR webhooks creates slow feedback loops, noisy git histories, and high token costs.

**Solution:**
A **Two-Tier Agentic Review Model**:
- **Tier 1 (Inner Loop / Pre-PR):** A fresh-context subagent evaluates the branch diff locally against task acceptance criteria *before* commits or PRs are finalized. If blocking issues (P0/P1) are found, the primary agent corrects them in the active session (bounded to max 1–2 iterations).
- **Tier 2 (Outer Loop / PR & CI Gate):** Once Tier 1 passes and deterministic tests pass, a pull request is opened accompanied by an automated **Evidence Pack** (Prompt Request). A lightweight PR workflow runs CI checks and provides a structured risk assessment for the human engineer who holds the merge button.

This initiative implements the complete two-tier pipeline in this portfolio repository and packages it as a reusable blueprint for sibling repositories.

---

## 2. User Stories

- **As a Developer / Architect**, I want coding agents to submit clean, pre-verified pull requests accompanied by proof of execution and independent review verdicts so that I can review and merge with high confidence without parsing messy trial-and-error git history.
- **As a Primary Coding Agent**, I want an independent reviewer subagent with fresh context to audit my git diff against acceptance criteria before I finish my task so that I catch edge cases and regressions while my development environment is still active.
- **As a Reviewer Subagent**, I want a structured evidence pack (clean diff, target specs, and local test logs) without the noisy conversational history of the primary agent so that I can objectively identify bugs, security issues, and spec deviations.
- **As an Engineering Team Lead**, I want a standardized rollout kit so that sibling projects (PlateMark, MAKER, CommuteShift) can adopt the exact same review contracts and quality gates.

---

## 3. Scope & Key Capabilities

### In Scope
- **Review Contract & Severity Taxonomy:** Standardized classification (`P0 Blocker`, `P1 High`, `P2 Nit`) and JSON/Markdown schemas governing what blocks a merge vs. what is logged as informational.
- **In-Loop Evidence Pack & Pre-Review CLI (`scripts/review/`):** A CLI utility (`npm run agent:verify` / `npm run agent:review-pack`) that generates git diffs against the base branch, executes deterministic checks (`astro check`, `npm run build`), correlates touched files with `pm/areas.json`, and synthesizes an isolated prompt payload.
- **Tier 1 Fresh-Context Reviewer Subagent Protocol:** Agent instructions, system prompt templates, and execution rules ensuring the reviewer has read-only permissions, fresh context, and a hard 2-pass loop termination limit.
- **Tier 2 GitHub Actions Quality Gate & PR Evidence Template:** PR template enforcing the Evidence Pack format, plus a GitHub Actions workflow that executes deterministic builds and surfaces review summaries.
- **Cross-Repository Rollout Kit:** Comprehensive guide and reference templates for rolling out this architecture to sibling repositories.

### Out of Scope
- Fully autonomous merging to production branches (human retains final merge approval).
- Replacing deterministic test suites or static linters with LLM-only review.
- Multi-agent conversational debates without strict iteration caps.

---

## 4. User Experience & Architectural Flow

```text
[ Developer / Human ]
        │  1. Assigns Task (e.g. TASK-018)
        ▼
[ Primary Coding Agent ] ◄────────────────────────────────────┐
        │  2. Codes, edits files                              │ P0/P1 Defects
        │  3. Runs: npm run agent:verify (Deterministic)       │ (Max 2 cycles)
        ▼                                                     │
[ Evidence Pack Synthesizer ]                                 │
        │  4. Extracts diff + test logs + area specs          │
        ▼                                                     │
[ Fresh Reviewer Subagent (Tier 1) ] ─────────────────────────┘
        │  5. Evaluates against acceptance criteria
        ▼  6. Verdict: PASS
[ Branch Push & Open Pull Request ]
        │  7. Includes Evidence Pack in PR Description
        ▼
[ GitHub Actions Quality Gate (Tier 2) ]
        │  8. Runs CI matrix, security check, build gate
        ▼
[ Human Reviewer ] ────► Merge to Main
```

---

## 5. Technical Architecture & Constraints

- **Primary Code Areas:** `review/agentic`, `automation/ci`, `sync/cli` (see `pm/areas.json`).
- **Target Directories:**
  - `pm/standards/` (Review contract & taxonomy specs)
  - `scripts/review/` (Evidence pack compiler & diff inspector)
  - `.github/workflows/` (Quality gate workflow)
  - `.github/pull_request_template.md` (Standardized PR evidence format)
  - `docs/guides/` (Cross-repo reference guide)
- **Constraints:**
  - **Deterministic Priority:** LLM review must never run before or supersede deterministic linters/compilers (`astro check`, `npm run build`).
  - **Least Privilege:** Reviewer subagents must operate under strict read-only permissions.
  - **Bounded Execution:** Maximum 2 loop iterations between Primary and Reviewer agents to prevent token runaway.
  - **Framework Agnostic Core:** The evidence extraction and contract schemas must work across Astro, React, and generic TypeScript repos.

---

## 6. Acceptance Criteria

- [ ] `pm/standards/AGENT_REVIEW_CONTRACT.md` is authored with P0/P1/P2 definitions, evidence requirements, and exit criteria.
- [ ] `npm run agent:review-pack` (or equivalent CLI) produces a self-contained markdown evidence pack for any git branch.
- [ ] Tier 1 reviewer subagent prompt and Antigravity rule/instruction set is documented and validated against a sample diff.
- [ ] `.github/pull_request_template.md` and `.github/workflows/agent-quality-gate.yml` are created and operational.
- [ ] `docs/guides/two-tier-agentic-review.md` is authored with concrete instructions for porting to sibling repos.
- [ ] Astro static build (`npm run build`) passes cleanly with zero regressions.

---

## 7. Task Breakdown Index

- [ ] `TASK-018`: Define Review Contract and Severity Taxonomy Specification
- [ ] `TASK-019`: Build In-Loop Evidence Pack and Pre-Review CLI Orchestrator
- [ ] `TASK-020`: Configure Tier 1 Fresh Context Reviewer Subagent Specification and Rules
- [ ] `TASK-021`: Build Tier 2 GitHub Actions Quality Gate and PR Evidence Template
- [ ] `TASK-022`: Create Cross-Repository Agentic Review Reference Guide and Rollout Kit
