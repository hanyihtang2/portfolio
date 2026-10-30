/**
 * In-Loop Evidence Pack and Pre-Review CLI Orchestrator
 *
 * Usage:
 *   node --experimental-strip-types scripts/review/prepare-evidence.ts [task-id] [base-branch]
 *   npm run agent:review-pack TASK-019 main
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync, spawnSync } from "node:child_process";
import type {
  AreasConfig,
  DeterministicCheckResult,
  EvidencePackData,
  MatchedAreaInfo,
  TaskSpec,
} from "./types.ts";

const ROOT_DIR = process.cwd();
const PM_DIR = path.join(ROOT_DIR, "pm");
const FEATURES_DIR = path.join(PM_DIR, "features");
const AREAS_FILE = path.join(PM_DIR, "areas.json");
const REVIEW_DIR = path.join(ROOT_DIR, ".review");

function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const rawYaml = match[1];
  const body = match[2];
  const data: Record<string, unknown> = {};

  let currentKey = "";
  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ") && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      const val = trimmed.slice(2).trim().replace(/^["']|["']$/g, "");
      (data[currentKey] as string[]).push(val);
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      const commentIdx = value.indexOf("#");
      if (commentIdx >= 0) value = value.slice(0, commentIdx).trim();
      value = value.replace(/^["']|["']$/g, "");

      currentKey = key;
      data[key] = value === "" ? [] : value;
    }
  }

  return { data, body };
}

function findTaskFile(taskIdOrKeyword: string): string | null {
  if (!fs.existsSync(FEATURES_DIR)) return null;

  const features = fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const stages = ["1-in-progress", "2-review", "0-backlog", "3-done"];

  for (const feat of features) {
    const tasksBase = path.join(FEATURES_DIR, feat, "tasks");
    for (const stage of stages) {
      const stageDir = path.join(tasksBase, stage);
      if (!fs.existsSync(stageDir)) continue;

      const files = fs.readdirSync(stageDir).filter((f) => f.endsWith(".md"));
      for (const file of files) {
        if (file.toLowerCase().includes(taskIdOrKeyword.toLowerCase())) {
          return path.join(stageDir, file);
        }
      }
    }
  }

  return null;
}

function findActiveTask(): string | null {
  if (!fs.existsSync(FEATURES_DIR)) return null;
  const features = fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const feat of features) {
    const inProgressDir = path.join(FEATURES_DIR, feat, "tasks", "1-in-progress");
    if (fs.existsSync(inProgressDir)) {
      const files = fs.readdirSync(inProgressDir).filter((f) => f.endsWith(".md"));
      if (files.length > 0) {
        return path.join(inProgressDir, files[0]);
      }
    }
  }
  return null;
}

function extractTaskSpec(filePath: string): TaskSpec {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data, body } = parseFrontmatter(content);

  const fileName = path.basename(filePath);
  const idMatch = fileName.match(/^(TASK-\d+)/i);
  const id = (data.id as string) || (idMatch ? idMatch[1].toUpperCase() : "TASK-UNKNOWN");
  const title = (data.title as string) || fileName.replace(/\.md$/, "");
  const parentFeature = (data.parent_feature as string) || "FEAT-UNKNOWN";
  const stage = path.basename(path.dirname(filePath));
  const declaredAreas = Array.isArray(data.areas) ? (data.areas as string[]) : [];
  const targetPaths = Array.isArray(data.target_paths) ? (data.target_paths as string[]) : [];

  // Extract Objective
  let objective = "";
  const objMatch = body.match(/##\s+(?:1\.\s+)?Objective[\r\n]+([\s\S]*?)(?=##|$)/i);
  if (objMatch) {
    objective = objMatch[1].trim();
  }

  // Extract Acceptance Criteria checkboxes
  const acceptanceCriteria: { text: string; completed: boolean }[] = [];
  const acRegex = /-\s*\[([ xX])\]\s*(.*)/g;
  let match: RegExpExecArray | null;
  while ((match = acRegex.exec(body)) !== null) {
    acceptanceCriteria.push({
      text: match[2].trim(),
      completed: match[1].toLowerCase() === "x",
    });
  }

  return {
    id,
    title,
    parentFeature,
    filePath: path.relative(ROOT_DIR, filePath).replace(/\\/g, "/"),
    stage,
    objective,
    acceptanceCriteria,
    targetPaths,
    declaredAreas,
  };
}

function runDeterministicCheck(): DeterministicCheckResult {
  console.log("\x1b[36m[1/4] Running deterministic pre-checks (npm run build)...\x1b[0m");
  const startTime = Date.now();

  const isWindows = process.platform === "win32";
  const npmCmd = isWindows ? "npm.cmd" : "npm";
  const command = `${npmCmd} run build`;

  try {
    const stdout = execSync(command, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      env: { ...process.env, CI: "true" },
    });

    const durationMs = Date.now() - startTime;
    console.log(`\x1b[32m[1/4] Deterministic pre-checks PASSED in ${durationMs}ms.\x1b[0m`);
    return {
      name: "build",
      command,
      status: "SUCCESS",
      output: stdout.trim(),
      exitCode: 0,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const error = err as { stdout?: string; stderr?: string; status?: number; message?: string };
    const output = (error.stdout || "") + (error.stderr || "") + (error.message || "");
    console.error("\x1b[31mDeterministic pre-check FAILED! Aborting review pack compilation.\x1b[0m");
    console.error(output);
    return {
      name: "build",
      command,
      status: "FAILED",
      output,
      exitCode: error.status ?? 1,
      durationMs,
    };
  }
}

function getGitContext(baseBranch: string): {
  currentBranch: string;
  changedFiles: string[];
  gitDiff: string;
} {
  let currentBranch = "main";
  try {
    currentBranch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
  } catch {
    // fallback
  }

  // Changed files:
  // 1. Committed diff against baseBranch
  // 2. Uncommitted staged and unstaged changes
  const changedFilesSet = new Set<string>();

  try {
    const committedDiff = execSync(`git diff --name-only ${baseBranch}...HEAD`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
    if (committedDiff) {
      committedDiff.split(/\r?\n/).forEach((f) => f.trim() && changedFilesSet.add(f.trim().replace(/\\/g, "/")));
    }
  } catch {
    // base branch might not have remote or merge-base
  }

  try {
    // Unstaged + staged working tree changes against HEAD
    const workingDiff = execSync("git diff --name-only HEAD", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
    if (workingDiff) {
      workingDiff.split(/\r?\n/).forEach((f) => f.trim() && changedFilesSet.add(f.trim().replace(/\\/g, "/")));
    }
  } catch {
    // fallback
  }

  try {
    // Untracked files
    const untracked = execSync("git ls-files --others --exclude-standard", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
    if (untracked) {
      untracked.split(/\r?\n/).forEach((f) => f.trim() && changedFilesSet.add(f.trim().replace(/\\/g, "/")));
    }
  } catch {
    // fallback
  }

  // Full unified diff
  let gitDiff = "";
  try {
    const branchDiff = execSync(`git diff ${baseBranch}...HEAD`, {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
    if (branchDiff) gitDiff += branchDiff + "\n";
  } catch {
    // fallback
  }

  try {
    const workingTreeDiff = execSync("git diff HEAD", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
    if (workingTreeDiff) gitDiff += "\n# --- Working Tree / Uncommitted Changes ---\n" + workingTreeDiff + "\n";
  } catch {
    // fallback
  }

  // If there are untracked files, list them in diff summary
  try {
    const untrackedFiles = execSync("git ls-files --others --exclude-standard", {
      cwd: ROOT_DIR,
      encoding: "utf-8",
    }).trim();
    if (untrackedFiles) {
      const files = untrackedFiles.split(/\r?\n/).filter(Boolean);
      for (const uFile of files) {
        const fullP = path.join(ROOT_DIR, uFile);
        if (fs.existsSync(fullP) && fs.statSync(fullP).isFile()) {
          const uContent = fs.readFileSync(fullP, "utf-8");
          gitDiff += `\n# --- Untracked File: ${uFile} ---\n` + uContent.slice(0, 3000) + "\n";
        }
      }
    }
  } catch {
    // fallback
  }

  return {
    currentBranch,
    changedFiles: Array.from(changedFilesSet),
    gitDiff: gitDiff.trim(),
  };
}

function matchAreas(changedFiles: string[]): {
  matchedAreas: MatchedAreaInfo[];
  outOfScopeFiles: string[];
} {
  let areasConfig: AreasConfig = { areas: {} };
  if (fs.existsSync(AREAS_FILE)) {
    try {
      areasConfig = JSON.parse(fs.readFileSync(AREAS_FILE, "utf-8"));
    } catch {
      // ignore
    }
  }

  const matchedMap = new Map<string, MatchedAreaInfo>();
  const outOfScope: string[] = [];

  for (const file of changedFiles) {
    let matched = false;
    for (const [key, areaDef] of Object.entries(areasConfig.areas)) {
      const matches = areaDef.paths.some((areaPath) => {
        const normalizedArea = areaPath.replace(/\\/g, "/");
        if (normalizedArea.endsWith("/")) {
          return file.startsWith(normalizedArea);
        }
        return file === normalizedArea || file.startsWith(normalizedArea);
      });

      if (matches) {
        matched = true;
        if (!matchedMap.has(key)) {
          matchedMap.set(key, {
            key,
            title: areaDef.title,
            description: areaDef.description,
            techStack: areaDef.techStack,
            matchedFiles: [],
          });
        }
        matchedMap.get(key)!.matchedFiles.push(file);
      }
    }

    if (!matched) {
      outOfScope.push(file);
    }
  }

  return {
    matchedAreas: Array.from(matchedMap.values()),
    outOfScopeFiles: outOfScope,
  };
}

function formatEvidenceMarkdown(data: EvidencePackData): string {
  const lines: string[] = [];

  lines.push(`# Evidence Pack: ${data.taskId} (${data.taskSpec.title})`);
  lines.push("");
  lines.push(`> **Generated At:** ${data.timestamp}  `);
  lines.push(`> **Current Branch:** \`${data.currentBranch}\`  `);
  lines.push(`> **Base Branch:** \`${data.targetBranch}\`  `);
  lines.push(`> **Parent Feature:** [${data.taskSpec.parentFeature}](../pm/features/)  `);
  lines.push(`> **Task Spec:** [${data.taskSpec.id}](file:///${path.resolve(ROOT_DIR, data.taskSpec.filePath)})  `);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Section 1: Objective & Acceptance Criteria
  lines.push("## 1. Task Objective & Acceptance Criteria Checklist");
  lines.push("");
  lines.push(`**Objective:** ${data.taskSpec.objective || data.taskSpec.title}`);
  lines.push("");
  lines.push("### Acceptance Criteria");
  if (data.taskSpec.acceptanceCriteria.length === 0) {
    lines.push("_No explicit checklist items declared in task spec._");
  } else {
    for (const ac of data.taskSpec.acceptanceCriteria) {
      const mark = ac.completed ? "[x]" : "[ ]";
      lines.push(`- ${mark} ${ac.text}`);
    }
  }
  lines.push("");

  // Section 2: Target Paths & Scope Audit
  lines.push("## 2. Scope & Architectural Boundaries");
  lines.push("");
  lines.push("### Declared Target Paths");
  if (data.taskSpec.targetPaths.length === 0) {
    lines.push("_None declared in task frontmatter._");
  } else {
    for (const p of data.taskSpec.targetPaths) {
      lines.push(`- \`${p}\``);
    }
  }
  lines.push("");

  lines.push("### Changed Files in Diff");
  if (data.changedFiles.length === 0) {
    lines.push("_No files detected in diff._");
  } else {
    for (const f of data.changedFiles) {
      lines.push(`- \`${f}\``);
    }
  }
  lines.push("");

  lines.push("### Matched pm/areas.json Domains");
  if (data.matchedAreas.length === 0) {
    lines.push("_No registered areas matched._");
  } else {
    for (const a of data.matchedAreas) {
      lines.push(`- **\`${a.key}\`** (${a.title}): ${a.description}`);
      lines.push(`  - *Tech Stack:* ${a.techStack.join(", ")}`);
      lines.push(`  - *Files (${a.matchedFiles.length}):* ${a.matchedFiles.map((f) => `\`${f}\``).join(", ")}`);
    }
  }
  lines.push("");

  if (data.outOfScopeFiles.length > 0) {
    lines.push("> [!WARNING]");
    lines.push(`> **Files outside declared pm/areas.json:**`);
    for (const uf of data.outOfScopeFiles) {
      lines.push(`> - \`${uf}\``);
    }
    lines.push("");
  }

  // Section 3: Deterministic Verification
  lines.push("## 3. Deterministic Pre-Verification Checks");
  lines.push("");
  for (const check of data.deterministicChecks) {
    const badge = check.status === "SUCCESS" ? "✅ PASS" : "❌ FAIL";
    lines.push(`### ${badge} \`${check.command}\` (${check.durationMs}ms)`);
    lines.push("");
    lines.push("```text");
    const preview = check.output.length > 3000 ? check.output.slice(0, 3000) + "\n...[truncated]..." : check.output;
    lines.push(preview);
    lines.push("```");
    lines.push("");
  }

  // Section 4: Clean Git Diff
  lines.push("## 4. Git Diff Inspection");
  lines.push("");
  if (!data.gitDiff) {
    lines.push("_Diff is empty or uncommitted changes cannot be resolved._");
  } else {
    lines.push("```diff");
    lines.push(data.gitDiff);
    lines.push("```");
  }
  lines.push("");

  // Section 5: Reviewer Instructions & Contract Reference
  lines.push("## 5. Reviewer Subagent Contract Reference");
  lines.push("");
  lines.push("This evidence pack is governed by [`pm/standards/AGENT_REVIEW_CONTRACT.md`](../pm/standards/AGENT_REVIEW_CONTRACT.md).");
  lines.push("");
  lines.push("### Evaluation Rules for Reviewer Subagent:");
  lines.push("1. Verify every acceptance criterion against the code changes in the diff.");
  lines.push("2. Verify zero unhandled runtime crashes, null pointers, or path traversal vectors.");
  lines.push("3. Categorize all findings strictly according to the taxonomy:");
  lines.push("   - **P0 (Blocker):** Broken acceptance criteria, build/test failure, crash, security risk.");
  lines.push("   - **P1 (High):** Scope violation outside `pm/areas.json` or `target_paths`, missing error boundaries.");
  lines.push("   - **P2 (Nit):** Optional readability suggestion (never blocks merge).");
  lines.push("4. Every P0/P1 finding MUST cite file path, line numbers, concrete execution proof, and suggested code fix.");
  lines.push("5. Format response adhering to `pm/standards/schemas/review-verdict.schema.json`.");

  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  let targetTaskId = args[0];
  const baseBranch = args[1] || "main";

  console.log("\x1b[35m=== In-Loop Evidence Pack Compiler (FEAT-005) ===\x1b[0m");

  // If no task specified, attempt to locate the active in-progress task
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
      console.log("Usage: npm run agent:review-pack <TASK-ID> [base-branch]");
      process.exit(1);
    }
  }

  const taskSpec = extractTaskSpec(taskFilePath);
  console.log(`Target Task: \x1b[32m${taskSpec.id}\x1b[0m - ${taskSpec.title}`);
  console.log(`Task File:   ${taskSpec.filePath}`);

  // Step 1: Run Deterministic Checks
  const deterministicCheck = runDeterministicCheck();
  if (deterministicCheck.status !== "SUCCESS") {
    console.error("\x1b[31mHALT: Deterministic checks must pass before evidence pack can be compiled.\x1b[0m");
    process.exit(1);
  }

  // Step 2: Extract Git Diff
  console.log(`\x1b[36m[2/4] Extracting git diff against ${baseBranch}...\x1b[0m`);
  const gitContext = getGitContext(baseBranch);
  console.log(`  Changed files (${gitContext.changedFiles.length}): ${gitContext.changedFiles.slice(0, 5).join(", ")}${gitContext.changedFiles.length > 5 ? "..." : ""}`);

  // Step 3: Match Areas
  console.log("\x1b[36m[3/4] Matching changed files against pm/areas.json...\x1b[0m");
  const areaMatches = matchAreas(gitContext.changedFiles);
  console.log(`  Matched Areas: ${areaMatches.matchedAreas.map((a) => a.key).join(", ") || "None"}`);
  if (areaMatches.outOfScopeFiles.length > 0) {
    console.warn(`  \x1b[33mWarning: ${areaMatches.outOfScopeFiles.length} file(s) outside declared pm/areas.json\x1b[0m`);
  }

  // Step 4: Compile Evidence Pack
  console.log("\x1b[36m[4/4] Compiling evidence pack markdown...\x1b[0m");
  if (!fs.existsSync(REVIEW_DIR)) {
    fs.mkdirSync(REVIEW_DIR, { recursive: true });
  }

  const evidenceData: EvidencePackData = {
    taskId: taskSpec.id,
    targetBranch: baseBranch,
    currentBranch: gitContext.currentBranch,
    timestamp: new Date().toISOString(),
    taskSpec,
    matchedAreas: areaMatches.matchedAreas,
    outOfScopeFiles: areaMatches.outOfScopeFiles,
    deterministicChecks: [deterministicCheck],
    changedFiles: gitContext.changedFiles,
    gitDiff: gitContext.gitDiff,
  };

  const markdownPack = formatEvidenceMarkdown(evidenceData);
  const outFileName = `evidence-pack-${taskSpec.id.toLowerCase()}.md`;
  const outPath = path.join(REVIEW_DIR, outFileName);

  fs.writeFileSync(outPath, markdownPack, "utf-8");

  console.log("");
  console.log(`\x1b[32m✔ Successfully compiled Evidence Pack:\x1b[0m`);
  console.log(`  Output: .review/${outFileName}`);
  console.log("");
  console.log("Ready for Tier 1 Reviewer Subagent invocation.");
  console.log(`To invoke reviewer: pass .review/${outFileName} into fresh-context reviewer subagent.`);
}

main();
