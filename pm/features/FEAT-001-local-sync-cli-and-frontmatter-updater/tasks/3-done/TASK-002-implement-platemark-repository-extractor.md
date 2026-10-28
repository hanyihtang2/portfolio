---
id: TASK-002
parent_feature: FEAT-001
title: Implement PlateMark repository extractor
status: done
priority: P0
areas:
  - sync/cli
target_paths:
  - scripts/extractors/platemark.ts
branch: feat/feat-001-platemark-extractor
dependencies:
  - TASK-001
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-28
---

# TASK-002: Implement PlateMark Repository Extractor

## 1. Objective
Develop a dedicated extractor module (`scripts/extractors/platemark.ts`) that inspects `../PlateMark/`, reading `pm/ROADMAP.md`, `pm/areas.json`, `package.json`, and deployment files to extract live project metadata for the portfolio.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target repo: `c:\Users\hanyi\projects\PlateMark`
- Area: `sync/cli` in `pm/areas.json`

## 3. Technical Implementation Details
- Check if `../PlateMark` exists; if not, return `null` with a graceful warning.
- Read `package.json`:
  - Extract `@neondatabase/serverless`, `drizzle-orm`, `maplibre-gl`, `supercluster`, `better-auth`, `zustand`, `@tanstack/react-query`.
- Read `pm/ROADMAP.md`:
  - Count completed features vs active/ready features to compute completion progress.
- Detect infrastructure:
  - Presence of `netlify.toml` $\rightarrow$ `Netlify`
  - Presence of `@neondatabase/serverless` $\rightarrow$ `Neon (Serverless Postgres + PostGIS)`
- Return structured payload matching Astro collection schema:
  - `status`: `"In Progress"`
  - `techStack`: frameworks, infrastructure, tools, languages
  - `timeline`: `"2026 – Present (Active Development)"`

## 4. Acceptance Criteria
- [x] Successfully extracts PlateMark metadata without throwing when files are missing.
- [x] Correctly identifies Neon, Netlify, Better Auth, and Drizzle ORM.
- [x] Returns properly formatted schema object compatible with `TASK-001`.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Ensure path resolution uses `path.resolve(process.cwd(), '../PlateMark')` or configurable base directory.

