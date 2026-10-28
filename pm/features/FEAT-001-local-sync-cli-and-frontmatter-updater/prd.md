---
id: FEAT-001
title: "Local Sync CLI and Safe Frontmatter Updater"
status: completed
priority: P0
target_release: v0.1.0
lead: human
created_at: 2026-10-28
branch_prefix: feat/feat-001-local-sync-cli
areas:
  - sync/cli
  - content/projects
---

# PRD: Local Sync CLI and Safe Frontmatter Updater (Phase 1)

## 1. Executive Summary & Problem Statement
The portfolio's project documentation (`src/content/projects/*.md`) rapidly diverges from active codebases in sibling directories (`c:\Users\hanyi\projects\PlateMark`, `MAKER`, `CommuteShift`). For instance, PlateMark evolved from a "Concept" into an active application with Neon PostGIS, Drizzle, and Netlify, but remained stale in the portfolio.

This feature delivers a standalone local TypeScript CLI tool (`scripts/sync-projects.ts`) that inspects sibling project directories, extracts current tech stacks, versions, and deployment statuses, and updates the markdown frontmatter in `src/content/projects/*.md` with 100% preservation of handcrafted case-study prose.

---

## 2. User Stories
- **As the portfolio owner**, I want to run `npm run sync:projects` so that my portfolio's structured metadata (tech stack, tools, status, metrics) automatically reflects the current state of my repositories.
- **As a reader/recruiter**, I want to see up-to-date framework versions, infrastructure providers, and repository statuses on each project page.
- **As an author**, I want the sync script to touch *only* the frontmatter headers so that my handwritten problem statements, architecture diagrams, and reflections are never overwritten.

---

## 3. Scope & Key Capabilities

### In Scope
- **AST-Safe Frontmatter Parsing & Mutation**:
  - Regular expression and YAML-safe frontmatter parser that extracts the YAML header, applies updates, and writes it back cleanly while preserving exact markdown body indentation and formatting.
- **Dedicated Sibling Project Extractors**:
  - **PlateMark Extractor**: Inspects `pm/ROADMAP.md`, `pm/areas.json`, and `package.json` to extract `In Progress` status, Neon PostGIS, Netlify, and Drizzle ORM.
  - **MAKER Extractor**: Inspects Turborepo root `package.json`, `apps/web/package.json`, and `apps/mobile/package.json` to extract Next.js 15, Expo, Cloudflare Pages, and Supabase.
  - **CommuteShift Extractor**: Inspects `package.json`, `vercel.json`, and `test-all.mjs` to extract React 18, Vite 5, Tailwind CSS, and Vercel hosting.
- **CLI Orchestrator & Scripts**:
  - `npm run sync:projects`: Scans all mapped projects and outputs terminal diff summary.
  - `npm run sync:projects -- --project platemark`: Targeted sync for a single repository.
  - `--dry-run` flag to preview proposed frontmatter changes without writing to disk.

### Out of Scope (Future Phases)
- Automatic generation of new narrative case-study paragraphs (deferred to Phase 4 / AI co-pilot).
- Cross-repo GitHub Actions webhook triggers (deferred to Phase 3).

---

## 4. User Experience & Flows

```text
$ npm run sync:projects

============================================================
   Portfolio Cross-Repository Project Sync
============================================================

[1/3] Scanning PlateMark (c:\Users\hanyi\projects\PlateMark)...
      Status: In Progress
      Tech Stack: Next.js 16, MapLibre GL, Neon, Drizzle, Better Auth
      Updated: src/content/projects/platemark.md (frontmatter updated)

[2/3] Scanning MAKER (c:\Users\hanyi\projects\MAKER)...
      Status: In Progress
      Tech Stack: Next.js 15, Expo, Supabase, Turborepo
      Updated: src/content/projects/maker.md (up to date)

[3/3] Scanning CommuteShift (c:\Users\hanyi\projects\CommuteShift)...
      Status: Completed
      Tech Stack: React 18, Vite 5, Tailwind CSS
      Updated: src/content/projects/commuteshift.md (up to date)

Done in 0.42s. Run `git diff` to review changes before committing.
```

---

## 5. Technical Architecture & Constraints
- **Primary Code Areas**: `scripts/sync-projects.ts`, `scripts/extractors/`, `pm/areas.json`.
- **Runtime**: Node.js 24/26 native TypeScript execution (`node --experimental-strip-types scripts/sync-projects.ts`).
- **Safety Rule**: Non-destructive. If a sibling directory is missing, log a clean warning and skip without failing the build.

---

## 6. Acceptance Criteria
- [x] Running `npm run sync:projects` updates frontmatter without modifying case-study markdown body.
- [x] Supports `--dry-run` and targeted `--project <slug>` flags.
- [x] Sibling project extractors accurately parse `PlateMark`, `MAKER`, and `CommuteShift`.
- [x] `npm run build` passes with zero diagnostics errors after sync.

---

## 7. Task Breakdown Index
- [x] `TASK-001`: Build AST-safe Markdown frontmatter parser & updater utility
- [x] `TASK-002`: Implement PlateMark repository extractor (`pm/` and `package.json`)
- [x] `TASK-003`: Implement MAKER Turborepo monorepo extractor
- [x] `TASK-004`: Implement CommuteShift SPA extractor
- [x] `TASK-005`: Build unified sync CLI orchestrator and npm scripts

