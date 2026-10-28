---
title: "PlateMark"
description: "An interactive geospatial hospitality atlas and personal discovery notebook for food & drink enthusiasts—built with Next.js 16, MapLibre GL, Neon PostGIS, Drizzle ORM, and repository-native PM-as-Code delivery."
publishDate: 2026-10-28
tags: ["Product Management", "Next.js 16", "React 19", "MapLibre GL", "PostGIS", "Neon Postgres", "Drizzle ORM", "Netlify", "PM-as-Code", "Better Auth", "Tailwind CSS"]
featured: true
status: "In Progress"
role: "Product Manager & Systems Architect"
timeline: "2026 – Present (Active Development)"
githubUrl: "https://github.com/hanyihtang2/PlateMark"
liveUrl: "https://platemark.netlify.app"
metrics:
  - label: "Spatial Query Latency"
    value: "< 20ms"
    description: "Neon PostGIS GIST bounding box & radius lookups"
  - label: "Map Viewport"
    value: "60 FPS"
    description: "Supercluster marker aggregation with sheet-aware camera offset"
  - label: "Automated Tests"
    value: "52+ Tests"
    description: "Vitest unit & component test suite across filters & routes"
  - label: "PM-as-Code Delivery"
    value: "17 Initiatives"
    description: "100% version-controlled PRDs, staged tasks & CLI roadmap in git"
techStack:
  languages: ["TypeScript", "SQL (PostGIS)", "CSS"]
  frameworks: ["Next.js 16", "React 19", "MapLibre GL", "Tailwind CSS v4"]
  infrastructure: ["Neon (Serverless Postgres + PostGIS)", "Netlify (Next.js Runtime & Edge CDN)", "Cloudflare Workers (Places API Proxy)"]
  tools: ["Drizzle ORM", "Drizzle Kit", "Better Auth", "Supercluster", "Zustand", "TanStack Query", "Vitest", "PM-as-Code CLI (tsx pm.ts)"]
roadmap:
  - phase: "Phase 1"
    title: "Geospatial Data Core, Neon PostGIS & Interactive Atlas"
    status: "Completed"
    targetQuarter: "Q4 2026"
    summary: "Built the geospatial data foundation on Neon Serverless Postgres with PostGIS, Drizzle ORM schema, and a high-performance MapLibre GL vector canvas with dynamic venue pin rendering."
    deliverables:
      - "Relational database schema with PostGIS GEOMETRY(Point, 4326) coordinates and GIST spatial indices"
      - "Dual-status state engine modeling 'Been & Revisit' vs. 'Want to Visit' lifecycle"
      - "Responsive MapLibre GL canvas featuring smooth vector tile rendering and location geocoding"
      - "Sub-20ms spatial query endpoints (/api/places) with automated seed dataset and migrations via Drizzle ORM"
  - phase: "Phase 2"
    title: "Tactile Bistro Design System, Multi-Axis Filtering & Mobile Atlas"
    status: "Completed"
    targetQuarter: "Q4 2026"
    summary: "Crafted a tokenized design system ('Tactile Bistro'), multi-axis faceted filter engine, and responsive mobile bottom-sheet atlas experience."
    deliverables:
      - "Unified design tokens with 8-hue category colorway, light/dark themes, and cross-platform SVG country flags"
      - "Zustand multi-axis filter store with cascading tri-state destination selectors and price/status filters"
      - "Supercluster viewport marker aggregation maintaining 60 FPS panning across dense urban clusters"
      - "Mobile-first full-bleed atlas layout with multi-snap bottom sheet and sheet-aware camera offset"
      - "50+ unit and integration test suite powered by Vitest and React Testing Library"
  - phase: "Phase 3"
    title: "Single-Curator Better Auth, PM-as-Code & Netlify Deployment"
    status: "In Progress"
    targetQuarter: "Q4 2026"
    summary: "Deployed production infrastructure on Netlify with serverless Neon connection pooling, single-curator Better Auth allowlist gating, and repository-native PM-as-Code execution."
    deliverables:
      - "Production Netlify deployment with Next.js 16 runtime and pooled SSL Neon Postgres connection"
      - "Better Auth authentication core tables with strict curator email allowlist route-guard middleware"
      - "Repository-native PM-as-Code system (pm/) tracking PRDs, stage-based task Kanban boards, and codebase area mappings"
      - "CLI tooling (scripts/pm.ts) for automated Kanban status tracking and roadmap regeneration"
      - "Local PostGIS Docker environment for reproducible offline development and CI workflows"
  - phase: "Phase 4"
    title: "Place Curation Workspace, Geocoding & Places Enrichment"
    status: "Planned"
    targetQuarter: "Q1 2027"
    summary: "Build out the interactive venue directory table workspace, tactile add-place modal, address geocoding, and third-party Places API metadata enrichment."
    deliverables:
      - "Interactive table and list curation workspace (/directory) with in-place status switcher"
      - "Tactile 'Add New Place' modal dialog with TanStack Query optimistic mutations"
      - "Google Maps URL parser and coordinate geocoding helper to populate latitude/longitude without manual input"
      - "Edge Places API proxy for auto-populating venue operating hours, neighborhood tags, and addresses"
  - phase: "Phase 5"
    title: "Collaborative Notebooks & Shareable Mini-Atlas Exports"
    status: "Planned"
    targetQuarter: "Q2 2027"
    summary: "Enable multi-curator notebook collaboration, granular share links, and public read-only mini-atlas guides for sharing recommendations with friends."
    deliverables:
      - "Database schema and permissions engine for notebook shares and collaborator invitations"
      - "Share token generation and granular privacy controls (Private, Unlisted Share Link, Public Showcase)"
      - "Lightweight, read-only mobile viewer shell optimized for recipients viewing a shared hospitality list"
      - "Public mini-atlas collections exportable to Google Maps and Apple Maps saved lists"
