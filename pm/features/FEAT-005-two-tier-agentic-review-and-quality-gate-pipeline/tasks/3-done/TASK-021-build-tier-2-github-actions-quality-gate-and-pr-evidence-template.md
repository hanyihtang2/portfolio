---
id: TASK-021
parent_feature: FEAT-005
title: Build Tier 2 GitHub Actions Quality Gate and PR Evidence Template
status: done
priority: P1
areas:
  - automation/ci
  - review/agentic
target_paths:
  - .github/pull_request_template.md
  - .github/workflows/agent-quality-gate.yml
branch: feat/feat-005-build-tier-2-github-actions-quality-gate-and-pr-evidence-template
dependencies:
  - TASK-018
  - TASK-020
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-30
---

# TASK-021: Build Tier 2 GitHub Actions Quality Gate and PR Evidence Template

## 1. Objective
Establish the Tier 2 quality gate by creating a standardized GitHub Pull Request template enforcing structured "Prompt Request" evidence, paired with a GitHub Actions CI workflow that validates deterministic checks and posts a comprehensive audit summary for the human reviewer.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md` (FEAT-005 Two-Tier Agentic Review and Quality Gate Pipeline)
- Tier 1 Review Output: `pm/standards/TIER_1_REVIEWER_SPEC.md` (TASK-020)

## 3. Technical Implementation Details
1. **Pull Request Evidence Template (`.github/pull_request_template.md`):**
   - **Summary of Intent:** What problem was solved and why.
   - **Task & PRD Reference:** Link to `pm/features/.../TASK-*.md` and Acceptance Criteria.
   - **Tier 1 Audit Evidence:**
     - Deterministic build status (`npm run build` output).
     - Subagent review verdict (`PASS` with iteration count).
     - Non-blocking suggestions (P2 findings) surfaced for human awareness.
   - **Scope Checklist:** Confirmation that only files mapped in `pm/areas.json` were modified.

2. **GitHub Actions Quality Gate Workflow (`.github/workflows/agent-quality-gate.yml`):**
   - **Triggers:** `pull_request` targeting `main`.
   - **Deterministic Stage (Fail-Fast):**
     - Checks out code, sets up Node.js.
     - Runs dependency install (`npm ci`).
     - Runs TypeScript verification and Astro static build (`npm run build`).
     - Fails immediately if build fails.
   - **Evidence Verification Stage:**
     - Verifies that the PR description contains the required Evidence Pack sections.
     - Confirms no un-reviewed P0/P1 blockers remain open.
   - **Summary Generator:**
     - Generates a GitHub Actions Job Summary / PR comment detailing build status, files touched, and verification evidence for the human reviewer.

3. **Human-in-the-Loop Safeguards:**
   - Enforce branch protection expectations: AI agents do not possess auto-merge rights; human engineer retains final merge sign-off.

## 4. Acceptance Criteria
- [x] `.github/pull_request_template.md` created with clear sections for intent, evidence pack, and subagent audit logs.
- [x] `.github/workflows/agent-quality-gate.yml` created with clean fail-fast deterministic checks and job summaries.
- [x] Workflow YAML is syntactically valid and linted cleanly.
- [x] Static build passes cleanly (`npm run build`).

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> - Ensure GitHub Actions workflow uses pinned actions (e.g. `actions/checkout@v4`, `actions/setup-node@v4`).
> - Keep workflow permissions restricted to `contents: read` and `pull-requests: write`.

### Execution Log / Decisions
- Created `.github/pull_request_template.md` standardizing Prompt Request evidence, Tier 1 verdict embedding, and scope audit checklist.
- Authored `.github/workflows/agent-quality-gate.yml` with fail-fast deterministic checks (`npm run build`), PR evidence parsing, and GitHub Step Summary generation.
- Enforced human-in-the-loop branch governance (AI agents do not merge; humans hold the merge key).
- Verified zero build regressions with `npm.cmd run build`.
