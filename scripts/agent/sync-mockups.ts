/**
 * UI Mockup and Diagram Asset Synchronization Helper
 *
 * Usage:
 *   node --experimental-strip-types scripts/agent/sync-mockups.ts --all --dry-run
 *   node --experimental-strip-types scripts/agent/sync-mockups.ts --project platemark
 *   node --experimental-strip-types scripts/agent/sync-mockups.ts --project maker --force
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { updateProjectFrontmatter } from "../lib/frontmatter.ts";

const PORTFOLIO_IMAGES_DIR = path.resolve(process.cwd(), "public/images/projects");
const PROJECTS_DOCS_DIR = path.resolve(process.cwd(), "src/content/projects");

interface ProjectAssetSource {
  slug: string;
  name: string;
  searchDirs: string[];
}

const ASSET_SOURCES: Record<string, ProjectAssetSource> = {
  platemark: {
    slug: "platemark",
    name: "PlateMark",
    searchDirs: [
      path.resolve(process.cwd(), "../PlateMark/public"),
      path.resolve(process.cwd(), "../PlateMark/docs/images"),
      path.resolve(process.cwd(), "../PlateMark/assets"),
    ],
  },
  maker: {
    slug: "maker",
    name: "MAKER",
    searchDirs: [
      path.resolve(process.cwd(), "../MAKER/apps/web/public"),
      path.resolve(process.cwd(), "../MAKER/apps/mobile/assets"),
      path.resolve(process.cwd(), "../MAKER/docs/images"),
    ],
  },
  commuteshift: {
    slug: "commuteshift",
    name: "CommuteShift",
    searchDirs: [
      path.resolve(process.cwd(), "../CommuteShift/public"),
      path.resolve(process.cwd(), "../CommuteShift/docs/images"),
    ],
  },
};

interface DiscoveredAsset {
  projectSlug: string;
  sourcePath: string;
  filename: string;
  category: "desktop" | "mobile" | "diagram" | "other";
  recommendedTargetName: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let project: string | undefined;
  let all = false;
  let dryRun = false;
  let force = false;
  let updateFrontmatter = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--project" && args[i + 1]) {
      project = args[i + 1].toLowerCase();
      i++;
    } else if (arg === "--all") {
      all = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--no-frontmatter") {
      updateFrontmatter = false;
    }
  }

  return { project, all, dryRun, force, updateFrontmatter };
}

function classifyAsset(slug: string, filename: string): { category: DiscoveredAsset["category"]; targetName: string } {
  const lower = filename.toLowerCase();
  const ext = path.extname(filename);

  if (lower.includes("mobile") || lower.includes("phone")) {
    return {
      category: "mobile",
      targetName: `${slug}-mobile-mockup${ext}`,
    };
  }

  if (lower.includes("diagram") || lower.includes("architecture")) {
    return {
      category: "diagram",
      targetName: `${slug}-architecture${ext}`,
    };
  }

  if (lower.includes("mockup") || lower.includes("desktop") || lower.includes("screenshot") || lower.includes("preview")) {
    return {
      category: "desktop",
      targetName: `${slug}-mockup${ext}`,
    };
  }

  return {
    category: "other",
    targetName: `${slug}-${filename}`,
  };
}

function discoverAssets(source: ProjectAssetSource): DiscoveredAsset[] {
  const discovered: DiscoveredAsset[] = [];
  const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

  for (const dir of source.searchDirs) {
    if (!fs.existsSync(dir)) continue;

    const findImages = (currentDir: string, depth = 0) => {
      if (depth > 3) return;
      try {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            findImages(fullPath, depth + 1);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (imageExtensions.has(ext)) {
              const lower = entry.name.toLowerCase();
              // Filter out small favicon / generic icons unless it's a mockup
              if (lower.includes("favicon") || lower === "icon.png") continue;

              const { category, targetName } = classifyAsset(source.slug, entry.name);
              discovered.push({
                projectSlug: source.slug,
                sourcePath: fullPath,
                filename: entry.name,
                category,
                recommendedTargetName: targetName,
              });
            }
          }
        }
      } catch {
        // Skip inaccessible dirs
      }
    };

    findImages(dir);
  }

  return discovered;
}

function syncProjectAssets(source: ProjectAssetSource, dryRun: boolean, force: boolean, updateFrontmatter: boolean) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`   Scanning: ${source.name} (${source.slug})`);
  console.log(`------------------------------------------------------------`);

  const assets = discoverAssets(source);

  if (assets.length === 0) {
    console.log(`No screenshot mockups or diagrams discovered in search paths.`);
    return;
  }

  if (!fs.existsSync(PORTFOLIO_IMAGES_DIR)) {
    fs.mkdirSync(PORTFOLIO_IMAGES_DIR, { recursive: true });
  }

  const frontmatterUpdates: Record<string, string> = {};

  for (const asset of assets) {
    const targetFilePath = path.join(PORTFOLIO_IMAGES_DIR, asset.recommendedTargetName);
    const relativeWebPath = `/images/projects/${asset.recommendedTargetName}`;
    const fileExists = fs.existsSync(targetFilePath);

    console.log(`\n• Found: ${asset.filename} (${asset.category})`);
    console.log(`  Source: ${asset.sourcePath}`);
    console.log(`  Target: ${targetFilePath}`);

    if (fileExists && !force) {
      console.log(`  \x1b[33m[SKIPPED]\x1b[0m Target file already exists. Use --force to overwrite.`);
    } else {
      if (dryRun) {
        console.log(`  \x1b[36m[DRY-RUN]\x1b[0m Would copy to: ${asset.recommendedTargetName}`);
      } else {
        fs.copyFileSync(asset.sourcePath, targetFilePath);
        console.log(`  \x1b[32m[COPIED]\x1b[0m Asset synchronized successfully.`);
      }

      if (asset.category === "desktop") {
        frontmatterUpdates.mockupImage = relativeWebPath;
      } else if (asset.category === "mobile") {
        frontmatterUpdates.mobileMockupImage = relativeWebPath;
      }
    }
  }

  if (Object.keys(frontmatterUpdates).length > 0 && updateFrontmatter) {
    const docPath = path.join(PROJECTS_DOCS_DIR, `${source.slug}.md`);
    if (fs.existsSync(docPath)) {
      if (dryRun) {
        console.log(`\n  \x1b[36m[DRY-RUN]\x1b[0m Would update frontmatter in ${source.slug}.md:`, frontmatterUpdates);
      } else {
        updateProjectFrontmatter(docPath, frontmatterUpdates, false);
        console.log(`\n  \x1b[32m[UPDATED]\x1b[0m Updated image links in ${source.slug}.md:`, frontmatterUpdates);
      }
    }
  }
}

function main() {
  const { project, all, dryRun, force, updateFrontmatter } = parseArgs();

  console.log(`\n============================================================`);
  console.log(`   Portfolio UI Mockup and Asset Sync Helper`);
  if (dryRun) console.log(`   Mode: DRY RUN (no files will be written)`);
  console.log(`============================================================`);

  if (all) {
    for (const key of Object.keys(ASSET_SOURCES)) {
      syncProjectAssets(ASSET_SOURCES[key], dryRun, force, updateFrontmatter);
    }
    console.log(`\nAsset synchronization check complete.\n`);
    return;
  }

  const targetSlug = project || "commuteshift";
  const source = ASSET_SOURCES[targetSlug];

  if (!source) {
    console.error(`Error: Unknown project "${targetSlug}".`);
    console.error(`Available projects: ${Object.keys(ASSET_SOURCES).join(", ")}`);
    process.exit(1);
  }

  syncProjectAssets(source, dryRun, force, updateFrontmatter);
  console.log(`\nAsset synchronization check complete.\n`);
}

main();