---

## 1. Summary & Objectives

### Product Concept & Problem Statement
Anyone passionate about food, specialty coffee, and cocktail culture faces an inevitable dilemma: saved venues rapidly degrade into unmanageable graveyards scattered across Google Maps starred lists, Instagram saved collections, Apple Maps guides, and messy Apple Notes. When asked for a dinner recommendation or deciding where to go for drinks on a Friday evening, answering two fundamental questions takes too long:

1. *"Which places have I already visited that were standout hits I would immediately revisit?"*
2. *"Which aspirational spots on my wishlist have I not visited yet, and which one fits tonight's specific neighborhood, budget, and vibe?"*

Commercial mapping applications prioritize ad placements, sponsored recommendations, and algorithm-driven discovery over personal curation. They lack expressive taxonomies for nuanced dining contexts.

**PlateMark** is an interactive personal hospitality atlas and discovery notebook actively in development (**In Progress**). Built with Next.js 16, MapLibre GL, and Neon Serverless Postgres with PostGIS, it gives food and drink enthusiasts a dedicated, beautifully crafted spatial notebook to record, filter, and share the venues that matter to them.

### Core Objectives
1. **First-Class Dual Status Lifecycle:** Clearly delineate between places you have visited and love to return to (**"Been & Revisit"**) versus aspirational spots queued up on your radar (**"Want to Visit"**), avoiding the "blob of yellow stars" clutter.
2. **Multi-Dimensional Taxonomy & Faceted Filtering:** Allow instantaneous cross-filtering across category (Restaurant, Cafe / Specialty Coffee, Cocktail Bar, Wine Bar, Bakery), vibe (Date Night, Casual Solo, Group Dinner, Great Patio), price tier (£ to ££££), and cascading geographical destinations (Country → City → Neighborhood).
3. **Synchronized Map & Mobile Atlas Experience:** Deliver a split-screen desktop layout and a full-bleed mobile atlas with multi-snap bottom sheets where map markers, camera viewports, and venue cards are bidirectionally linked.
4. **PM-as-Code Engineering Workflow:** Manage product requirements, user stories, task lifecycles, and architectural boundaries directly inside the code repository using version-controlled Markdown and CLI tooling.

---

## 2. Design Process

### Geospatial & Serverless System Architecture
The application architecture is optimized for sub-second spatial queries, fluid vector map rendering, serverless reliability, and friction-free local and production execution:

