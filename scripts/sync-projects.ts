/**
 * Portfolio Cross-Repository Project Sync CLI (TASK-005)
 *
 * Scans sibling project repositories, extracts live tech stacks, versions,
 * PM-as-Code metrics, and updates project markdown frontmatter in
 * src/content/projects/*.md while preserving 100% of case study markdown bodies.
 *
 * Usage:
 *   npm run sync:projects
 *   npm run sync:projects -- --project platemark
 *   npm run sync:projects -- --dry-run
 *   npm run sync:projects -- --verbose
 */

import * as path from "node:path";
import * as fs from "node:fs";
import { updateProjectFrontmatter } from "./lib/frontmatter.ts";
import { ALL_EXTRACTORS, type ProjectExtractor } from "./extractors/index.ts";

interface ProjectSyncMapping {
  slug: string;
  name: string;
  repoPath: string;
  targetFile: string;
  extractor: ProjectExtractor;
}

const PROJECT_MAPPINGS: ProjectSyncMapping[] = [
  {
    slug: "platemark",
    name: "PlateMark",
    repoPath: path.resolve(process.cwd(), "../PlateMark"),
    targetFile: "src/content/projects/platemark.md",
    extractor: ALL_EXTRACTORS.platemark,
  },
  {
    slug: "maker",
    name: "MAKER",
    repoPath: path.resolve(process.cwd(), "../MAKER"),
    targetFile: "src/content/projects/maker.md",
    extractor: ALL_EXTRACTORS.maker,
  },
  {
    slug: "commuteshift",
    name: "CommuteShift",
    repoPath: path.resolve(process.cwd(), "../CommuteShift"),
    targetFile: "src/content/projects/commuteshift.md",
    extractor: ALL_EXTRACTORS.commuteshift,
  },
];

interface CliOptions {
  projectFilter?: string;
  dryRun: boolean;
  verbose: boolean;
  help: boolean;
}

function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run" || arg === "-d") {
      options.dryRun = true;
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--project" || arg === "-p") {
      options.projectFilter = args[++i];
    } else if (arg.startsWith("--project=")) {
      options.projectFilter = arg.split("=")[1];
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Portfolio Project Sync CLI
==========================
Synchronizes structured frontmatter in src/content/projects/ from sibling repositories.

Usage:
  npm run sync:projects [-- options]
  node --experimental-strip-types scripts/sync-projects.ts [options]

Options:
  --project, -p <slug>   Sync only a single project (e.g. platemark, maker, commuteshift)
  --dry-run, -d          Preview changes without writing to markdown files
  --verbose, -v          Show detailed extraction inspect payloads
  --help, -h             Show this help message
`);
}

async function run() {
  const startTime = Date.now();
  const options = parseCliArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  console.log("\n============================================================");
  console.log("   Portfolio Cross-Repository Project Sync");
  if (options.dryRun) {
    console.log("   MODE: DRY-RUN (no files will be modified)");
  }
  console.log("============================================================\n");

  let targets = PROJECT_MAPPINGS;
  if (options.projectFilter) {
    const filter = options.projectFilter.toLowerCase();
    targets = PROJECT_MAPPINGS.filter(
      (p) => p.slug === filter || p.name.toLowerCase() === filter
    );

    if (targets.length === 0) {
      console.error(`Error: Unknown project filter "${options.projectFilter}".`);
      console.error(`Available projects: ${PROJECT_MAPPINGS.map((p) => p.slug).join(", ")}`);
      process.exit(1);
    }
  }

  let totalScanned = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  for (let idx = 0; idx < targets.length; idx++) {
    const mapping = targets[idx];
    const stepLabel = `[${idx + 1}/${targets.length}]`;
    console.log(`${stepLabel} Scanning ${mapping.name} (${mapping.repoPath})...`);

    // Extract live repository metadata
    const extraction = await mapping.extractor.extract(mapping.repoPath);

    if (!extraction.found) {
      console.log(`      \x1b[33m[SKIP]\x1b[0m Repository not found or inaccessible.`);
      for (const warning of extraction.warnings) {
        console.log(`             ${warning}`);
      }
      totalSkipped++;
      console.log("");
      continue;
    }

    totalScanned++;

    const targetAbsPath = path.resolve(process.cwd(), mapping.targetFile);
    if (!fs.existsSync(targetAbsPath)) {
      console.log(`      \x1b[31m[ERROR]\x1b[0m Target file not found: ${mapping.targetFile}`);
      totalSkipped++;
      console.log("");
      continue;
    }

    // Display summary info
    if (extraction.summary.status) {
      console.log(`      Status: ${extraction.summary.status}`);
    }
    if (extraction.summary.techStackSummary) {
      console.log(`      Tech Stack: ${extraction.summary.techStackSummary}`);
    }

    // Apply frontmatter update safely
    try {
      const updateResult = updateProjectFrontmatter(
        targetAbsPath,
        extraction.updates,
        options.dryRun
      );

      if (updateResult.changed) {
        totalUpdated++;
        const dryTag = options.dryRun ? " (dry-run: would update)" : " (frontmatter updated)";
        console.log(`      \x1b[32mUpdated:\x1b[0m ${mapping.targetFile}${dryTag}`);
      } else {
        console.log(`      \x1b[90mUpdated:\x1b[0m ${mapping.targetFile} (already up to date)`);
      }

      if (options.verbose) {
        console.log("      Updates Applied:");
        console.log(
          JSON.stringify(extraction.updates, null, 2)
            .split("\n")
            .map((line) => `        ${line}`)
            .join("\n")
        );
      }
    } catch (err: any) {
      console.log(`      \x1b[31m[ERROR]\x1b[0m Failed to update ${mapping.targetFile}: ${err.message}`);
    }

    console.log("");
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Done in ${duration}s. Scanned: ${totalScanned}, Updated: ${totalUpdated}, Skipped: ${totalSkipped}.`);
  if (!options.dryRun && totalUpdated > 0) {
    console.log("Run `git diff` to review frontmatter updates before committing.\n");
  } else {
    console.log("");
  }
}

run().catch((err) => {
  console.error("Unexpected sync error:", err);
  process.exit(1);
});

