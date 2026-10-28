/**
 * PlateMark Repository Extractor (TASK-002 & FEAT-002)
 *
 * Inspects sibling PlateMark repository, extracting package dependencies,
 * deployment configurations, PM-as-Code feature progress, live test metrics, and compiled roadmap.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ProjectExtractor, ProjectExtractionResult } from "./types.ts";
import type { ProjectFrontmatter, TechStack, Metric, RoadmapItem } from "../lib/frontmatter.ts";
import { compilePlateMarkRoadmap } from "../adapters/platemark-roadmap.ts";
import { calculatePlateMarkMetrics } from "../adapters/metrics-calculator.ts";

export const PlateMarkExtractor: ProjectExtractor = {
  slug: "platemark",
  defaultRepoPath: path.resolve(process.cwd(), "../PlateMark"),

  extract(targetRepoPath?: string): ProjectExtractionResult {
    const repoPath = targetRepoPath || this.defaultRepoPath;
    const warnings: string[] = [];

    if (!fs.existsSync(repoPath)) {
      warnings.push(`PlateMark repository not found at: ${repoPath}`);
      return {
        slug: this.slug,
        repoPath,
        found: false,
        warnings,
        updates: {},
        summary: {},
      };
    }

    // 1. Read package.json
    const pkgPath = path.join(repoPath, "package.json");
    let pkg: Record<string, any> = {};
    if (fs.existsSync(pkgPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse package.json: ${err.message}`);
      }
    } else {
      warnings.push(`package.json not found in ${repoPath}`);
    }

    const allDeps: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    // 2. Derive Frameworks
    const frameworks: string[] = [];
    if (allDeps["next"]) {
      const nextMajor = allDeps["next"].replace(/[\^~]/, "").split(".")[0];
      frameworks.push(nextMajor ? `Next.js ${nextMajor}` : "Next.js");
    }
    if (allDeps["react"]) {
      const reactMajor = allDeps["react"].replace(/[\^~]/, "").split(".")[0];
      frameworks.push(reactMajor ? `React ${reactMajor}` : "React");
    }
    if (allDeps["maplibre-gl"]) {
      frameworks.push("MapLibre GL");
    }
    if (allDeps["tailwindcss"]) {
      const twVer = allDeps["tailwindcss"].replace(/[\^~]/, "").split(".")[0];
      frameworks.push(twVer ? `Tailwind CSS v${twVer}` : "Tailwind CSS");
    }

    // 3. Derive Infrastructure
    const infrastructure: string[] = [];
    if (allDeps["@neondatabase/serverless"]) {
      infrastructure.push("Neon (Serverless Postgres + PostGIS)");
    }
    if (fs.existsSync(path.join(repoPath, "netlify.toml"))) {
      infrastructure.push("Netlify (Next.js Runtime & Edge CDN)");
    }
    infrastructure.push("Cloudflare Workers (Places API Proxy)");

    // 4. Derive Tools
    const tools: string[] = [];
    if (allDeps["drizzle-orm"]) tools.push("Drizzle ORM");
    if (allDeps["drizzle-kit"]) tools.push("Drizzle Kit");
    if (allDeps["better-auth"]) tools.push("Better Auth");
    if (allDeps["supercluster"]) tools.push("Supercluster");
    if (allDeps["zustand"]) tools.push("Zustand");
    if (allDeps["@tanstack/react-query"]) tools.push("TanStack Query");
    if (allDeps["vitest"]) tools.push("Vitest");
    if (fs.existsSync(path.join(repoPath, "scripts/pm.ts"))) {
      tools.push("PM-as-Code CLI (tsx pm.ts)");
    }

    // 5. Calculate Metrics & Roadmap
    const pmDir = path.join(repoPath, "pm");
    const metrics: Metric[] = calculatePlateMarkMetrics(repoPath);
    const roadmap: RoadmapItem[] = compilePlateMarkRoadmap(pmDir);

    const techStack: TechStack = {
      languages: ["TypeScript", "SQL (PostGIS)", "CSS"],
      frameworks: frameworks.length > 0 ? frameworks : ["Next.js 16", "React 19", "MapLibre GL", "Tailwind CSS v4"],
      infrastructure: infrastructure.length > 0 ? infrastructure : ["Neon (Serverless Postgres + PostGIS)", "Netlify (Next.js Runtime & Edge CDN)"],
      tools: tools.length > 0 ? tools : ["Drizzle ORM", "Better Auth", "Supercluster", "Zustand", "TanStack Query", "Vitest"],
    };

    const updates: Partial<ProjectFrontmatter> = {
      status: "In Progress",
      timeline: "2026 – Present (Active Development)",
      techStack,
      metrics,
      roadmap,
    };

    return {
      slug: this.slug,
      repoPath,
      found: true,
      warnings,
      updates,
      summary: {
        status: updates.status,
        timeline: updates.timeline,
        techStackSummary: `${frameworks.join(", ")} | ${infrastructure.join(", ")}`,
        metricsCount: metrics.length,
        details: {
          roadmapPhases: roadmap.length,
        },
      },
    };
  },
};

// Self-test runner
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/extractors/platemark.ts")) {
  console.log("Running PlateMark Extractor test...");
  const result = PlateMarkExtractor.extract();
  console.log("Result:", JSON.stringify(result, null, 2));
}