```
[ User Browser / Mobile Atlas PWA ]
  ├── Split-View UI: Reactive MapLibre GL Canvas ◄──► Synchronized Place Sheets
  ├── Zustand Stores: Filter State & Viewport Camera Offsets
  └── TanStack Query: Optimistic Cache & Server State Invalidation
               │
               ▼  (HTTPS / REST / Server Actions)
[ Netlify Edge CDN & Serverless Runtime (Next.js 16) ]
  ├── Route-Guard Middleware (Single-Curator Email Allowlist)
  ├── Better Auth Route Handlers (/api/auth/*)
  └── Spatial Query Engine (/api/places)
               │
       ┌───────┴───────┐
       ▼               ▼
[ Neon Serverless Postgres ]     [ Places API Edge Gateway ]
(PostGIS GIST SRID 4326 + Drizzle) (Cloudflare Worker + KV Cache)
```

### Key Architectural Pivots & Engineering Decisions

#### 1. Database Pivot: From Supabase to Neon Serverless Postgres
The project transitioned from Supabase to **Neon Serverless Postgres** paired with **Drizzle ORM**:
- **Serverless HTTP Driver:** Using `@neondatabase/serverless`, connections are pooled efficiently over HTTP/WebSocket without running into PostgreSQL connection pool exhaustion during sudden traffic spikes in serverless functions.
- **Native PostGIS Support:** Neon provides native PostGIS extension support (`CREATE EXTENSION IF NOT EXISTS postgis;`), allowing spatial indexing (`GIST`) to execute viewport bounding-box queries (`ST_MakeEnvelope`) and radial proximity lookups (`ST_DWithin`) in under 20ms.
- **Instant Branching for Feature Previews:** Neon's copy-on-write database branching allows isolated database branches for Pull Request previews, preventing test pollution of the production dataset.
- **Type-Safe ORM with Drizzle:** Drizzle ORM provides zero-overhead, fully typed SQL queries and straightforward schema migrations without vendor lock-in to proprietary client SDKs.

#### 2. Hosting & Delivery Pivot: From Vercel to Netlify
The production application is deployed on **Netlify**:
- **Next.js Runtime Optimization:** Netlify's Next.js runtime seamlessly runs Next.js 16 App Router serverless endpoints and static assets with automated edge caching.
- **Predictable Infrastructure:** Standalone configuration via `netlify.toml` guarantees reproducible builds, clear environment variable scopes, and automated preview deployments for each branch.

#### 3. Authentication: Better Auth with Curator Email Allowlist Gate
Rather than relying on closed authentication suites, PlateMark implements **Better Auth**:
- Core authentication tables (`user`, `session`, `account`, `verification`) reside directly in the Neon PostgreSQL database.
- Production access is secured via route-guard middleware enforcing a strict single-curator email allowlist (`ALLOWED_EMAILS`), while supporting optional unauthenticated preview access (`ALLOW_DEV_FALLBACK_IN_PROD`) for portfolio visitors.

---

## 3. Key Capabilities

A core innovation in the development of PlateMark is the adoption of **PM-as-Code**—a repository-native methodology for managing PRDs, roadmaps, technical constraints, and developer tasks using version-controlled Markdown.

```
pm/
├── areas.json                        # Codebase architectural domain mapping
├── ROADMAP.md                        # Auto-generated roadmap & progress dashboard
├── templates/                        # Standardized PRD and Task templates
└── features/                         # Version-controlled initiatives
    ├── FEAT-001-.../                 # Product Features
    ├── INFRA-001-.../                # Engineering Enablers
    └── TECH-001-.../                 # Tech Debt & Health
        ├── prd.md                    # Requirements, user stories & constraints
        └── tasks/
            ├── 0-backlog/            # Planned tasks
            ├── 1-in-progress/        # Active development
            ├── 2-review/             # PR & code review
            └── 3-done/               # Merged & verified
```

### Why PM-as-Code?
In traditional product organizations, specifications live in external SaaS tools (Jira, Confluence, Linear, Notion) completely disconnected from code repositories. This causes three pervasive problems:
1. **Context Drift:** Documentation becomes obsolete the moment implementation details diverge from initial tickets.
2. **AI Agent Hallucinations:** Autonomous AI coding agents lack architectural boundaries, modifying files outside their scope or misinterpreting domain models.
3. **Audit Disconnect:** Git commits record *what* code changed, but lose the *why*—the user stories, business trade-offs, and acceptance criteria that justified the change.

### How It Works in Practice

