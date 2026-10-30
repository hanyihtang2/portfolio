/**
 * Automated Verification & Astro Build Gate for Case Study Updates
 *
 * Usage:
 *   node --experimental-strip-types scripts/agent/verify-case-study.ts --slug platemark
 *   node --experimental-strip-types scripts/agent/verify-case-study.ts --all
 *   node --experimental-strip-types scripts/agent/verify-case-study.ts --all --skip-build
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { parseProjectMarkdown } from "../lib/frontmatter.ts";

const PROJECTS_DIR = path.resolve(process.cwd(), "src/content/projects");
const PUBLIC_DIR = path.resolve(process.cwd(), "public");

interface VerificationIssue {
  severity: "error" | "warning";
  message: string;
}

interface ProjectVerificationResult {
  slug: string;
  filePath: string;
  passed: boolean;
  issues: VerificationIssue[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let slug: string | undefined;
  let all = false;
  let skipBuild = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--slug" && args[i + 1]) {
      slug = args[i + 1].toLowerCase();
      i++;
    } else if (arg === "--all") {
      all = true;
    } else if (arg === "--skip-build") {
      skipBuild = true;
    }
  }

  return { slug, all, skipBuild };
}

function verifyProjectFile(filePath: string): ProjectVerificationResult {
  const slug = path.basename(filePath, path.extname(filePath));
  const issues: VerificationIssue[] = [];

  if (!fs.existsSync(filePath)) {
    return {
      slug,
      filePath,
      passed: false,
      issues: [{ severity: "error", message: `File does not exist: ${filePath}` }],
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  let parsed;

  try {
    parsed = parseProjectMarkdown(content);
  } catch (err: any) {
    return {
      slug,
      filePath,
      passed: false,
      issues: [{ severity: "error", message: `YAML frontmatter parsing failed: ${err.message}` }],
    };
  }

  const { data, body } = parsed;

  // 1. Core Frontmatter Validation
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    issues.push({ severity: "error", message: "Missing or invalid 'title'." });
  }

  if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
    issues.push({ severity: "error", message: "Missing or invalid 'description'." });
  }

  if (!data.publishDate) {
    issues.push({ severity: "error", message: "Missing 'publishDate'." });
  } else {
    const d = new Date(data.publishDate);
    if (isNaN(d.getTime())) {
      issues.push({ severity: "error", message: `'publishDate' is not a valid date: ${data.publishDate}` });
    }
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    issues.push({ severity: "error", message: "'tags' must be a non-empty array of strings." });
  }

  const validStatuses = ["Completed", "In Progress", "Concept"];
  if (!data.status || !validStatuses.includes(data.status)) {
    issues.push({
      severity: "error",
      message: `'status' must be one of: ${validStatuses.join(", ")} (got "${data.status}")`,
    });
  }

  // 2. URLs validation
  const validateUrl = (url: string | undefined, label: string) => {
    if (!url) return;
    try {
      new URL(url);
    } catch {
      issues.push({ severity: "error", message: `Invalid ${label} URL: "${url}"` });
    }
  };

  validateUrl(data.githubUrl, "githubUrl");
  validateUrl(data.liveUrl, "liveUrl");

  // 3. Mockup Assets Validation
  const validateAssetPath = (assetPath: string | undefined, label: string) => {
    if (!assetPath) return;
    if (!assetPath.startsWith("/")) {
      issues.push({ severity: "warning", message: `${label} should start with '/' (got "${assetPath}")` });
    }
    const localFsPath = path.join(PUBLIC_DIR, assetPath.replace(/^\//, ""));
    if (!fs.existsSync(localFsPath)) {
      issues.push({
        severity: "error",
        message: `${label} asset file not found in public folder: "${assetPath}" (resolved to ${localFsPath})`,
      });
    }
  };

  validateAssetPath(data.mockupImage, "mockupImage");
  validateAssetPath(data.mobileMockupImage, "mobileMockupImage");

  // 4. Metrics Validation
  if (data.metrics) {
    if (!Array.isArray(data.metrics)) {
      issues.push({ severity: "error", message: "'metrics' must be an array." });
    } else {
      for (let i = 0; i < data.metrics.length; i++) {
        const m = data.metrics[i];
        if (!m.label || !m.value) {
          issues.push({ severity: "error", message: `metrics[${i}] missing required label or value.` });
        }
      }
    }
  }

  // 5. Roadmap Validation
  if (data.roadmap) {
    if (!Array.isArray(data.roadmap)) {
      issues.push({ severity: "error", message: "'roadmap' must be an array." });
    } else {
      const validRoadmapStatuses = ["Completed", "In Progress", "Planned"];
      for (let i = 0; i < data.roadmap.length; i++) {
        const r = data.roadmap[i];
        if (!r.phase || !r.title || !r.status || !r.summary) {
          issues.push({ severity: "error", message: `roadmap[${i}] missing phase, title, status, or summary.` });
        }
        if (r.status && !validRoadmapStatuses.includes(r.status)) {
          issues.push({
            severity: "error",
            message: `roadmap[${i}] has invalid status "${r.status}". Expected: ${validRoadmapStatuses.join(", ")}`,
          });
        }
        if (!Array.isArray(r.deliverables) || r.deliverables.length === 0) {
          issues.push({ severity: "warning", message: `roadmap[${i}] deliverables is empty.` });
        }
      }
    }
  }

  // 6. Markdown Body Structural Integrity
  const codeFenceMatches = body.match(/```/g) || [];
  if (codeFenceMatches.length % 2 !== 0) {
    issues.push({ severity: "error", message: "Unbalanced code fences (```) detected in markdown body." });
  }

  if (body.trim().length < 150) {
    issues.push({ severity: "warning", message: "Markdown body appears suspiciously short (< 150 chars)." });
  }

  const h2Count = (body.match(/^##\s+/gm) || []).length;
  if (h2Count === 0) {
    issues.push({ severity: "warning", message: "No H2 sections (##) found in body for quick jump navigation." });
  }

  const hasErrors = issues.some((i) => i.severity === "error");

  return {
    slug,
    filePath,
    passed: !hasErrors,
    issues,
  };
}

function runAstroBuildGate(): boolean {
  console.log(`\n============================================================`);
  console.log(`   Running Astro Static Build Gate (astro check && astro build)`);
  console.log(`============================================================\n`);

  try {
    const isWindows = process.platform === "win32";
    const npmCmd = isWindows ? "npm.cmd" : "npm";
    execSync(`${npmCmd} run build`, { stdio: "inherit" });
    console.log(`\n\x1b[32m✓ Astro static build passed with 0 errors!\x1b[0m\n`);
    return true;
  } catch {
    console.error(`\n\x1b[31m✗ Astro build check failed. See compiler output above.\x1b[0m\n`);
    return false;
  }
}

function main() {
  const { slug, all, skipBuild } = parseArgs();

  console.log(`\n============================================================`);
  console.log(`   Portfolio Case Study Verification Gate`);
  console.log(`============================================================\n`);

  let filesToVerify: string[] = [];

  if (slug) {
    const targetFile = path.join(PROJECTS_DIR, `${slug}.md`);
    if (!fs.existsSync(targetFile)) {
      console.error(`Error: Project case study "${slug}.md" not found in ${PROJECTS_DIR}`);
      process.exit(1);
    }
    filesToVerify.push(targetFile);
  } else if (all) {
    filesToVerify = fs
      .readdirSync(PROJECTS_DIR)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
      .map((f) => path.join(PROJECTS_DIR, f));
  } else {
    // Default to platemark if no argument passed
    const defaultTarget = path.join(PROJECTS_DIR, "platemark.md");
    if (fs.existsSync(defaultTarget)) {
      filesToVerify.push(defaultTarget);
    }
  }

  let totalPassed = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const file of filesToVerify) {
    const result = verifyProjectFile(file);
    const errorCount = result.issues.filter((i) => i.severity === "error").length;
    const warnCount = result.issues.filter((i) => i.severity === "warning").length;

    totalErrors += errorCount;
    totalWarnings += warnCount;

    if (result.passed) {
      totalPassed++;
      console.log(`\x1b[32m✓ [PASSED]\x1b[0m ${result.slug}.md`);
    } else {
      console.log(`\x1b[31m✗ [FAILED]\x1b[0m ${result.slug}.md (${errorCount} errors, ${warnCount} warnings)`);
    }

    for (const issue of result.issues) {
      const color = issue.severity === "error" ? "\x1b[31m" : "\x1b[33m";
      console.log(`    ${color}[${issue.severity.toUpperCase()}]\x1b[0m ${issue.message}`);
    }
  }

  console.log(`\nSummary: Verified ${filesToVerify.length} file(s). ${totalPassed} passed, ${totalErrors} error(s), ${totalWarnings} warning(s).`);

  if (totalErrors > 0) {
    console.error(`\n\x1b[31mVerification failed with ${totalErrors} error(s).\x1b[0m`);
    process.exit(1);
  }

  if (!skipBuild) {
    const buildSuccess = runAstroBuildGate();
    if (!buildSuccess) {
      process.exit(1);
    }
  }

  console.log(`\x1b[32mAll verification gates passed successfully!\x1b[0m\n`);
}

main();

