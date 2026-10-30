/**
 * Product Management CLI for Portfolio (PM-as-Code)
 *
 * Usage:
 *   node --experimental-strip-types scripts/pm.ts kanban
 *   node --experimental-strip-types scripts/pm.ts new-feature "FEAT-001 Local Sync CLI"
 *   node --experimental-strip-types scripts/pm.ts new-task FEAT-001 "Build Frontmatter Updater"
 *   node --experimental-strip-types scripts/pm.ts move TASK-001 in-progress
 *   node --experimental-strip-types scripts/pm.ts generate-roadmap
 *   node --experimental-strip-types scripts/pm.ts all
 */

import * as fs from "node:fs";
import * as path from "node:path";

const PM_DIR = path.resolve(process.cwd(), "pm");
const FEATURES_DIR = path.join(PM_DIR, "features");
const TEMPLATES_DIR = path.join(PM_DIR, "templates");

const STAGE_FOLDERS: Record<string, string> = {
  "0": "0-backlog",
  backlog: "0-backlog",
  "1": "1-in-progress",
  "in-progress": "1-in-progress",
  inprogress: "1-in-progress",
  active: "1-in-progress",
  "2": "2-review",
  review: "2-review",
  "3": "3-done",
  done: "3-done",
  completed: "3-done",
};

const STAGE_STATUS_LABEL: Record<string, string> = {
  "0-backlog": "backlog",
  "1-in-progress": "in-progress",
  "2-review": "review",
  "3-done": "done",
};

interface Frontmatter {
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
  parent_feature?: string;
  target_release?: string;
  areas?: string[];
  branch?: string;
  assigned_to?: string;
  [key: string]: unknown;
}

function parseFrontmatter(content: string): { data: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const rawYaml = match[1];
  const body = match[2];
  const data: Record<string, unknown> = {};

  let currentKey = "";
  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // List item
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

      // Quote-aware comment stripping (F-002)
      let inDouble = false;
      let inSingle = false;
      let commentIdx = -1;
      for (let i = 0; i < value.length; i++) {
        const ch = value[i];
        if (ch === '"' && !inSingle) inDouble = !inDouble;
        else if (ch === "'" && !inDouble) inSingle = !inSingle;
        else if (ch === "#" && !inDouble && !inSingle) {
          if (i === 0 || /\s/.test(value[i - 1])) {
            commentIdx = i;
            break;
          }
        }
      }
      if (commentIdx >= 0) {
        value = value.slice(0, commentIdx).trim();
      }

      currentKey = key;

      // Handle inline flow array [a, b, c]
      if (value.startsWith("[") && value.endsWith("]")) {
        data[key] = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else {
        value = value.replace(/^["']|["']$/g, "");
        if (value === "") {
          data[key] = [];
        } else {
          data[key] = value;
        }
      }
    }
  }

  return { data, body };
}

function formatFrontmatter(data: Frontmatter, body: string): string {
  const lines: string[] = ["---"];
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) {
        lines.push(`  - ${item}`);
      }
    } else {
      lines.push(`${k}: ${v}`);
    }
  }
  lines.push("---");
  lines.push(body);
  return lines.join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function listFeatures() {
  if (!fs.existsSync(FEATURES_DIR)) return [];
  return fs
    .readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

// -------------------------------------------------------------
// Commands & Kanban Generator
// -------------------------------------------------------------

interface TaskItem {
  id: string;
  title: string;
  stage: "0-backlog" | "1-in-progress" | "2-review" | "3-done";
  status: string;
  priority: string;
  parent_feature: string;
  featureDir: string;
  featureTitle: string;
  targetRelease: string;
  assigned_to: string;
  branch: string;
  areas: string[];
  updated_at: string;
  created_at: string;
  taskRelPath: string;
  prdRelPath: string;
}

const PRIORITY_ORDER: Record<string, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};