#### 1. Architectural Guardrails (`pm/areas.json`)
Maps logical product domains to physical file paths and tech stacks, giving human developers and AI coding agents explicit blast radiuses:
```json
{
  "areas": {
    "maps/view": {
      "paths": ["src/components/map/", "src/hooks/useMapCamera.ts"],
      "techStack": ["maplibre-gl", "supercluster"]
    },
    "db/schema": {
      "paths": ["src/db/schema.ts", "src/db/migrations/"],
      "techStack": ["drizzle-orm", "PostGIS", "Neon"]
    }
  }
}
```

#### 2. Lifecycle Stages & CLI Automation (`scripts/pm.ts`)
A dedicated TypeScript CLI (`pnpm run pm`) governs task movement across four strict stages:
- `pnpm run pm status`: Displays a terminal Kanban dashboard across all initiatives.
- `pnpm run pm move <task-id> <stage>`: Atomically moves task files between stage folders (`0-backlog` → `1-in-progress` → `2-review` → `3-done`) while synchronizing YAML frontmatter.
- `pnpm run pm:roadmap`: Parses all task stages and regenerates `pm/ROADMAP.md` with real-time percentage completion stats.

#### 3. Standardized AI Agent Prompts
Tasks are formatted so that an autonomous coding assistant can be assigned a task markdown file directly, verify requirements against `pm/areas.json`, run unit tests (`pnpm test`), and commit both code and documentation in a single atomic PR.

---

## 4. Key Capabilities & Design System

| Capability Area | Common Frustration | PlateMark Solution | Outcome |
| :--- | :--- | :--- | :--- |
| **Status Clarity** | "Have I been here or did a friend recommend it?" | Explicit `Been & Revisit`, `Want to Visit`, `Been (Skip)`, and `Archived` | **Zero mental clutter; instant separation of tried vs wishlist** |
| **Contextual Vibe Search** | Generic "restaurant" filters that miss occasion | Faceted multi-axis filters: Category, Vibe, Price (£–££££), Destination | **Find the perfect spot for any occasion in < 15 seconds** |
| **Tactile Bistro Design** | Cluttered, ad-heavy corporate map styling | Custom "Tactile Bistro" tokens: warm editorial neutrals & 8-hue category accents | **Delightful, distraction-free spatial reading experience** |
| **Mobile-First Atlas** | Mobile maps with cramped floating cards | Full-bleed map with multi-snap bottom sheet and sheet-aware camera offsets | **Fluid one-handed browsing on city streets** |
| **PM-as-Code Transparency** | Hidden roadmap progress and opaque planning | Repository-native PRDs, staged tasks, and CLI-driven roadmap generation | **100% transparent development trajectory tracked in git** |

---

## 4. Technical Details

### 1. Sub-20ms Viewport Queries via PostGIS GIST Indexing
Venues are stored with PostGIS spatial geometries: `geometry("location").notNull()`. Spatial GIST indexes evaluate viewport bounding-box queries (`ST_MakeEnvelope`) and radial proximity filters (`ST_DWithin`) in under 20ms, ensuring that panning across a dense metropolis only fetches pins within visible bounds.

### 2. Fluid 60 FPS Clustering with Supercluster
To prevent frame rate drops when panning across hundreds of pins, PlateMark implements `Supercluster` to aggregate proximate venues into interactive cluster bubbles at low zoom levels. As the user zooms in, clusters expand smoothly into individual pins with custom category-colored markers.

### 3. Responsive Sheet-Aware Camera Offsets
On mobile screens, standard map centering places selected markers directly behind slide-up sheets. PlateMark's `useMapCamera` hook dynamically calculates pixel offsets based on active sheet height, smoothly animating the map camera so the active venue marker remains prominently visible above the drawer.

### 4. Automated Tests via Vitest Pipeline
Code quality is enforced via automated test suites covering:
- **Taxonomy & Design Tokens:** Validation of category color mappings, contrast ratios, and SVG country flags.
- **Filter Engine Logic:** Unit tests for tri-state destination selection (country/city cascading) and active badge counters.
- **Route Handlers & Security:** Verification of API response schemas, PostGIS coordinate serialization, and authentication allowlist gates.

---

## 6. Status & Roadmap

**Current Stage:** `In Progress` (Active Full-Stack Development)

PlateMark is progressing across 5 defined engineering phases. Phases 1 and 2 are fully completed, Phase 3 is actively being finalized, and Phases 4 and 5 represent upcoming milestones.

Explore the dedicated [Product Roadmap tab](/portfolio/projects/platemark/roadmap) for detailed phase deliverables and completion metrics.
