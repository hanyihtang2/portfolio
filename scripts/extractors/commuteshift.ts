/**
 * CommuteShift SPA Extractor (TASK-004 & FEAT-002)
 *
 * Inspects sibling CommuteShift repository, extracting Vite build configurations,
 * React/Tailwind versions, Vercel deployment status, and test suite verification metrics.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ProjectExtractor, ProjectExtractionResult } from "./types.ts";
import type { ProjectFrontmatter, TechStack, Metric } from "../lib/frontmatter.ts";
import { calculateCommuteShiftMetrics } from "../adapters/metrics-calculator.ts";

export const CommuteShiftExtractor: ProjectExtractor = {
  slug: "commuteshift",
  defaultRepoPath: path.resolve(process.cwd(), "../CommuteShift"),

  extract(targetRepoPath?: string): ProjectExtractionResult {
    const repoPath = targetRepoPath || this.defaultRepoPath;
    const warnings: string[] = [];

    if (!fs.existsSync(repoPath)) {
      warnings.push(`CommuteShift repository not found at: ${repoPath}`);
      return {
        slug: this.slug,
        repoPath,
        found: false,
        warnings,
        updates: {},
        summary: {},
      };
    }

    // 1. Check for Standardized portfolio-meta.json Contract (TASK-008)
    const metaPath = path.join(repoPath, "portfolio-meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        const metaContent = fs.readFileSync(metaPath, "utf-8");
        const meta = JSON.parse(metaContent);

        const updates: Partial<ProjectFrontmatter> = {};
        if (meta.status) updates.status = meta.status;
        if (meta.timeline) updates.timeline = meta.timeline;
        if (meta.role) updates.role = meta.role;
        if (meta.techStack) updates.techStack = meta.techStack;
        if (meta.metrics) updates.metrics = meta.metrics;
        if (meta.roadmap) updates.roadmap = meta.roadmap;

        const frameworks = meta.techStack?.frameworks || [];
        const infrastructure = meta.techStack?.infrastructure || [];

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
            metricsCount: updates.metrics?.length || 0,
            details: {
              source: "portfolio-meta.json (Standard Contract)",
              roadmapPhases: updates.roadmap?.length || 0,
              metricsCount: updates.metrics?.length || 0,
            },
          },
        };
      } catch (err: any) {
        warnings.push(`Failed to parse portfolio-meta.json: ${err.message}. Falling back to heuristic extraction.`);
      }
    }

    // 2. Fallback: Read package.json
    const pkgPath = path.join(repoPath, "package.json");
    let pkg: Record<string, any> = {};
    if (fs.existsSync(pkgPath)) {
      try {
        pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse package.json: ${err.message}`);
      }
    }

    const allDeps: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    // 2. Derive Frameworks
    const frameworks: string[] = [];
    if (allDeps["react"]) {
      const reactVer = allDeps["react"].replace(/[\^~]/, "").split(".")[0];
      frameworks.push(reactVer ? `React ${reactVer}` : "React");
    }
    if (allDeps["tailwindcss"]) {
      frameworks.push("Tailwind CSS");
    }
    if (allDeps["vite"]) {
      const viteVer = allDeps["vite"].replace(/[\^~]/, "").split(".")[0];
      frameworks.push(viteVer ? `Vite ${viteVer}` : "Vite");
    }

    // 3. Derive Infrastructure
    const infrastructure: string[] = [];
    if (fs.existsSync(path.join(repoPath, "vercel.json"))) {
      infrastructure.push("Vercel");
    }
    infrastructure.push("GitHub");

    // 4. Inspect test suite (test-all.mjs)
    const testSuitePath = path.join(repoPath, "test-all.mjs");
    let testCount = 10;
    if (fs.existsSync(testSuitePath)) {
      try {
        const testContent = fs.readFileSync(testSuitePath, "utf-8");
        const matches = testContent.match(/\/\/\s*Test\s*\d+:/gi);
        if (matches) {
          testCount = matches.length;
        }
      } catch {
        // fallback
      }
    }

    // 5. Derive Tools
    const tools: string[] = [];
    if (allDeps["lucide-react"]) tools.push("Lucide React");
    tools.push(`Fare Math Test Suite (${testCount} Scenarios)`);
    tools.push("URL Query State Sync");

    const techStack: TechStack = {
      languages: ["TypeScript", "JavaScript (ES Modules)", "CSS"],
      frameworks: frameworks.length > 0 ? frameworks : ["React 18", "Tailwind CSS", "Vite 5"],
      infrastructure: infrastructure.length > 0 ? infrastructure : ["Vercel", "GitHub"],
      tools,
    };

    const metrics: Metric[] = calculateCommuteShiftMetrics(repoPath);

    const updates: Partial<ProjectFrontmatter> = {
      status: "Completed",
      timeline: "2026 (v1.0 MVP Live)",
      techStack,
      metrics,
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
          version: pkg.version || "1.0.0",
          testCount,
          hasVercel: infrastructure.includes("Vercel"),
        },
      },
    };
  },
};

// Self-test runner
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/extractors/commuteshift.ts")) {
  console.log("Running CommuteShift Extractor test...");
  const result = CommuteShiftExtractor.extract();
  console.log("Result:", JSON.stringify(result, null, 2));
}
