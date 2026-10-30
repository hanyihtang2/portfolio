/**
 * Git Diff and Commit Synthesizer for Portfolio Case Study AI Co-Pilot
 *
 * Usage:
 *   node --experimental-strip-types scripts/agent/synthesize-commits.ts --project platemark
 *   node --experimental-strip-types scripts/agent/synthesize-commits.ts --project maker --limit 20
 *   node --experimental-strip-types scripts/agent/synthesize-commits.ts --all
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

interface ProjectRepoConfig {
  slug: string;
  name: string;
  defaultDir: string;
  docPath: string;
}

const REGISTERED_PROJECTS: Record<string, ProjectRepoConfig> = {
  platemark: {
    slug: "platemark",
    name: "PlateMark",
    defaultDir: path.resolve(process.cwd(), "../PlateMark"),
    docPath: path.resolve(process.cwd(), "src/content/projects/platemark.md"),
  },
  maker: {
    slug: "maker",
    name: "MAKER",
    defaultDir: path.resolve(process.cwd(), "../MAKER"),
    docPath: path.resolve(process.cwd(), "src/content/projects/maker.md"),
  },
  commuteshift: {
    slug: "commuteshift",
    name: "CommuteShift",
    defaultDir: path.resolve(process.cwd(), "../CommuteShift"),
    docPath: path.resolve(process.cwd(), "src/content/projects/commuteshift.md"),
  },
};

interface CommitSummary {
  hash: string;
  type: string;
  scope?: string;
  message: string;
  raw: string;
}

interface FeatureProgressSummary {
  featureId: string;
  title: string;
  status: string;
  doneTasks: string[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  let project: string | undefined;
  let limit = 25;
  let since: string | undefined;
  let all = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--project" && args[i + 1]) {
      project = args[i + 1].toLowerCase();
      i++;
    } else if (arg === "--limit" && args[i + 1]) {
      limit = parseInt(args[i + 1], 10) || 25;
      i++;
    } else if (arg === "--since" && args[i + 1]) {
      since = args[i + 1];
      i++;
    } else if (arg === "--all") {
      all = true;
    }
  }

  return { project, limit, since, all };
}

function extractDateFromDoc(docPath: string): string | undefined {
  if (!fs.existsSync(docPath)) return undefined;
  const content = fs.readFileSync(docPath, "utf-8");
  const match = content.match(/publishDate:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
  return match ? match[1] : undefined;
}

function getGitCommits(repoDir: string, limit: number, sinceDate?: string): CommitSummary[] {
  if (!fs.existsSync(repoDir)) return [];

  let gitCmd = `git -C "${repoDir}" log -n ${limit} --oneline --no-merges`;
  if (sinceDate) {
    gitCmd += ` --since="${sinceDate}"`;
  }

  try {
    const stdout = execSync(gitCmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
    const lines = stdout.split(/\r?\n/).filter(Boolean);

    return lines.map((line) => {
      const match = line.match(/^([a-f0-9]+)\s+(?:([a-z]+)(?:\(([^)]+)\))?:\s+)?(.*)$/i);
      if (!match) {
        return {
          hash: line.slice(0, 7),
          type: "other",
          message: line.slice(8),
          raw: line,
        };
      }

      return {
        hash: match[1],
        type: match[2] ? match[2].toLowerCase() : "other",
        scope: match[3],
        message: match[4] || line,
        raw: line,
      };
    });
  } catch {
    return [];
  }
}

function inspectPMFeatures(repoDir: string): FeatureProgressSummary[] {
  const pmFeaturesDir = path.join(repoDir, "pm", "features");
  if (!fs.existsSync(pmFeaturesDir)) return [];

  const results: FeatureProgressSummary[] = [];

  try {
    const featureFolders = fs.readdirSync(pmFeaturesDir).filter((f) => {
      return fs.statSync(path.join(pmFeaturesDir, f)).isDirectory();
    });

    for (const folder of featureFolders) {
      const prdPath = path.join(pmFeaturesDir, folder, "prd.md");
      let title = folder;
      let status = "active";

      if (fs.existsSync(prdPath)) {
        const prdContent = fs.readFileSync(prdPath, "utf-8");
        const titleMatch = prdContent.match(/title:\s*["']?([^"'\r\n]+)["']?/);
        const statusMatch = prdContent.match(/status:\s*([a-zA-Z0-9_-]+)/);
        if (titleMatch) title = titleMatch[1].trim();
        if (statusMatch) status = statusMatch[1].trim();
      }

      const doneTasksDir = path.join(pmFeaturesDir, folder, "tasks", "3-done");
      let doneTasks: string[] = [];
      if (fs.existsSync(doneTasksDir)) {
        doneTasks = fs
          .readdirSync(doneTasksDir)
          .filter((t) => t.endsWith(".md"))
          .map((t) => t.replace(/^TASK-\d+-/, "").replace(/\.md$/, "").replace(/-/g, " "));
      }

      if (doneTasks.length > 0 || status === "completed") {
        results.push({
          featureId: folder.split("-")[0] || folder,
          title,
          status,
          doneTasks,
        });
      }
    }
  } catch {
    // Graceful skip
  }

  return results;
}

function synthesizeProject(config: ProjectRepoConfig, limit: number, sinceOverride?: string) {
  const docDate = extractDateFromDoc(config.docPath);
  const sinceDate = sinceOverride || docDate;

  console.log(`\n============================================================`);
  console.log(`   Synthesis Context: ${config.name} (${config.slug})`);
  console.log(`   Repository: ${config.defaultDir}`);
  if (sinceDate) console.log(`   Since: ${sinceDate}`);
  console.log(`============================================================\n`);

  if (!fs.existsSync(config.defaultDir)) {
    console.log(`⚠️  Repository directory not found at: ${config.defaultDir}`);
    console.log(`Skipping commit synthesis for ${config.name}.\n`);
    return;
  }

  const commits = getGitCommits(config.defaultDir, limit, sinceDate);
  const pmFeatures = inspectPMFeatures(config.defaultDir);

  console.log(`## 1. Recent Commits Summary (Total: ${commits.length})\n`);

  const categorized: Record<string, CommitSummary[]> = {
    feat: [],
    perf: [],
    refactor: [],
    fix: [],
    docs: [],
    other: [],
  };

  for (const c of commits) {
    if (categorized[c.type]) {
      categorized[c.type].push(c);
    } else {
      categorized.other.push(c);
    }
  }

  const printGroup = (label: string, items: CommitSummary[]) => {
    if (items.length === 0) return;
    console.log(`### ${label} (${items.length})`);
    for (const item of items) {
      const scopeBadge = item.scope ? `**[${item.scope}]** ` : "";
      console.log(`- \`${item.hash}\` ${scopeBadge}${item.message}`);
    }
    console.log("");
  };

  printGroup("Features & Capabilities (`feat`)", categorized.feat);
  printGroup("Performance & Latency (`perf`)", categorized.perf);
  printGroup("Architecture & Refactors (`refactor`)", categorized.refactor);
  printGroup("Bug Fixes & Hardening (`fix`)", categorized.fix);
  printGroup("Documentation & PRDs (`docs`)", categorized.docs);
  if (categorized.other.length > 0) {
    printGroup("Other Commits", categorized.other);
  }

  if (pmFeatures.length > 0) {
    console.log(`## 2. Product Management Milestones (PM-as-Code)\n`);
    for (const f of pmFeatures) {
      console.log(`- **${f.featureId}**: ${f.title} \`(${f.status})\``);
      for (const t of f.doneTasks.slice(0, 4)) {
        console.log(`    ✓ ${t}`);
      }
    }
    console.log("");
  }

  console.log(`## 3. Co-Pilot Drafting Recommendations\n`);
  console.log(`When drafting narrative additions for \`${config.docPath}\`:`);
  if (categorized.feat.length > 0) {
    console.log(`- Focus on explaining the UX decisions behind: ${categorized.feat.map((f) => f.scope || f.message).slice(0, 3).join(", ")}.`);
  }
  if (categorized.refactor.length > 0) {
    console.log(`- Document the architectural trade-offs that motivated: ${categorized.refactor.map((r) => r.message).slice(0, 2).join("; ")}.`);
  }
  console.log(`- Validate with \`node --experimental-strip-types scripts/agent/verify-case-study.ts --slug ${config.slug}\`.\n`);
}

function main() {
  const { project, limit, since, all } = parseArgs();

  if (all) {
    for (const key of Object.keys(REGISTERED_PROJECTS)) {
      synthesizeProject(REGISTERED_PROJECTS[key], limit, since);
    }
    return;
  }

  const targetSlug = project || "platemark";
  const config = REGISTERED_PROJECTS[targetSlug];

  if (!config) {
    console.error(`Error: Unknown project "${targetSlug}".`);
    console.error(`Available projects: ${Object.keys(REGISTERED_PROJECTS).join(", ")}`);
    process.exit(1);
  }

  synthesizeProject(config, limit, since);
}

main();

