/**
 * Tier 1 Review Verdict Persistence & Schema Validator
 *
 * Usage:
 *   node --experimental-strip-types scripts/review/verdict.ts [task-id]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ReviewFinding, ReviewVerdict, VerdictStatus } from "./types.ts";

const ROOT_DIR = process.cwd();
const REVIEW_DIR = path.join(ROOT_DIR, ".review");

export function getVerdictPath(taskId: string): string {
  const cleanId = taskId.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return path.join(REVIEW_DIR, `verdict-${cleanId}.json`);
}

export function validateReviewVerdict(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Verdict must be a valid JSON object."] };
  }

  const v = data as Partial<ReviewVerdict>;

  if (!v.task_id || typeof v.task_id !== "string" || !/^[A-Z]+-\d+$/i.test(v.task_id)) {
    errors.push(`Invalid or missing 'task_id'. Expected format 'TASK-###', received: '${v.task_id}'`);
  }

  const validVerdicts: VerdictStatus[] = ["PASS", "CHANGES_REQUESTED", "ESCALATED_TO_HUMAN"];
  if (!v.verdict || !validVerdicts.includes(v.verdict)) {
    errors.push(`Invalid 'verdict'. Must be one of [${validVerdicts.join(", ")}], received: '${v.verdict}'`);
  }

  if (typeof v.iteration !== "number" || v.iteration < 1 || v.iteration > 2) {
    errors.push(`Invalid 'iteration'. Must be 1 or 2 (maximum 2-cycle contract), received: ${v.iteration}`);
  }

  if (!v.evaluated_at || typeof v.evaluated_at !== "string" || Number.isNaN(Date.parse(v.evaluated_at))) {
    errors.push(`Invalid 'evaluated_at'. Must be a valid ISO-8601 date string, received: '${v.evaluated_at}'`);
  }

  if (!v.summary || typeof v.summary !== "string" || v.summary.trim().length < 10) {
    errors.push(`'summary' must be a descriptive string at least 10 characters long.`);
  }

  if (!Array.isArray(v.findings)) {
    errors.push(`'findings' must be an array.`);
  } else {
    let computedBlockers = 0;
    v.findings.forEach((f: Partial<ReviewFinding>, idx: number) => {
      const prefix = `Finding [${idx}] (${f.id || "unidentified"}):`;
      if (!f.id) errors.push(`${prefix} missing 'id'`);
      if (!f.severity || !["P0", "P1", "P2"].includes(f.severity)) {
        errors.push(`${prefix} invalid severity '${f.severity}'. Expected P0, P1, or P2.`);
      }
      if (!f.file) errors.push(`${prefix} missing 'file' reference`);
      if (!f.description) errors.push(`${prefix} missing 'description'`);
      if (!f.evidence) errors.push(`${prefix} missing 'evidence' (proof-of-defect violation)`);
      if (!f.suggested_fix) errors.push(`${prefix} missing 'suggested_fix'`);

      if (f.severity === "P0" || f.severity === "P1") {
        computedBlockers++;
      }
    });

    if (typeof v.blocking_count !== "number" || v.blocking_count !== computedBlockers) {
      errors.push(
        `'blocking_count' (${v.blocking_count}) does not match counted P0+P1 findings (${computedBlockers}).`
      );
    }

    if (v.verdict === "PASS" && computedBlockers > 0) {
      errors.push(`Contradiction: Verdict is 'PASS' but contains ${computedBlockers} blocking P0/P1 defect(s).`);
    }

    if (v.verdict === "CHANGES_REQUESTED" && computedBlockers === 0) {
      errors.push(`Contradiction: Verdict is 'CHANGES_REQUESTED' but 0 blocking defects were logged.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function loadReviewVerdict(taskId: string): ReviewVerdict | null {
  const filePath = getVerdictPath(taskId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const validation = validateReviewVerdict(parsed);
    if (!validation.valid) {
      console.warn(`\x1b[33mWarning: Review verdict at ${filePath} has validation errors:\x1b[0m`);
      validation.errors.forEach((err) => console.warn(`  - ${err}`));
    }
    return parsed as ReviewVerdict;
  } catch (err) {
    console.error(`\x1b[31mError reading review verdict at ${filePath}:\x1b[0m`, err);
    return null;
  }
}

export function saveReviewVerdict(verdict: ReviewVerdict): string {
  const validation = validateReviewVerdict(verdict);
  if (!validation.valid) {
    throw new Error(`Cannot save invalid ReviewVerdict:\n  ${validation.errors.join("\n  ")}`);
  }

  if (!fs.existsSync(REVIEW_DIR)) {
    fs.mkdirSync(REVIEW_DIR, { recursive: true });
  }

  const outPath = getVerdictPath(verdict.task_id);
  fs.writeFileSync(outPath, JSON.stringify(verdict, null, 2), "utf-8");
  return outPath;
}

// CLI Execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith("verdict.ts") || process.argv[1].endsWith("verdict.js"))
) {
  const targetId = process.argv[2];
  if (!targetId) {
    console.log("Usage: node --experimental-strip-types scripts/review/verdict.ts <TASK-ID>");
    process.exit(1);
  }

  console.log(`\x1b[35m=== Review Verdict Inspector: ${targetId} ===\x1b[0m`);
  const verdictPath = getVerdictPath(targetId);

  if (!fs.existsSync(verdictPath)) {
    console.error(`\x1b[31mNo verdict file found at:\x1b[0m ${verdictPath}`);
    console.log("Tier 1 reviewer subagent must evaluate the Evidence Pack and generate this verdict.");
    process.exit(1);
  }

  const verdict = loadReviewVerdict(targetId);
  if (!verdict) {
    process.exit(1);
  }

  const badge = verdict.verdict === "PASS" ? "\x1b[32m✔ PASS\x1b[0m" : "\x1b[31m✖ " + verdict.verdict + "\x1b[0m";
  console.log(`Verdict:        ${badge}`);
  console.log(`Iteration:      ${verdict.iteration} of 2`);
  console.log(`Reviewer:       ${verdict.reviewer || "agent:reviewer-subagent"}`);
  console.log(`Blocking Count: ${verdict.blocking_count}`);
  console.log(`Summary:        ${verdict.summary}`);

  if (verdict.findings.length > 0) {
    console.log("\nFindings:");
    for (const f of verdict.findings) {
      const color = f.severity === "P0" ? "\x1b[31m" : f.severity === "P1" ? "\x1b[33m" : "\x1b[36m";
      console.log(`  ${color}[${f.severity}]\x1b[0m ${f.id} (${f.file}): ${f.description}`);
    }
  }
}

