/**
 * PlateMark Deliverables Extractor (TASK-007)
 *
 * Scans tasks/3-done/ across PlateMark features and extracts clean,
 * recruiter-friendly milestone deliverable strings for the portfolio roadmap.
 */

import * as fs from "node:fs";
import * as path from "node:path";

function parseTaskTitle(taskFilePath: string): string | null {
  try {
    const content = fs.readFileSync(taskFilePath, "utf-8");
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;

    const lines = match[1].split(/\r?\n/);
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        if (key === "title") {
          let val = line.slice(colonIdx + 1).trim();
          val = val.replace(/^["']|["']$/g, "");
          return cleanDeliverableTitle(val);
        }
      }
    }
  } catch {
    // ignore read error
  }
  return null;
}

export function cleanDeliverableTitle(raw: string): string {
  let cleaned = raw
    // Strip ticket prefixes like TASK-001: or [TASK-001]
    .replace(/^(TASK-\d+[:\s\-\]]*)/i, "")
    // Strip trailing ticket tags
    .replace(/\s*\([A-Z]+-\d+\)$/i, "")
    .trim();

  if (!cleaned) return raw;

  // Capitalize first character
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned;
}

export interface PhaseDeliverableOptions {
  featureDirs: string[];
  maxDeliverables?: number;
  fallbackDeliverables?: string[];
}

export function extractDeliverablesForFeatures(
  pmFeaturesBaseDir: string,
  options: PhaseDeliverableOptions
): string[] {
  const deliverables: string[] = [];
  const max = options.maxDeliverables ?? 5;

  for (const featFolder of options.featureDirs) {
    const doneDir = path.join(pmFeaturesBaseDir, featFolder, "tasks", "3-done");
    if (!fs.existsSync(doneDir)) continue;

    const files = fs
      .readdirSync(doneDir)
      .filter((f) => f.endsWith(".md"))
      .sort();

    for (const file of files) {
      const fullPath = path.join(doneDir, file);
      const title = parseTaskTitle(fullPath);
      if (title && !deliverables.includes(title)) {
        deliverables.push(title);
        if (deliverables.length >= max) break;
      }
    }

    if (deliverables.length >= max) break;
  }

  // Fallback if no tasks done yet
  if (deliverables.length === 0 && options.fallbackDeliverables) {
    return options.fallbackDeliverables;
  }

  return deliverables;
}

// Self-test runner
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/adapters/platemark-deliverables.ts")) {
  const baseDir = path.resolve(process.cwd(), "../PlateMark/pm/features");
  console.log("Testing Deliverables Extraction from:", baseDir);

  const phase1 = extractDeliverablesForFeatures(baseDir, {
    featureDirs: [
      "FEAT-001-venue-data-model-and-taxonomy",
      "FEAT-002-interactive-map-canvas-and-venue-markers",
    ],
  });
  console.log("\nPhase 1 Deliverables:", phase1);
}

