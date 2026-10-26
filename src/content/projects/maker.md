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
  - label: "Activation Target"
    value: "> 60%"
    description: "Material & tool checklist check"
  - label: "Workshop Adoption"
    value: "> 50%"
    description: "Mobile workshop mode usage"
  - label: "Reliability"
    value: "100%"
    description: "Offline cached step resilience"
  - label: "Unlock Conversion"
    value: "> 4.5%"
    description: "Paid blueprint purchase rate"
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

## 1. Summary & Objectives

### Product Purpose
Woodworkers, craftspeople, and DIY builders frequently rely on fragmented PDFs, forum threads, or long-form videos that are difficult to reference at a workbench. Furthermore, workshops located in garages or basements often suffer from poor internet connectivity.

**MAKER** is a cross-platform community blueprint platform built to solve these challenges. It structures DIY and woodworking projects into actionable, verifiable blueprints complete with exact bills of materials (cut lists, dimensions, and quantities), required vs. optional shop tool checklists, step-by-step instructions with photo/video references, creator profiles, and a companion **Offline Workshop Mode** on mobile devices.

### Personal Learning Objectives
1. **Cross-Platform Monorepo Architecture:** Architect a scalable **Turborepo** workspace sharing core TypeScript domain models (`@maker/types`), runtime **Zod** validation schemas (`@maker/validators`), and a unified database access layer (`@maker/database`) across **Next.js** (Web) and **Expo / React Native** (Mobile).
2. **Database-Level Security & Integrity:** Design a relational **Supabase PostgreSQL** schema utilizing Row-Level Security (RLS) policies to enforce public, private, and paid paywall boundaries directly at the database layer, paired with PL/pgSQL triggers for real-time rating and like aggregation.
3. **Offline-First Mobile Experience:** Build a mobile workshop companion using `expo-file-system` and `expo-router` capable of caching blueprint steps, cut lists, and media locally for zero-connectivity environments.
4. **Universal Cross-Platform Entitlements:** Model unified purchase entitlements so blueprints or creator subscriptions unlocked on the web (via Stripe) seamlessly synchronize with mobile (Google Play / Apple StoreKit).

---

## 2. Design Process

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

## 3. Success Metrics

| Category | Metric | Target | Rationale |
| :--- | :--- | :--- | :--- |
| **Activation** | Material & Tool Readiness Check | **> 60%** | % of landed users inspecting the BOM and cut list before starting or purchasing a plan. |
| **Workshop Adoption** | Mobile "Workshop Mode" Usage | **> 50%** | % of mobile users launching high-contrast workbench mode while building. |
| **Reliability** | Zero-Connectivity Resilience | **100% Cached Uptime** | Uninterrupted offline step navigation in basement and garage Wi-Fi dead zones. |
| **Monetization** | Blueprint Unlock Conversion | **> 4.5%** | % of users reviewing a paid blueprint who convert to unlocking step-by-step instructions. |

---

## 4. Technical Implementation

### 1. Cross-Platform Validation without Type Drift
Instead of maintaining duplicate validation logic across the Next.js web studio and the React Native mobile app, authoring constraints (cut list dimensions, tool requirements, and step instructions) are centralized in `@maker/validators`. Both platforms validate against the same runtime Zod schemas, guaranteeing zero schema drift between authoring on the web and building in the shop.

### 2. Offline-First Mobile Workshop Sync
Workshops in basements and garages frequently suffer from dead zones. Rather than relying on uninterrupted connectivity, the mobile client pre-caches blueprint step data, high-resolution cut diagrams, and tool checklists locally (`expo-file-system` + SQLite) so builders can reference dimensions without network dropouts.

### 3. Database-Enforced Paywall Boundaries
To protect creator monetization without exposing build steps through API leaks, access control is enforced directly at the database layer via Supabase Row-Level Security (RLS):
- **Public Metadata:** Project overviews, bills of materials, and tool checklists remain publicly inspectable so prospective builders can review lumber lists and required equipment before purchasing.
- **Protected Steps:** Step-by-step assembly instructions, photos, and video streams require an active purchase entitlement record (`entitlements`) verified directly within PostgreSQL queries.

---

## 5. Deployment

The MAKER web application is actively deployed to production via **Cloudflare Pages**, featuring automated Git integration and edge distribution. The monorepo codebase is maintained in a **private GitHub repository**.

- **Live Web Application:** [maker.hanyihtang2.workers.dev ↗](https://maker.hanyihtang2.workers.dev/)
- **Deployment Platform:** Cloudflare Pages (Continuous deployment pipeline with edge delivery)
- **Repository Status:** Private