function sortTasks(taskList: TaskItem[]): TaskItem[] {
  return [...taskList].sort((a, b) => {
    const pA = PRIORITY_ORDER[a.priority.toUpperCase()] ?? 99;
    const pB = PRIORITY_ORDER[b.priority.toUpperCase()] ?? 99;
    if (pA !== pB) return pA - pB;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
}

function collectAllTasks(): { tasks: TaskItem[]; featureMap: Map<string, { title: string; release: string }> } {
  const features = listFeatures();
  const tasks: TaskItem[] = [];
  const featureMap = new Map<string, { title: string; release: string }>();

  for (const featDir of features) {
    const featPath = path.join(FEATURES_DIR, featDir);
    const prdPath = path.join(featPath, "prd.md");
    let prdData: Frontmatter = {};

    if (fs.existsSync(prdPath)) {
      const content = fs.readFileSync(prdPath, "utf-8");
      prdData = parseFrontmatter(content).data;
    }

    const featIdMatch = featDir.match(/^([A-Z]+-\d+)/i);
    const featId = featIdMatch ? featIdMatch[1].toUpperCase() : featDir;
    const featTitle = (prdData.title as string) || featDir;
    const featRelease = (prdData.target_release as string) || "v0.1.0";
    featureMap.set(featId, { title: featTitle, release: featRelease });
    featureMap.set(featDir, { title: featTitle, release: featRelease });

    const tasksBase = path.join(featPath, "tasks");
    const stages: ("0-backlog" | "1-in-progress" | "2-review" | "3-done")[] = [
      "0-backlog",
      "1-in-progress",
      "2-review",
      "3-done",
    ];

    for (const stage of stages) {
      const stageDir = path.join(tasksBase, stage);
      if (!fs.existsSync(stageDir)) continue;

      const files = fs.readdirSync(stageDir).filter((f) => f.endsWith(".md")).sort();
      for (const file of files) {
        const filePath = path.join(stageDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const parsed = parseFrontmatter(fileContent).data;

        const taskIdMatch = file.match(/^(TASK-\d+)/i);
        const id = (parsed.id as string) || (taskIdMatch ? taskIdMatch[1].toUpperCase() : file.replace(".md", ""));
        const title = (parsed.title as string) || file.replace(/\.md$/, "");
        const priority = (parsed.priority as string) || "P1";
        const status = (parsed.status as string) || STAGE_STATUS_LABEL[stage] || stage;
        const parentFeature = (parsed.parent_feature as string) || featId;
        const assignedTo = (parsed.assigned_to as string) || "unassigned";
        const branch = (parsed.branch as string) || "-";
        const updatedAt = (parsed.updated_at as string) || (parsed.created_at as string) || "-";
        const createdAt = (parsed.created_at as string) || "-";
        const areas = Array.isArray(parsed.areas) ? (parsed.areas as string[]) : [];

        // Forward slashes for markdown link compatibility
        const taskRelPath = `./features/${featDir}/tasks/${stage}/${file}`;
        const prdRelPath = `./features/${featDir}/prd.md`;

        tasks.push({
          id,
          title,
          stage,
          status,
          priority,
          parent_feature: parentFeature,
          featureDir: featDir,
          featureTitle: featTitle,
          targetRelease: featRelease,
          assigned_to: assignedTo,
          branch,
          areas,
          updated_at: updatedAt,
          created_at: createdAt,
          taskRelPath,
          prdRelPath,
        });
      }
    }
  }

  return { tasks, featureMap };
}

function generateKanbanCommand() {
  const { tasks } = collectAllTasks();

  const backlogTasks = sortTasks(tasks.filter((t) => t.stage === "0-backlog"));
  const inProgressTasks = sortTasks(tasks.filter((t) => t.stage === "1-in-progress"));
  const reviewTasks = sortTasks(tasks.filter((t) => t.stage === "2-review"));
  const doneTasks = sortTasks(tasks.filter((t) => t.stage === "3-done"));

  const total = tasks.length;
  const pct = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0;

  const lines: string[] = [];

  lines.push("# Portfolio Task Kanban Board");
  lines.push("");
  lines.push("> Real-time status board tracking all portfolio feature tasks, active initiatives, and completion metrics.");
  lines.push("> Regenerate anytime with: `npm run pm:kanban`");
  lines.push("");
  lines.push("| Total Tasks | 🚀 In Progress | 🔍 In Review | 📋 Backlog | ✅ Done | Progress |");
  lines.push("| :---: | :---: | :---: | :---: | :---: | :---: |");
  lines.push(
    `| **${total}** | **${inProgressTasks.length}** | **${reviewTasks.length}** | **${backlogTasks.length}** | **${doneTasks.length}** | **${pct}%** |`
  );
  lines.push("");
  lines.push("---");
  lines.push("");

  // 1. In Progress
  lines.push(`## 🚀 In Progress (${inProgressTasks.length})`);
  lines.push("");
  if (inProgressTasks.length === 0) {
    lines.push("_No tasks currently in progress._");
  } else {
    lines.push("| Task | Feature | Priority | Assignee | Branch | Updated |");
    lines.push("| :--- | :--- | :---: | :--- | :--- | :---: |");
    for (const t of inProgressTasks) {
      lines.push(
        `| [${t.id}: ${t.title}](${t.taskRelPath}) | [${t.parent_feature}](${t.prdRelPath}) | \`${t.priority}\` | \`${t.assigned_to}\` | \`${t.branch}\` | ${t.updated_at} |`
      );
    }
  }
  lines.push("");

  // 2. In Review
  lines.push(`## 🔍 In Review (${reviewTasks.length})`);
  lines.push("");
  if (reviewTasks.length === 0) {
    lines.push("_No tasks currently in review._");
  } else {
    lines.push("| Task | Feature | Priority | Assignee | Branch | Updated |");
    lines.push("| :--- | :--- | :---: | :--- | :--- | :---: |");
    for (const t of reviewTasks) {
      lines.push(
        `| [${t.id}: ${t.title}](${t.taskRelPath}) | [${t.parent_feature}](${t.prdRelPath}) | \`${t.priority}\` | \`${t.assigned_to}\` | \`${t.branch}\` | ${t.updated_at} |`
      );
    }
  }
  lines.push("");

  // 3. Backlog
  lines.push(`## 📋 Backlog (${backlogTasks.length})`);
  lines.push("");
  if (backlogTasks.length === 0) {
    lines.push("_No tasks currently in backlog._");
  } else {
    lines.push("| Task | Feature | Priority | Area | Target Release |");
    lines.push("| :--- | :--- | :---: | :--- | :---: |");
    for (const t of backlogTasks) {
      const areaStr = t.areas.length > 0 ? t.areas.map((a) => `\`${a}\``).join(", ") : "-";
      lines.push(
        `| [${t.id}: ${t.title}](${t.taskRelPath}) | [${t.parent_feature}](${t.prdRelPath}) | \`${t.priority}\` | ${areaStr} | ${t.targetRelease} |`
      );
    }
  }
  lines.push("");

  // 4. Completed (Collapsible)
  lines.push(`## ✅ Completed (${doneTasks.length})`);
  lines.push("");
  if (doneTasks.length === 0) {
    lines.push("_No tasks completed yet._");
  } else {
    lines.push("<details>");
    lines.push(`<summary><b>Click to expand completed tasks (${doneTasks.length})</b></summary>`);
    lines.push("");
    lines.push("| Task | Feature | Priority | Assignee | Completed Date |");
    lines.push("| :--- | :--- | :---: | :--- | :---: |");
    for (const t of doneTasks) {
      lines.push(
        `| [${t.id}: ${t.title}](${t.taskRelPath}) | [${t.parent_feature}](${t.prdRelPath}) | \`${t.priority}\` | \`${t.assigned_to}\` | ${t.updated_at} |`
      );
    }
    lines.push("");
    lines.push("</details>");
  }
  lines.push("");

  const kanbanPath = path.join(PM_DIR, "KANBAN.md");
  fs.writeFileSync(kanbanPath, lines.join("\n"), "utf-8");
  console.log(`\x1b[32mSuccessfully updated Kanban board:\x1b[0m ${kanbanPath}`);
}

function newFeatureCommand(rawTitle: string) {
  if (!rawTitle) {
    console.error("Error: Please provide a feature title or ID and title.");
    console.error('Example: npm run pm -- new-feature "FEAT-001 Local Sync CLI"');
    process.exit(1);
  }

  let featId = "";
  let title = rawTitle;

  const idMatch = rawTitle.match(/^([A-Z]+-\d+)\s*(.*)$/i);
  if (idMatch) {
    featId = idMatch[1].toUpperCase();
    title = idMatch[2].trim() || featId;
  } else {
    // Auto-generate next FEAT-ID
    const existing = listFeatures();
    let maxNum = 0;
    for (const f of existing) {
      const m = f.match(/^[A-Z]+-(\d+)/i);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }
    featId = `FEAT-${String(maxNum + 1).padStart(3, "0")}`;
  }

  const folderSlug = `${featId}-${slugify(title)}`;
  const targetDir = path.join(FEATURES_DIR, folderSlug);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Feature directory already exists: ${folderSlug}`);
    process.exit(1);
  }

  ensureDir(targetDir);
  ensureDir(path.join(targetDir, "tasks", "0-backlog"));
  ensureDir(path.join(targetDir, "tasks", "1-in-progress"));
  ensureDir(path.join(targetDir, "tasks", "2-review"));
  ensureDir(path.join(targetDir, "tasks", "3-done"));

  const templatePath = path.join(TEMPLATES_DIR, "prd-template.md");
  let prdContent = "";
  if (fs.existsSync(templatePath)) {
    prdContent = fs.readFileSync(templatePath, "utf-8");
  } else {
    prdContent = `# PRD: {{FEATURE_TITLE}}\n\n## 1. Executive Summary\n`;
  }

  const today = new Date().toISOString().split("T")[0];
  prdContent = prdContent
    .replace(/\{\{FEATURE_ID\}\}/g, featId)
    .replace(/\{\{FEATURE_TITLE\}\}/g, title)
    .replace(/\{\{FEATURE_SLUG\}\}/g, slugify(title))
    .replace(/\{\{DATE\}\}/g, today)
    .replace(/\{\{PRIMARY_AREA\}\}/g, "sync/cli");

  fs.writeFileSync(path.join(targetDir, "prd.md"), prdContent, "utf-8");

  console.log(`\x1b[32mSuccessfully created feature:\x1b[0m ${folderSlug}`);
  console.log(`  PRD: pm/features/${folderSlug}/prd.md`);
  console.log(`  Tasks: pm/features/${folderSlug}/tasks/[0-backlog, 1-in-progress, 2-review, 3-done]`);
}

function newTaskCommand(featureTarget: string, rawTitle: string) {
  if (!featureTarget || !rawTitle) {
    console.error("Error: Please provide feature ID/folder and task title.");
    console.error('Example: npm run pm -- new-task FEAT-001 "Build Frontmatter Updater"');
    process.exit(1);
  }

  const features = listFeatures();
  const matchedFeat = features.find(
    (f) => f.toLowerCase().includes(featureTarget.toLowerCase()) || f.startsWith(featureTarget.toUpperCase())
  );

  if (!matchedFeat) {
    console.error(`Error: Could not find feature matching "${featureTarget}". Available: ${features.join(", ")}`);
    process.exit(1);
  }

  const featPath = path.join(FEATURES_DIR, matchedFeat);
  const tasksBase = path.join(featPath, "tasks");

  // Determine next task ID across all features
  let maxTaskId = 0;
  for (const f of features) {
    const fTasksBase = path.join(FEATURES_DIR, f, "tasks");
    for (const stage of ["0-backlog", "1-in-progress", "2-review", "3-done"]) {
      const sDir = path.join(fTasksBase, stage);
      if (fs.existsSync(sDir)) {
        for (const file of fs.readdirSync(sDir)) {
          const m = file.match(/^TASK-(\d+)/i);
          if (m) maxTaskId = Math.max(maxTaskId, parseInt(m[1], 10));
        }
      }
    }
  }

  const taskId = `TASK-${String(maxTaskId + 1).padStart(3, "0")}`;
  const filename = `${taskId}-${slugify(rawTitle)}.md`;
  const destPath = path.join(tasksBase, "0-backlog", filename);

  const templatePath = path.join(TEMPLATES_DIR, "task-template.md");
  let taskContent = "";
  if (fs.existsSync(templatePath)) {
    taskContent = fs.readFileSync(templatePath, "utf-8");
  } else {
    taskContent = `# {{TASK_ID}}: {{TASK_TITLE}}\n`;
  }

  const featIdMatch = matchedFeat.match(/^([A-Z]+-\d+)/i);
  const featId = featIdMatch ? featIdMatch[1].toUpperCase() : matchedFeat;
  const today = new Date().toISOString().split("T")[0];

  taskContent = taskContent
    .replace(/\{\{TASK_ID\}\}/g, taskId)
    .replace(/\{\{TASK_TITLE\}\}/g, rawTitle)
    .replace(/\{\{FEATURE_ID\}\}/g, featId)
    .replace(/\{\{FEATURE_BRANCH\}\}/g, `feat/${featId.toLowerCase()}-${slugify(rawTitle)}`)
    .replace(/\{\{AREA_KEY\}\}/g, "sync/cli")
    .replace(/\{\{DATE\}\}/g, today);

  fs.writeFileSync(destPath, taskContent, "utf-8");

  console.log(`\x1b[32mSuccessfully created task:\x1b[0m ${filename}`);
  console.log(`  Path: pm/features/${matchedFeat}/tasks/0-backlog/${filename}`);

  generateKanbanCommand();
  generateRoadmapCommand();
}

function moveTaskCommand(taskTarget: string, targetStageRaw: string) {
  if (!taskTarget || !targetStageRaw) {
    console.error("Error: Please provide task ID/name and target stage.");
    console.error("Example: npm run pm -- move TASK-001 in-progress");
    console.error("Valid stages: backlog (0), in-progress (1), review (2), done (3)");
    process.exit(1);
  }

  const targetStageFolder = STAGE_FOLDERS[targetStageRaw.toLowerCase()];
  if (!targetStageFolder) {
    console.error(`Error: Unknown stage "${targetStageRaw}". Valid options: backlog, in-progress, review, done.`);
    process.exit(1);
  }

  // Find task
  const features = listFeatures();
  let foundFilePath = "";
  let foundFeature = "";
  let currentStageFolder = "";

  for (const f of features) {
    const tasksBase = path.join(FEATURES_DIR, f, "tasks");
    for (const stage of ["0-backlog", "1-in-progress", "2-review", "3-done"]) {
      const sDir = path.join(tasksBase, stage);
      if (fs.existsSync(sDir)) {
        const lowerTarget = taskTarget.toLowerCase();
        const files = fs.readdirSync(sDir);
        // Primary pass: anchored match (F-007)
        for (const file of files) {
          const lowerFile = file.toLowerCase();
          if (
            lowerFile.startsWith(`${lowerTarget}-`) ||
            lowerFile.startsWith(`${lowerTarget}.`) ||
            lowerFile === `${lowerTarget}.md` ||
            lowerFile === lowerTarget
          ) {
            foundFilePath = path.join(sDir, file);
            foundFeature = f;
            currentStageFolder = stage;
            break;
          }
        }
        // Secondary fallback pass: substring search
        if (!foundFilePath) {
          for (const file of files) {
            if (file.toLowerCase().includes(lowerTarget)) {
              foundFilePath = path.join(sDir, file);
              foundFeature = f;
              currentStageFolder = stage;
              break;
            }
          }
        }
      }
      if (foundFilePath) break;
    }
    if (foundFilePath) break;
  }

  if (!foundFilePath) {
    console.error(`Error: Could not locate task matching "${taskTarget}".`);
    process.exit(1);
  }

  if (currentStageFolder === targetStageFolder) {
    console.log(`Task is already in stage "${targetStageFolder}".`);
    return;
  }

  const fileName = path.basename(foundFilePath);
  const destDir = path.join(FEATURES_DIR, foundFeature, "tasks", targetStageFolder);
  ensureDir(destDir);
  const destFilePath = path.join(destDir, fileName);

  // Update frontmatter status and updated_at
  const content = fs.readFileSync(foundFilePath, "utf-8");
  const { data, body } = parseFrontmatter(content);
  data.status = STAGE_STATUS_LABEL[targetStageFolder] || targetStageFolder;
  data.updated_at = new Date().toISOString().split("T")[0];

  const updatedContent = formatFrontmatter(data, body);
  fs.writeFileSync(destFilePath, updatedContent, "utf-8");
  fs.unlinkSync(foundFilePath);

  console.log(`\x1b[32mMoved task ${fileName}\x1b[0m`);
  console.log(`  From: ${currentStageFolder}`);
  console.log(`  To:   ${targetStageFolder}`);

  generateKanbanCommand();
  generateRoadmapCommand();
}

function generateRoadmapCommand() {
  const features = listFeatures();
  const rows: string[] = [];

  for (const featDir of features) {
    const featPath = path.join(FEATURES_DIR, featDir);
    const prdPath = path.join(featPath, "prd.md");
    let prdData: Frontmatter = {};

    if (fs.existsSync(prdPath)) {
      const content = fs.readFileSync(prdPath, "utf-8");
      prdData = parseFrontmatter(content).data;
    }

    const featIdMatch = featDir.match(/^([A-Z]+-\d+)/i);
    const featId = featIdMatch ? featIdMatch[1].toUpperCase() : featDir;
    const title = prdData.title || featDir;
    const priority = prdData.priority || "P1";
    const status = prdData.status || "active";
    const release = prdData.target_release || "v0.1.0";

    const tasksBase = path.join(featPath, "tasks");
    let totalTasks = 0;
    let doneTasks = 0;

    for (const stage of ["0-backlog", "1-in-progress", "2-review", "3-done"]) {
      const sDir = path.join(tasksBase, stage);
      if (fs.existsSync(sDir)) {
        const count = fs.readdirSync(sDir).filter((f) => f.endsWith(".md")).length;
        totalTasks += count;
        if (stage === "3-done") doneTasks += count;
      }
    }

    const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const progressStr = `${doneTasks}/${totalTasks} (${pct}%)`;

    rows.push(`| [${featId}](./features/${featDir}/prd.md) | **${title}** | \`${priority}\` | \`${status}\` | ${release} | ${progressStr} |`);
  }

  const roadmapContent = `# Portfolio Product Roadmap & Initiatives

> Auto-generated summary of all portfolio features, synchronization tools, and task execution progress.
> Regenerate anytime with: \`npm run pm:roadmap\`

| Feature ID | Title | Priority | Status | Target Release | Progress |
| :--- | :--- | :--- | :--- | :--- | :--- |
${rows.length > 0 ? rows.join("\n") : "| - | No features created yet | - | - | - | 0% |"}

---

### Priority Legend
- **\`P0\`**: Critical blocker / core milestone requirement.
- **\`P1\`**: High priority for current milestone.
- **\`P2\`**: Medium priority enhancement.
- **\`P3\`**: Nice-to-have / backlog exploration.

### Area Map Reference
See [areas.json](./areas.json) for codebase component mapping.
`;

  const roadmapPath = path.join(PM_DIR, "ROADMAP.md");
  fs.writeFileSync(roadmapPath, roadmapContent, "utf-8");
  console.log(`\x1b[32mSuccessfully updated roadmap:\x1b[0m ${roadmapPath}`);
}

// -------------------------------------------------------------
// Entrypoint
// -------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0] || "kanban";

switch (command) {
  case "kanban":
  case "generate-kanban":
  case "status":
    generateKanbanCommand();
    break;
  case "new-feature":
    newFeatureCommand(args[1]);
    break;
  case "new-task":
    newTaskCommand(args[1], args[2]);
    break;
  case "move":
    moveTaskCommand(args[1], args[2]);
    break;
  case "roadmap":
  case "generate-roadmap":
    generateRoadmapCommand();
    break;
  case "all":
    generateRoadmapCommand();
    generateKanbanCommand();
    break;
  default:
    console.log(`Unknown command: ${command}`);
    console.log("Usage: kanban | new-feature | new-task | move | generate-roadmap | all");
    process.exit(1);
}

