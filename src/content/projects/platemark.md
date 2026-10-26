---
title: "Platemark"
description: "An interactive geospatial tracker and personal discovery map for restaurants, cafes, and bars—categorizing and filtering visited favorites to revisit versus a curated wishlist of spots to try."
publishDate: 2026-10-22
tags: ["TypeScript", "Next.js", "MapLibre GL", "PostGIS", "Geolocation", "Consumer Tech"]
featured: false
status: "Concept"
role: "Product & Systems Architect"
timeline: "Concept Stage (Planned)"
metrics:
  - label: "Spatial Query Latency"
    value: "< 20ms"
    description: "PostGIS GIST bounding box & radius lookup"
  - label: "Map Viewport"
    value: "60 FPS"
    description: "Supercluster marker aggregation on pan/zoom"
  - label: "Places Cache Hit"
    value: "> 85%"
    description: "Cloudflare KV proxy for venue hours & addresses"
  - label: "Offline Resilience"
    value: "100% Cached"
    description: "IndexedDB saved venues & offline vector map tiles"
techStack:
  languages: ["TypeScript", "SQL (PostGIS)"]
  frameworks: ["Next.js", "React 19", "MapLibre GL", "Tailwind CSS"]
  infrastructure: ["PostgreSQL (PostGIS)", "Supabase", "Cloudflare Workers (Places API Proxy)"]
  tools: ["Zustand", "TanStack Query", "Zod", "Supercluster"]
roadmap:
  - phase: "Phase 1"
    title: "Spatial Data Schema, Map Viewport & Pin Management"
    status: "Planned"
    targetQuarter: "Q1 2027"
    summary: "Build the foundational geospatial PostgreSQL schema, PostGIS spatial queries, and MapLibre GL map viewport with responsive pan/zoom pin rendering."
    deliverables:
      - "PostgreSQL database schema with PostGIS GEOMETRY(Point, 4326) coordinates and spatial GIST indices"
      - "Dual-status state engine modeling 'Been & Revisit' vs. 'Want to Visit' lifecycle"
      - "Responsive MapLibre GL canvas featuring smooth vector tile rendering and location geocoding"
      - "Quick-add modal capturing venue name, category, personal rating, and primary neighborhood"
  - phase: "Phase 2"
    title: "Multi-Axis Tagging, Vibe Filters & Synchronized List Layout"
    status: "Planned"
    targetQuarter: "Q2 2027"
    summary: "Implement faceted search filters by category, vibe, price point, and occasion alongside a synchronized split-view map and list interface."
    deliverables:
      - "Multi-axis filter engine (Venue Type, Vibe/Occasion, Price Tier, Revisit Likelihood)"
      - "Synchronized split-screen UI: hovering or tapping a card focuses and pops up the corresponding map pin"
      - "Supercluster integration for fluid marker clustering at varying zoom thresholds"
      - "URL search parameter synchronization enabling shareable filtered map states"
  - phase: "Phase 3"
    title: "Places API Auto-Enrichment & Offline PWA Sync"
    status: "Planned"
    targetQuarter: "Q3 2027"
    summary: "Integrate a cached Places API proxy for zero-friction metadata enrichment (hours, address, phone) paired with offline PWA caching."
    deliverables:
      - "Cloudflare Worker caching proxy interfacing with Google Places / OpenStreetMap APIs"
      - "One-tap auto-complete during venue creation to populate exact coordinates and opening hours"
      - "IndexedDB local persistence for instant spot lookups during spotty subway or roaming connectivity"
      - "Custom personal tasting notes, standout dishes, and seating tip annotations"
  - phase: "Phase 4"
    title: "Curated Guide Sharing & Public Mini-Atlas Exports"
    status: "Planned"
    targetQuarter: "Q4 2027"
    summary: "Enable users to assemble custom curated guide collections (e.g. 'East London Natural Wine' or 'Tokyo Specialty Espresso') with shareable interactive links."
    deliverables:
      - "Custom list collections with custom slugs, cover imagery, and intro blurbs"
      - "Granular privacy controls (Private, Unlisted via Link, or Public Portfolio Showcase)"
      - "Lightweight, read-only mobile viewer optimized for friends receiving a shared recommendation"
      - "Export capability to Apple Maps Guides and Google Maps Saved Lists"
---

## 1. Summary & Objectives

### Product Concept & Problem Statement
Anyone who loves exploring food and drink culture faces a familiar friction: saved locations quickly turn into unnavigable graveyards across Google Maps stars, Instagram bookmarks, Apple Maps guides, and notes apps. When asked for a dinner recommendation or deciding where to go for Friday evening drinks, answering two critical questions is frustratingly slow:

1. *"Which places have I already been to that were standout hits I would definitely revisit?"*
2. *"Which spots on my radar have I not yet visited, and which one fits tonight's specific vibe, budget, or neighborhood?"*

Existing mapping apps prioritize commercial discovery and ad placements over personal curation, lacking flexible tagging for nuanced attributes (e.g., *"solo-friendly coffee bar with Wi-Fi"*, *"late-night natural wine with small plates"*, or *"ideal for 6-person group bookings"*).

**Platemark** is an interactive personal hospitality atlas and discovery tracker currently in the **Concept** stage. It gives food and drink enthusiasts a dedicated, beautifully crafted spatial notebook to record, filter, and share the places that matter to them.

