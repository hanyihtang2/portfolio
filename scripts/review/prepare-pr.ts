/**
 * End-to-End Pull Request Preparation CLI
 *
 * Orchestrates the transition from Tier 1 local approval to Tier 2 PR creation:
 * 1. Verifies deterministic check pass (npm run build).
 * 2. Validates Tier 1 Review Verdict (.review/verdict-<task-id>.json) with 0 blockers.
 * 3. Automatically moves task from 1-in-progress to 2-review.
 * 4. Regenerates pm/KANBAN.md and pm/ROADMAP.md.
 * 5. Generates the PR description matching Tier 2 CI validation (.review/pr-body-<task-id>.md).
 *
 * Usage:
 *   node --experimental-strip-types scripts/review/prepare-pr.ts [task-id] [base-branch] [--force]
 *   npm run agent:prepare-pr TASK-024
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import {
  extractTaskSpec,
  findActiveTask,
  findTaskFile,
  ROOT_DIR,
  runDeterministicCheck,
} from "./prepare-evidence.ts";
import { generatePrBody } from "./generate-pr-body.ts";
import { loadReviewVerdict, validateReviewVerdict } from "./verdict.ts";

function main() {
  const args = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith("--"));
  const positional = args.filter((a) => !a.startsWith("--"));

  const targetTaskId = positional[0];
  const baseBranch = positional[1] || "main";
  const force = flags.includes("--force");

  console.log("\x1b[35m=== End-to-End Agentic PR Orchestrator ===\x1b[0m\n");

  // Step 1: Locate Task
  let taskFilePath: string | null = null;
  if (targetTaskId) {
    taskFilePath = findTaskFile(targetTaskId);
    if (!taskFilePath) {
      console.error(`\x1b[31mError: Could not locate task file matching "${targetTaskId}".\x1b[0m`);
      process.exit(1);
    }
  } else {
    taskFilePath = findActiveTask();
    if (!taskFilePath) {
      console.error("\x1b[31mError: No task ID specified and no active task found in 1-in-progress.\x1b[0m");
      console.log("Usage: npm run agent:prepare-pr <TASK-ID> [base-branch] [--force]");
      process.exit(1);
    }
  }

  const taskSpec = extractTaskSpec(taskFilePath);
  console.log(`Target Task:   \x1b[32m${taskSpec.id}\x1b[0m - ${taskSpec.title}`);
  console.log(`Current Stage: \x1b[36m${taskSpec.stage}\x1b[0m`);
  console.log(`Task File:     ${taskSpec.filePath}\n`);

  // Step 2: Run Deterministic Checks
  console.log("\x1b[36m[1/4] Running deterministic checks...\x1b[0m");
  const checkResult = runDeterministicCheck();
  if (checkResult.status !== "SUCCESS" && !force) {
    console.error("\x1b[31mHALT: Deterministic checks must pass cleanly before PR can be prepared.\x1b[0m");
    console.error("Fix compiler / lint errors or pass --force to bypass.");
    process.exit(1);
  }

  // Step 3: Validate Tier 1 Review Verdict
  console.log("\x1b[36m[2/4] Validating Tier 1 Review Verdict...\x1b[0m");
  const verdict = loadReviewVerdict(taskSpec.id);
  if (!verdict) {
    if (!force) {
      console.error(`\x1b[31mHALT: No Tier 1 review verdict found at .review/verdict-${taskSpec.id.toLowerCase()}.json\x1b[0m`);
      console.log("Run the Tier 1 fresh-context reviewer subagent on the Evidence Pack first.");
      console.log("Or run with --force if bypassing Tier 1 subagent review.");
      process.exit(1);
    } else {
      console.warn("\x1b[33mWarning: Bypassing missing Tier 1 verdict due to --force.\x1b[0m");
    }
  } else {
    const validation = validateReviewVerdict(verdict);
    if (!validation.valid && !force) {
      console.error(`\x1b[31mHALT: Tier 1 verdict has validation errors:\x1b[0m`);
      validation.errors.forEach((e) => console.error(`  - ${e}`));
      process.exit(1);
    }

    if (verdict.verdict !== "PASS" && !force) {
      console.error(`\x1b[31mHALT: Tier 1 verdict is '${verdict.verdict}' with ${verdict.blocking_count} blocker(s).\x1b[0m`);
      console.error("All P0/P1 defects must be resolved before preparing a Pull Request.");
      process.exit(1);
    }

    console.log(`  Verdict: \x1b[32m✔ ${verdict.verdict}\x1b[0m (0 blockers, iteration ${verdict.iteration} of 2)`);
  }

  // Step 4: Advance Task Stage to 2-review (if not already there)
  console.log("\x1b[36m[3/4] Advancing task stage and synchronizing boards...\x1b[0m");
  if (taskSpec.stage !== "2-review" && taskSpec.stage !== "3-done") {
    try {
      execSync(`node --experimental-strip-types scripts/pm.ts move ${taskSpec.id} review`, {
        cwd: ROOT_DIR,
        encoding: "utf-8",
        stdio: "inherit",
      });
    } catch (err) {
      console.error("\x1b[31mFailed to move task stage:\x1b[0m", err);
      process.exit(1);
    }
  } else {
    console.log(`  Task is already in stage '${taskSpec.stage}'.`);
  }

  // Step 5: Generate PR Description Body
  console.log("\x1b[36m[4/4] Generating PR description...\x1b[0m");
  const { prBodyPath } = generatePrBody(taskSpec.id, baseBranch);

  console.log("\n\x1b[32m=======================================================\x1b[0m");
  console.log(`\x1b[32m✔ PR Ready for ${taskSpec.id}!\x1b[0m`);
  console.log(`  PR Description: .review/pr-body-${taskSpec.id.toLowerCase()}.md`);
  console.log("\x1b[32m=======================================================\x1b[0m\n");

  console.log("Next steps to open PR:");
  console.log(`1. Stage and commit PM board updates:`);
  console.log(`   git add pm/ .review/`);
  console.log(`   git commit -m "feat(${taskSpec.id.toLowerCase()}): advance task to review and generate pr body"`);
  console.log("");
  console.log(`2. Push branch & open Pull Request using GitHub CLI:`);
  console.log(
    `   gh pr create --title "feat(${taskSpec.id.toLowerCase()}): ${taskSpec.title}" --body-file ${path.relative(ROOT_DIR, prBodyPath)}`
  );
  console.log("");
  console.log("3. The Tier 2 GitHub Actions Quality Gate will run automatically on PR open.");
}

main();

