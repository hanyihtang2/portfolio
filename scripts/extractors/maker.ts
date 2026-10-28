/**
 * MAKER Turborepo Monorepo Extractor (TASK-003 & FEAT-002)
 *
 * Traverses sibling MAKER repository, analyzing Turborepo workspace configs,
 * Next.js web app, Expo mobile app, shared packages, Cloudflare Pages hosting,
 * and live topology metrics.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ProjectExtractor, ProjectExtractionResult } from "./types.ts";
import type { ProjectFrontmatter, TechStack, Metric } from "../lib/frontmatter.ts";
import { calculateMakerMetrics } from "../adapters/metrics-calculator.ts";

export const MakerExtractor: ProjectExtractor = {
  slug: "maker",
  defaultRepoPath: path.resolve(process.cwd(), "../MAKER"),

  extract(targetRepoPath?: string): ProjectExtractionResult {
    const repoPath = targetRepoPath || this.defaultRepoPath;
    const warnings: string[] = [];

    if (!fs.existsSync(repoPath)) {
      warnings.push(`MAKER repository not found at: ${repoPath}`);
      return {
        slug: this.slug,
        repoPath,
        found: false,
        warnings,
        updates: {},
        summary: {},
      };
    }

    // 1. Read root package.json and turbo.json
    const rootPkgPath = path.join(repoPath, "package.json");
    let rootPkg: Record<string, any> = {};
    if (fs.existsSync(rootPkgPath)) {
      try {
        rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse root package.json: ${err.message}`);
      }
    }

    const hasTurbo = fs.existsSync(path.join(repoPath, "turbo.json"));

    // 2. Discover Workspaces (apps/ and packages/)
    const appsDir = path.join(repoPath, "apps");
    const packagesDir = path.join(repoPath, "packages");

    const apps = fs.existsSync(appsDir)
      ? fs.readdirSync(appsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
      : [];

    const packages = fs.existsSync(packagesDir)
      ? fs.readdirSync(packagesDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
      : [];

    const totalWorkspaces = apps.length + packages.length;

    // 3. Inspect apps/web
    const webPkgPath = path.join(appsDir, "web", "package.json");
    let webPkg: Record<string, any> = {};
    if (fs.existsSync(webPkgPath)) {
      try {
        webPkg = JSON.parse(fs.readFileSync(webPkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse apps/web/package.json: ${err.message}`);
      }
    }

    // 4. Inspect apps/mobile
    const mobilePkgPath = path.join(appsDir, "mobile", "package.json");
    let mobilePkg: Record<string, any> = {};
    if (fs.existsSync(mobilePkgPath)) {
      try {
        mobilePkg = JSON.parse(fs.readFileSync(mobilePkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse apps/mobile/package.json: ${err.message}`);
      }
    }

    // 5. Inspect packages/database
    const dbPkgPath = path.join(packagesDir, "database", "package.json");
    let dbPkg: Record<string, any> = {};
    if (fs.existsSync(dbPkgPath)) {
      try {
        dbPkg = JSON.parse(fs.readFileSync(dbPkgPath, "utf-8"));
      } catch (err: any) {
        warnings.push(`Failed to parse packages/database/package.json: ${err.message}`);
      }
    }

    // 6. Inspect hosting (wrangler.json / Cloudflare Pages)
    const hasWrangler = fs.existsSync(path.join(repoPath, "wrangler.json"));

    // 7. Compile Frameworks
    const frameworks: string[] = [];
    if (webPkg.dependencies?.["next"]) {
      frameworks.push("Next.js");
    }
    if (webPkg.dependencies?.["react"]) {
      frameworks.push("React 19");
    }
    if (mobilePkg.dependencies?.["expo"]) {
      frameworks.push("Expo / React Native");
    }
    if (webPkg.devDependencies?.["tailwindcss"]) {
      frameworks.push("Tailwind CSS");
    }

    // 8. Compile Infrastructure
    const infrastructure: string[] = [];
    if (hasWrangler) {
      infrastructure.push("Cloudflare Pages");
    }
    if (dbPkg.dependencies?.["@supabase/supabase-js"]) {
      infrastructure.push("Supabase (PostgreSQL & Auth)");
    }
    if (fs.existsSync(path.join(repoPath, ".github/workflows"))) {
      infrastructure.push("GitHub Actions");
    }

    // 9. Compile Tools
    const tools: string[] = [];
    if (hasTurbo) tools.push("Turborepo");
    tools.push("Zod");
    if (webPkg.dependencies?.["lucide-react"]) tools.push("Lucide Icons");
    if (rootPkg.workspaces) tools.push("npm Workspaces");

    const techStack: TechStack = {
      languages: ["TypeScript", "SQL (PL/pgSQL)", "CSS"],
      frameworks: frameworks.length > 0 ? frameworks : ["Next.js", "React 19", "Expo / React Native", "Tailwind CSS"],
      infrastructure: infrastructure.length > 0 ? infrastructure : ["Cloudflare Pages", "Supabase (PostgreSQL & Auth)", "GitHub Actions"],
      tools: tools.length > 0 ? tools : ["Turborepo", "Zod", "Lucide Icons", "npm Workspaces"],
    };

    const metrics: Metric[] = calculateMakerMetrics(repoPath);

    const updates: Partial<ProjectFrontmatter> = {
      status: "In Progress",
      timeline: "2026 – Present",
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
          totalWorkspaces,
          apps,
          packages,
          hasTurbo,
          hasWrangler,
        },
      },
    };
  },
};

// Self-test runner
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/extractors/maker.ts")) {
  console.log("Running MAKER Extractor test...");
  const result = MakerExtractor.extract();
  console.log("Result:", JSON.stringify(result, null, 2));
}
