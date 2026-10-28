---
id: TASK-003
parent_feature: FEAT-001
title: "Implement MAKER Turborepo monorepo extractor"
status: backlog
priority: P1
areas:
  - sync/cli
target_paths:
  - scripts/extractors/maker.ts
branch: feat/feat-001-maker-extractor
dependencies:
  - TASK-001
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-003: Implement MAKER Turborepo Monorepo Extractor

## 1. Objective
Develop an extractor module (`scripts/extractors/maker.ts`) that traverses `../MAKER/`, analyzing `turbo.json`, `apps/`, and `packages/` to extract multi-package monorepo metadata for the portfolio.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target repo: `c:\Users\hanyi\projects\MAKER`
- Monorepo structure: `apps/web` (Next.js 15), `apps/mobile` (Expo React Native), `packages/database` (Supabase), `packages/types`, `packages/validators`.

## 3. Technical Implementation Details
- Check if `../MAKER` exists; return `null` gracefully if missing.
- Read `turbo.json` and count workspaces in `apps/` and `packages/`.
- Inspect `apps/web/package.json` for Next.js and React versions.
- Inspect `apps/mobile/package.json` for Expo SDK and React Native versions.
- Inspect `wrangler.json` / Cloudflare configuration for hosting infrastructure.
- Output metrics: total monorepo packages, shared Zod schemas.

## 4. Acceptance Criteria
- [ ] Correctly identifies Next.js, Expo, Supabase, Turborepo, and Cloudflare Pages.
- [ ] Returns valid partial frontmatter for `src/content/projects/maker.md`.
- [ ] Handles missing sub-packages without throwing errors.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Keep dependencies lightweight; avoid importing external monorepo tools.

