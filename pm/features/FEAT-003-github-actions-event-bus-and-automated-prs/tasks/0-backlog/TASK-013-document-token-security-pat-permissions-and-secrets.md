---
id: TASK-013
parent_feature: FEAT-003
title: "Document token security, PAT permissions, and repository secrets"
status: backlog
priority: P2
areas:
  - automation/ci
target_paths:
  - pm/docs/github-cross-repo-sync-setup.md
branch: feat/feat-003-token-runbook
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-013: Document Token Security, PAT Permissions, and Repository Secrets

## 1. Objective
Author a step-by-step security and operational runbook (`pm/docs/github-cross-repo-sync-setup.md`) explaining how to create and configure a GitHub Fine-Grained Personal Access Token (PAT) for cross-repository dispatch.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target secret: `PORTFOLIO_SYNC_PAT`

## 3. Technical Implementation Details
- Document:
  1. How to generate a GitHub Fine-Grained Personal Access Token with minimal permissions:
     - Resource owner: `hanyihtang2`
     - Repository access: Only `hanyihtang2/portfolio`
     - Repository permissions: `Contents: Read and write`, `Metadata: Read-only`
  2. How to store the token in sibling repository secrets (`PlateMark`, `MAKER`, `CommuteShift`) under `PORTFOLIO_SYNC_PAT`.
  3. Token expiration rotation recommendations (e.g. 90-day expiry).
  4. How to trigger a dry-run test from GitHub Actions UI.

## 4. Acceptance Criteria
- [ ] Clear step-by-step instructions with exact GitHub settings paths.
- [ ] Adheres to the principle of least privilege.
- [ ] Includes troubleshooting steps for HTTP 401 and 404 dispatch errors.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Do not include real token values; use placeholder text `<your-fine-grained-pat>`.

