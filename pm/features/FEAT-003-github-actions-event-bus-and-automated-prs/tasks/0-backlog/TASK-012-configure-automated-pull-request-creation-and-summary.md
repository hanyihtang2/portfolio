---
id: TASK-012
parent_feature: FEAT-003
title: "Configure automated Pull Request creation and change summary"
status: backlog
priority: P1
areas:
  - automation/ci
target_paths:
  - .github/workflows/project-sync.yml
branch: feat/feat-003-automated-prs
dependencies:
  - TASK-011
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-012: Configure Automated Pull Request Creation and Change Summary

## 1. Objective
Integrate `peter-evans/create-pull-request` into the sync workflow so that frontmatter updates create an isolated PR with a rich release summary rather than pushing directly to `main`.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target path: `.github/workflows/project-sync.yml`

## 3. Technical Implementation Details
- PR Branch format: `sync/${{ github.event.client_payload.project }}-${{ github.event.client_payload.releaseTag }}`
- Commit Message: `chore(sync): update ${{ github.event.client_payload.project }} to ${{ github.event.client_payload.releaseTag }}`
- PR Title: `chore(sync): update ${{ github.event.client_payload.project }} metadata (${{ github.event.client_payload.releaseTag }})`
- PR Body formatting:
  - Highlight updated fields (tech stack, roadmap progress).
  - Include link to triggering release in sibling repository.
  - Checkbox review checklist for the portfolio maintainer.
- Set `delete-branch: true` on PR merge.

## 4. Acceptance Criteria
- [ ] Opens a formatted Pull Request only when git differences exist.
- [ ] PR title and body accurately reflect the project and release tag.
- [ ] Merging the PR triggers the standard GitHub Pages deployment workflow.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure git author email is set to `github-actions[bot]@users.noreply.github.com`.