### Core Objectives
1. **First-Class Dual Status Lifecycle:** Clearly delineate between places you have visited and love to return to (**"Been & Revisit"**) versus aspirational spots queued up on your radar (**"Want to Visit"**), avoiding the "blob of yellow stars" clutter.
2. **Multi-Dimensional Taxonomy & Faceted Filtering:** Allow instantaneous cross-filtering across category (Restaurant, Cafe / Specialty Coffee, Cocktail Bar, Wine Bar, Bakery), vibe (Date Night, Casual Solo, Group Dinner, Work Friendly), price tier, and neighborhood.
3. **Synchronized Map & List Interaction:** Deliver a split-screen desktop and drawer-driven mobile layout where map markers and list cards are bidirectionally linked with fluid pan-to-zoom transitions.
4. **Frictionless Place Enrichment:** Leverage cached Places API proxies so typing a restaurant name automatically populates coordinates, addresses, neighborhood labels, and hours without tedious manual entry.

---

## 2. Design Process

### Geospatial System Architecture
The application architecture is optimized for sub-second spatial queries, fluid vector map rendering, and fast client-side filtering:

```
[ User Browser / Mobile PWA ]
  ├── Split-View UI: Reactive MapLibre Canvas ◄──► Synchronized Place Cards
  └── Local Cache: IndexedDB + Zustand Spatial Filter Store
               │
               ▼  (HTTPS / REST)
[ Next.js API & Edge Layer ]
  ├── Spatial Query Engine (PostGIS Bounding-Box Resolver)
  └── Places Enrichment Gateway (Cached Google Places / OSM Proxy)
               │
      ┌────────┴────────┐
      ▼                 ▼
[ PostgreSQL + PostGIS ]  [ Places API Cache ]
(Geometries & Tags)      (Cloudflare KV / Redis)
```

### Key Architectural Decisions (Planned)
- **PostGIS Geospatial Engine vs. Naive Math:** Rather than calculating distances in client JavaScript, Platemark stores locations as `GEOMETRY(Point, 4326)` in PostgreSQL. This allows spatial indexing (`GIST`) to execute viewport bounding-box queries (`ST_MakeEnvelope`) and radial proximity lookups (`ST_DWithin`) in under 20ms, even with thousands of saved pins.
- **Dynamic Viewport Clustering:** To maintain 60 FPS performance on mobile devices with high marker counts, the frontend implements `Supercluster` to group proximate venues into interactive cluster bubbles that smoothly expand on zoom.
- **Decoupled Places Enrichment Proxy:** Third-party Places API keys are guarded behind a Cloudflare Worker proxy that caches place metadata in KV storage. When a user adds "Pasticceria Marchesi", subsequent queries for the same venue resolve instantly from cache, minimizing external API costs.
- **Deep URL State Persistence:** Active filter sets (e.g. `?status=revisit&category=wine-bar&neighborhood=soho`) are reflected in browser query parameters, making filtered maps bookmarkable and shareable with a single tap.

---

## 3. Key Capabilities

| Capability Area | Common Frustration | Planned Platemark Solution | Target Outcome |
| :--- | :--- | :--- | :--- |
| **Status Clarity** | "Have I been here before or was this recommended by a friend?" | Explicit `Been & Revisit` vs. `Want to Visit` status tags | **Instant mental separation of tried vs. unvisited spots** |
| **Contextual Vibe Search** | Generic "restaurant" tags that miss mood, volume, or occasion | Multi-dimensional tags (Date Night, Solo Laptop, Group Feast) | **Find the right place in under 15 seconds** |
| **Map & List Synergy** | Tapping a map pin requires digging through separate tabs | Synchronized two-column viewport with hover & pan lock | **Zero context switching when browsing a neighborhood** |
| **Personal Memory Vault** | Forgetting what to order or which table to request | Personal notes field: specific dishes, seat tips, and cellar picks | **Never forget your favorite dish upon returning** |

---

## 4. Technical Details

### 1. Sub-20ms Viewport Queries via PostGIS GIST Indexing
Instead of calculating distances naively in client JavaScript or streaming thousands of global venue records, Platemark stores locations as `GEOMETRY(Point, 4326)` in PostgreSQL. Spatial GIST indexes evaluate viewport bounding-box queries (`ST_MakeEnvelope`) and radial proximity filters (`ST_DWithin`) in under 20ms, ensuring that panning across a dense city only fetches pins within the visible bounds.

### 2. Fluid 60 FPS Clustering with Supercluster
Rendering hundreds of unclustered vector pins degrades mobile canvas frame rates and drains battery. Platemark integrates `Supercluster` to dynamically aggregate proximate venues into interactive cluster bubbles at low zoom thresholds. As the user zooms in, clusters smoothly explode into individual venue pins with zero frame drops.

### 3. Edge Places Proxy & Zero-Friction Metadata Caching
Calling third-party Places APIs (Google Places / OSM) directly from the client is costly and risks rate limits. An edge Cloudflare Worker proxy intercepts venue searches, caching coordinates, operating hours, and neighborhood tags in Cloudflare KV. When one user adds a venue (e.g., *"Pasticceria Marchesi"*), subsequent lookups across all users resolve instantly from the edge with zero external API fees.

---

## 5. Status & Roadmap

**Current Stage:** `Concept` (Ideation & Spatial Architecture Designed)

Platemark is planned across 4 progressive engineering phases covering spatial data modeling, multi-axis filtering, API auto-enrichment, and curated guide sharing.

