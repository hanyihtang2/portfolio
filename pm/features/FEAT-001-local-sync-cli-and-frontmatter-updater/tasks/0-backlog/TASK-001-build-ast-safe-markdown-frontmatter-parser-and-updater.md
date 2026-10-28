---
id: TASK-001
parent_feature: FEAT-001
title: "Build AST-safe Markdown frontmatter parser and updater"
status: backlog
priority: P0
areas:
  - sync/cli
target_paths:
  - scripts/lib/frontmatter.ts
branch: feat/feat-001-frontmatter-parser
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-001: Build AST-Safe Markdown Frontmatter Parser and Updater

## 1. Objective
Create a rock-solid, zero-dependency TypeScript helper module (`scripts/lib/frontmatter.ts`) that reliably parses and updates YAML frontmatter in Astro project markdown files while preserving 100% of the handwritten markdown body, comments, LaTeX notation, and code blocks.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Area: `sync/cli` in `pm/areas.json`
- Motivation: Naive string replacement can corrupt multi-line descriptions or wipe out case-study sections. This utility ensures that updating `status` or `techStack` leaves every other line intact.

## 3. Technical Implementation Details
- Export `parseProjectMarkdown(content: string)`:
  - Separates frontmatter YAML block (`^---\r?\n([\s\S]*?)\r?\n---`) from body.
  - Parses YAML scalars, arrays (`- item`), nested objects (`techStack.languages`, `roadmap`), and multiline strings.
- Export `updateProjectFrontmatter(filePath: string, updates: Partial<ProjectFrontmatter>, dryRun?: boolean)`:
  - Merges `updates` into existing frontmatter dictionary.
  - Re-serializes YAML preserving clean alphabetical or standard field order.
  - Re-attaches verbatim markdown body.

## 4. Acceptance Criteria
- [ ] Correctly parses nested objects (`techStack`, `metrics`, `roadmap`).
- [ ] Preserves multiline strings, markdown tables, and code snippets in the body.
- [ ] Supports `--dry-run` without modifying the target file.
- [ ] Handles CRLF and LF line endings seamlessly.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> When executing this task:
> 1. Keep this module dependency-free using standard Node `fs` and string parsing.
> 2. Add inline unit test assertions or an example runner.

