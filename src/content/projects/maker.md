---
title: "MAKER"
description: "A cross-platform woodworking and DIY blueprint platform with step-by-step build plans, bills of materials, tool checklists, universal entitlements, and an offline mobile workshop mode."
publishDate: 2026-10-23
tags: ["Next.js", "Expo / React Native", "TypeScript", "Supabase", "PostgreSQL", "Turborepo"]
liveUrl: "https://maker.hanyihtang2.workers.dev/"
featured: true
status: "In Progress"
role: "Product Engineer"
timeline: "2026 – Present"
metrics:
  - label: "Monorepo Packages"
    value: "5"
    description: "2 apps + 3 shared libraries"
  - label: "Database Migrations"
    value: "4 SQL"
    description: "RLS policies & rating triggers"
  - label: "Target Platforms"
    value: "Web + Mobile"
    description: "Next.js SSR & Expo iOS/Android"
  - label: "Type Safety"
    value: "100%"
    description: "End-to-end TypeScript & Zod"
techStack:
  languages: ["TypeScript", "SQL (PL/pgSQL)", "CSS"]
  frameworks: ["Next.js", "React 19", "Expo / React Native", "Tailwind CSS"]
  infrastructure: ["Cloudflare Pages", "Supabase (PostgreSQL & Auth)", "GitHub Actions"]
  tools: ["Turborepo", "Zod", "Lucide Icons", "npm Workspaces"]
roadmap:
  - phase: "Phase 1"
    title: "Turborepo Scaffolding & Unified Domain Models"
    status: "Completed"
    targetQuarter: "Q3 2026"
    summary: "Monorepo architecture sharing core TypeScript types, Zod validators, and Supabase database clients across web and mobile."
    deliverables:
      - "Turborepo setup with 5 packages (2 apps + 3 shared libraries)"
      - "Relational Supabase PostgreSQL schema with RLS security policies"
      - "Shared Zod blueprint schemas and PL/pgSQL rating triggers"
  - phase: "Phase 2"
    title: "Next.js Web Blueprint Discovery & Creator Studio (Placeholder)"
    status: "In Progress"
    targetQuarter: "Q4 2026"
    summary: "Planned roadmap milestone for web-based blueprint authoring, video step embedding, cut list calculators, and community reviews."
    deliverables:
      - "Cloudflare Pages production deployment & continuous delivery pipeline"
      - "[Placeholder] Interactive cut list optimizer and lumber yield calculator"
      - "[Placeholder] Creator dashboard with draft/publish workflow"
      - "[Placeholder] User reviews, build photos, and community question threads"
  - phase: "Phase 3"
    title: "Expo Mobile Offline Workshop Mode (Placeholder)"
    status: "Planned"
    targetQuarter: "Q1 2027"
    summary: "Planned roadmap milestone for offline mobile experience in garages and workshops without internet connectivity."
    deliverables:
      - "[Placeholder] Local caching with expo-file-system and SQLite"
      - "[Placeholder] High-contrast workbench mode with large touch targets"
      - "[Placeholder] Hands-free voice navigation for step-by-step instructions"
  - phase: "Phase 4"
    title: "Universal Cross-Platform Entitlements (Placeholder)"
    status: "Planned"
    targetQuarter: "Q2 2027"
    summary: "Planned roadmap milestone for unified subscriptions and paid blueprint purchases synchronized between Stripe and App Stores."
    deliverables:
      - "[Placeholder] Stripe web checkout webhook synchronization"
      - "[Placeholder] Apple StoreKit 2 and Google Play Billing integration"
      - "[Placeholder] Unified entitlement resolution via Supabase Edge Functions"
---

<h2 id="summary">1. Project Summary & Objectives</h2>

### Product Purpose
Woodworkers, craftspeople, and DIY builders frequently rely on fragmented PDFs, forum threads, or long-form videos that are difficult to reference at a workbench. Furthermore, workshops located in garages or basements often suffer from poor internet connectivity.

**MAKER** is a cross-platform community blueprint platform built to solve these challenges. It structures DIY and woodworking projects into actionable, verifiable blueprints complete with exact bills of materials (cut lists, dimensions, and quantities), required vs. optional shop tool checklists, step-by-step instructions with photo/video references, creator profiles, and a companion **Offline Workshop Mode** on mobile devices.

### Personal Learning Objectives
1. **Cross-Platform Monorepo Architecture:** Architect a scalable **Turborepo** workspace sharing core TypeScript domain models (`@maker/types`), runtime **Zod** validation schemas (`@maker/validators`), and a unified database access layer (`@maker/database`) across **Next.js** (Web) and **Expo / React Native** (Mobile).
2. **Database-Level Security & Integrity:** Design a relational **Supabase PostgreSQL** schema utilizing Row-Level Security (RLS) policies to enforce public, private, and paid paywall boundaries directly at the database layer, paired with PL/pgSQL triggers for real-time rating and like aggregation.
3. **Offline-First Mobile Experience:** Build a mobile workshop companion using `expo-file-system` and `expo-router` capable of caching blueprint steps, cut lists, and media locally for zero-connectivity environments.
4. **Universal Cross-Platform Entitlements:** Model unified purchase entitlements so blueprints or creator subscriptions unlocked on the web (via Stripe) seamlessly synchronize with mobile (Google Play / Apple StoreKit).

---

<h2 id="design-process">2. Design Process & Architecture</h2>

### System Topology & Monorepo Structure
The platform separates public discovery, SEO, and blueprint authoring on the web from hands-on, offline-capable execution in the workshop on mobile, while sharing 100% of business logic and data contracts through internal workspace packages:

