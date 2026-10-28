/**
 * PlateMark Feature-to-Phase Roadmap Compiler (TASK-006)
 *
 * Compiles PlateMark's 17+ PM-as-Code features into 5 standardized portfolio
 * roadmap phases, calculating live milestone statuses and finished deliverables.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { RoadmapItem } from "../lib/frontmatter.ts";
import { extractDeliverablesForFeatures } from "./platemark-deliverables.ts";

export interface PhaseDefinition {
  phase: string;
  title: string;
  targetQuarter: string;
  summary: string;
  featurePrefixes: string[];
  fallbackDeliverables: string[];
}

export const PLATEMARK_PHASE_SPECS: PhaseDefinition[] = [
  {
    phase: "Phase 1",
    title: "Geospatial Data Core, Neon PostGIS & Interactive Atlas",
    targetQuarter: "Q4 2026",
    summary:
      "Built the geospatial data foundation on Neon Serverless Postgres with PostGIS, Drizzle ORM schema, and a high-performance MapLibre GL vector canvas with dynamic venue pin rendering.",
    featurePrefixes: [
      "FEAT-001",
      "FEAT-002",
    ],
    fallbackDeliverables: [
      "Relational database schema with PostGIS GEOMETRY(Point, 4326) coordinates and GIST spatial indices",
      "Dual-status state engine modeling 'Been & Revisit' vs. 'Want to Visit' lifecycle",
      "Responsive MapLibre GL canvas featuring smooth vector tile rendering and location geocoding",
      "Sub-20ms spatial query endpoints (/api/places) with automated seed dataset and migrations via Drizzle ORM",
    ],
  },
  {
    phase: "Phase 2",
    title: "Tactile Bistro Design System, Multi-Axis Filtering & Mobile Atlas",
    targetQuarter: "Q4 2026",
    summary:
      "Crafted a tokenized design system ('Tactile Bistro'), multi-axis faceted filter engine, and responsive mobile bottom-sheet atlas experience.",
    featurePrefixes: [
      "FEAT-003",
      "FEAT-006",
      "FEAT-007",
      "FEAT-008",
      "TECH-001",
      "TECH-002",
      "TECH-003",
      "TECH-004",
      "TECH-005",
      "TECH-006",
    ],
    fallbackDeliverables: [
      "Unified design tokens with 8-hue category colorway, light/dark themes, and cross-platform SVG country flags",
      "Zustand multi-axis filter store with cascading tri-state destination selectors and price/status filters",
      "Supercluster viewport marker aggregation maintaining 60 FPS panning across dense urban clusters",
      "Mobile-first full-bleed atlas layout with multi-snap bottom sheet and sheet-aware camera offset",
      "50+ unit and integration test suite powered by Vitest and React Testing Library",
    ],
  },
  {
    phase: "Phase 3",
    title: "Single-Curator Better Auth, PM-as-Code & Netlify Deployment",
    targetQuarter: "Q4 2026",
    summary:
      "Deployed production infrastructure on Netlify with serverless Neon connection pooling, single-curator Better Auth allowlist gating, and repository-native PM-as-Code execution.",
    featurePrefixes: [
      "FEAT-004",
      "FEAT-005",
      "INFRA-001",
      "INFRA-002",
      "TECH-007",
    ],
    fallbackDeliverables: [
      "Production Netlify deployment with Next.js 16 runtime and pooled SSL Neon Postgres connection",
      "Better Auth authentication core tables with strict curator email allowlist route-guard middleware",
      "Repository-native PM-as-Code system (pm/) tracking PRDs, stage-based task Kanban boards, and codebase area mappings",
      "CLI tooling (scripts/pm.ts) for automated Kanban status tracking and roadmap regeneration",
      "Local PostGIS Docker environment for reproducible offline development and CI workflows",
    ],
  },
  {
    phase: "Phase 4",
    title: "Place Curation Workspace, Geocoding & Places Enrichment",
    targetQuarter: "Q1 2027",
    summary:
      "Build out the interactive venue directory table workspace, tactile add-place modal, address geocoding, and third-party Places API metadata enrichment.",
    featurePrefixes: [
      "FEAT-009",
      "FEAT-010",
    ],
    fallbackDeliverables: [
      "Interactive table and list curation workspace (/directory) with in-place status switcher",
      "Tactile 'Add New Place' modal dialog with TanStack Query optimistic mutations",
      "Address forward and reverse geocoding via MapLibre GL geocoding services",
      "Automated metadata enrichment for venue hours, phone numbers, and neighborhood tags",
    ],
  },
  {
    phase: "Phase 5",
    title: "Collaborative Notebooks, Lists & Multi-User Sharing",
    targetQuarter: "Q2 2027",
    summary:
      "Introduce multi-user shared maps, curated recommendation lists, and read-only invite links for dining itineraries.",
    featurePrefixes: [
      "FEAT-011",
    ],
    fallbackDeliverables: [
      "Public and unlisted read-only itinerary link generation for mobile sharing",
      "Custom list builder (e.g. 'Tokyo Ramen Odyssey', 'Brooklyn Natural Wine') with tag taxonomies",
      "Collaborative notebook editing with contributor permissions",
      "Export to Google Maps Saved Places and Apple Maps guides",
    ],
  },
];

interface FeatureInfo {
  dirName: string;
  status: "completed" | "active" | "in-progress" | "ready" | "draft";
  targetRelease?: string;
}

function parseFeaturePrd(prdPath: string): { status: string; targetRelease?: string } {
  try {
    const content = fs.readFileSync(prdPath, "utf-8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return { status: "ready" };

    let status = "ready";
    let targetRelease: string | undefined;

    for (const line of match[1].split(/\r?\n/)) {
      const colon = line.indexOf(":");
      if (colon > 0) {
        const k = line.slice(0, colon).trim();
        const v = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
        if (k === "status") status = v.toLowerCase();
        if (k === "target_release") targetRelease = v;
      }
    }

    return { status, targetRelease };
  } catch {
    return { status: "ready" };
  }
}

export function compilePlateMarkRoadmap(pmDir: string): RoadmapItem[] {
  const featuresBaseDir = path.join(pmDir, "features");
  if (!fs.existsSync(featuresBaseDir)) {
    // If not found, return baseline phase specs with fallbacks
    return PLATEMARK_PHASE_SPECS.map((spec) => ({
      phase: spec.phase,
      title: spec.title,
      status: spec.phase === "Phase 1" || spec.phase === "Phase 2" ? "Completed" : spec.phase === "Phase 3" ? "In Progress" : "Planned",
      targetQuarter: spec.targetQuarter,
      summary: spec.summary,
      deliverables: spec.fallbackDeliverables,
    }));
  }

  // Discover all feature folders
  const allDirs = fs
    .readdirSync(featuresBaseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const featureMap = new Map<string, FeatureInfo>();
  for (const d of allDirs) {
    const prdPath = path.join(featuresBaseDir, d, "prd.md");
    const { status, targetRelease } = parseFeaturePrd(prdPath);
    featureMap.set(d, {
      dirName: d,
      status: status as any,
      targetRelease,
    });
  }

  const compiledRoadmap: RoadmapItem[] = [];

  for (const spec of PLATEMARK_PHASE_SPECS) {
    // Find all matching feature folders
    const matchingDirs = allDirs.filter((dir) =>
      spec.featurePrefixes.some((prefix) => dir.toUpperCase().startsWith(prefix.toUpperCase()))
    );

    // Compute status
    let status: "Completed" | "In Progress" | "Planned" = "Planned";
    if (matchingDirs.length > 0) {
      const statuses = matchingDirs.map((dir) => featureMap.get(dir)?.status || "ready");
      const allDone = statuses.every((s) => s === "completed");
      const hasActive = statuses.some((s) => s === "completed" || s === "active" || s === "in-progress");

      if (allDone) {
        status = "Completed";
      } else if (hasActive) {
        status = "In Progress";
      } else {
        status = "Planned";
      }
    } else {
      // Default baseline
      status = spec.phase === "Phase 1" || spec.phase === "Phase 2" ? "Completed" : spec.phase === "Phase 3" ? "In Progress" : "Planned";
    }

    // Extract real deliverables from tasks/3-done/
    const deliverables = extractDeliverablesForFeatures(featuresBaseDir, {
      featureDirs: matchingDirs,
      maxDeliverables: 5,
      fallbackDeliverables: spec.fallbackDeliverables,
    });

    compiledRoadmap.push({
      phase: spec.phase,
      title: spec.title,
      status,
      targetQuarter: spec.targetQuarter,
      summary: spec.summary,
      deliverables: deliverables.length > 0 ? deliverables : spec.fallbackDeliverables,
    });
  }

  return compiledRoadmap;
}

// Self-test runner
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/adapters/platemark-roadmap.ts")) {
  const pmDir = path.resolve(process.cwd(), "../PlateMark/pm");
  console.log("Compiling PlateMark Roadmap from:", pmDir);
  const roadmap = compilePlateMarkRoadmap(pmDir);
  console.log("\nCompiled Roadmap:", JSON.stringify(roadmap, null, 2));
}