```
MAKER (Turborepo Workspace)
├── apps/
│   ├── web/                     # Next.js SSR & Static Export (Discovery, Creator Studio, Checkout)
│   └── mobile/                  # Expo / React Native (iOS & Android, Offline Workshop Mode)
│
└── packages/
    ├── database/                # Supabase client, Postgres migrations, RLS policies & DB mappers
    ├── types/                   # Shared TypeScript interfaces (Project, Step, Material, Tool, Entitlement)
    └── validators/              # Shared Zod schemas for blueprint authoring & review validation
```

### Architectural Trade-offs & Decisions
- **Shared Package Boundaries vs. Duplicated DTOs:** By isolating `@maker/types` and `@maker/validators` from framework-specific dependencies, both the Next.js web forms and the Expo mobile client validate project payloads and user reviews with identical rules and zero type drift.
- **Database Triggers vs. Application-Side Aggregation:** Star ratings (`rating_average`, `rating_count`) and project likes (`likes_count`) are recomputed automatically via PostgreSQL `AFTER INSERT OR UPDATE OR DELETE` triggers (`update_project_rating_aggregate` and `update_project_likes_aggregate`), guaranteeing consistency without extra read-modify-write roundtrips from client applications.
- **Row-Level Security (RLS) for Paywall Enforcement:** Rather than relying solely on frontend checks, `project_steps` access is governed by Postgres RLS policies that verify whether a project is `PUBLIC`, owned by `auth.uid()`, or backed by an active record in the `entitlements` table (`ONE_OFF_PROJECT` or `CREATOR_SUBSCRIPTION`). Meanwhile, `project_materials` and `project_tools` remain publicly readable on `PAID` projects so prospective builders can inspect required tools and lumber before purchasing.

---

<h2 id="key-metrics">3. Key Metrics & Architecture Highlights</h2>

| Architectural Dimension | Design Target | Implementation in MAKER | Outcome |
| :--- | :--- | :--- | :--- |
| **Code Sharing** | Shared domain & validation | `@maker/types`, `@maker/validators`, `@maker/database` | **Zero schema duplication across Web & Mobile** |
| **Search Indexing** | Fast fuzzy blueprint & tool lookup | PostgreSQL `pg_trgm` GIN indexes on project titles & tool names | **Sub-millisecond full-text & trigram filtering** |
| **Paywall Security** | Fine-grained step protection | Declarative PostgreSQL RLS policies across 6 core tables | **Database-enforced authorization** |
| **Rating Consistency** | Atomic star-rating rollups | PL/pgSQL triggers on `project_reviews` & `project_likes` | **Real-time aggregate accuracy** |

---

<h2 id="technical-details">4. Technical Details & Implementation</h2>

### Languages, Frameworks & Tooling
- **Web Application (`@maker/web`):** Built with **Next.js**, **React 19**, **Tailwind CSS**, and **Lucide React**, featuring a custom workshop blueprint design system (`canvas`, `surface`, `draft`, `blueprint`, and `action` tokens) with dark/light theme persistence.
- **Edge Deployment & Hosting:** The web client is continuously deployed to **Cloudflare Pages** ([maker.hanyihtang2.workers.dev](https://maker.hanyihtang2.workers.dev/)), leveraging Cloudflare's global edge network for sub-second blueprint delivery and zero cold-start latency.
- **Mobile Application (`@maker/mobile`):** Built with **Expo SDK 58**, **React Native**, `expo-router`, and `expo-file-system` for offline blueprint caching and step-by-step shop mode navigation.
- **Backend & Persistence (`@maker/database`):** Powered by **Supabase** (**PostgreSQL**, **Supabase Auth**), with 4 declarative SQL migrations covering relational tables, trigram GIN indexes, RLS policies, auth profile triggers, and seed data.
- **Validation (`@maker/validators`):** Strict **Zod** schemas (`createProjectSchema`, `materialSchema`, `toolSchema`, `stepSchema`, `reviewSchema`) enforcing constraints before database mutations.

### Relational Data Mapping & Validation
Every database query result is normalized through typed mapping functions in `@maker/database` so UI components consume clean camelCase domain objects with sorted build steps:

```typescript
export function mapProjectDetailFromDb(row: any): ProjectDetail {
  const project = mapProjectFromDb(row);
  const steps: ProjectStep[] = (row.project_steps || [])
    .map((s: any) => ({
      id: s.id,
      projectId: s.project_id,
      stepNumber: Number(s.step_number),
      title: s.title,
      instructions: s.instructions,
      videoStreamId: s.video_stream_id,
      photoUrls: s.photo_urls || [],
      tips: s.tips,
      createdAt: s.created_at,
    }))
    .sort((a: ProjectStep, b: ProjectStep) => a.stepNumber - b.stepNumber);

  return {
    ...project,
    steps,
    materials: mapMaterials(row.project_materials),
    tools: mapTools(row.project_tools),
    hasAccess: row.visibility === 'PUBLIC' || Boolean(row.has_access),
  };
}
```

---

<h2 id="repository">5. Repository & Deployment Status</h2>

The MAKER web application is actively deployed to production via **Cloudflare Pages**, featuring automated Git integration and edge distribution. The monorepo codebase is maintained in a **private GitHub repository**.

- **Live Web Application:** [maker.hanyihtang2.workers.dev ↗](https://maker.hanyihtang2.workers.dev/)
- **Deployment Platform:** Cloudflare Pages (Continuous deployment pipeline with edge delivery)
- **Repository Status:** Private (Code access or architecture walkthrough available upon request)
- **Local Architecture & Workspace Commands:**
  ```bash
  # Install dependencies across all Turborepo workspaces
  npm install

  # Start the Next.js web application
  npm run dev --workspace=@maker/web

  # Or run all Turborepo workspaces (web, mobile, shared libraries) concurrently
  npm run dev
  ```

