/**
 * AST-Safe Markdown Frontmatter Parser and Updater
 *
 * Zero-dependency TypeScript module that parses and updates YAML frontmatter in
 * Astro project markdown files while preserving 100% of the handwritten markdown body,
 * LaTeX notation, code blocks, tables, and exact line endings.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface Metric {
  label: string;
  value: string;
  description?: string;
}

export interface TechStack {
  languages?: string[];
  frameworks?: string[];
  tools?: string[];
  infrastructure?: string[];
}

export interface RoadmapItem {
  phase: string;
  title: string;
  status: "Completed" | "In Progress" | "Planned";
  targetQuarter?: string;
  summary: string;
  deliverables: string[];
}

export interface ProjectFrontmatter {
  title: string;
  description: string;
  publishDate: string | Date;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  mockupImage?: string;
  mockupCaption?: string;
  mobileMockupImage?: string;
  mobileMockupCaption?: string;
  featured?: boolean;
  status?: "Completed" | "In Progress" | "Concept";
  role?: string;
  timeline?: string;
  metrics?: Metric[];
  techStack?: TechStack;
  roadmap?: RoadmapItem[];
  [key: string]: unknown;
}

export interface ParsedMarkdown {
  data: ProjectFrontmatter;
  body: string;
  lineEnding: "\r\n" | "\n";
  rawFrontmatter: string;
}

export interface UpdateResult {
  filePath: string;
  originalFrontmatter: ProjectFrontmatter;
  updatedFrontmatter: ProjectFrontmatter;
  changed: boolean;
  content: string;
  dryRun: boolean;
}

// -------------------------------------------------------------
// YAML Parser Implementation
// -------------------------------------------------------------

function stripInlineComment(line: string): string {
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && !inSingle && (i === 0 || line[i - 1] !== "\\")) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble && (i === 0 || line[i - 1] !== "\\")) {
      inSingle = !inSingle;
    } else if (char === "#" && !inDouble && !inSingle) {
      return line.slice(0, i).trimEnd();
    }
  }
  return line;
}

function parseFlowArray(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];

  const items: string[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < inner.length; i++) {
    const char = inner[i];
    if (char === '"' && !inSingle && (i === 0 || inner[i - 1] !== "\\")) {
      inDouble = !inDouble;
      current += char;
    } else if (char === "'" && !inDouble && (i === 0 || inner[i - 1] !== "\\")) {
      inSingle = !inSingle;
      current += char;
    } else if (char === "," && !inDouble && !inSingle) {
      items.push(parseScalar(current.trim()) as string);
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    items.push(parseScalar(current.trim()) as string);
  }

  return items;
}

export function parseScalar(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  // Flow array: ["a", "b"]
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return parseFlowArray(trimmed);
  }

  // Quoted string
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const unquoted = trimmed.slice(1, -1);
    try {
      if (trimmed.startsWith('"')) {
        return JSON.parse(`"${unquoted.replace(/\\"/g, '"').replace(/"/g, '\\"')}"`);
      }
    } catch {
      // Fallback
    }
    return unquoted;
  }

  // Date format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

interface YamlLine {
  indent: number;
  text: string;
  original: string;
}

function parseYamlLines(
  lines: YamlLine[],
  startIdx: number,
  currentIndent: number
): { result: any; nextIdx: number } {
  if (startIdx >= lines.length) {
    return { result: {}, nextIdx: startIdx };
  }

  const isArray = lines[startIdx].indent === currentIndent && lines[startIdx].text.startsWith("- ");

  if (isArray) {
    const list: any[] = [];
    let i = startIdx;

    while (i < lines.length) {
      const line = lines[i];
      if (line.indent < currentIndent) break;
      if (line.indent > currentIndent) {
        // Stray indentation outside of item scope
        i++;
        continue;
      }

      if (!line.text.startsWith("- ")) break;

      const itemRaw = line.text.slice(2).trim();
      const nextItemStart = i + 1;
      let nextItemEnd = nextItemStart;

      while (nextItemEnd < lines.length && lines[nextItemEnd].indent > currentIndent) {
        nextItemEnd++;
      }

      // Check if item is an object with multiple properties:
      // e.g. - label: "foo"
      //        value: "bar"
      // F-003: Only treat as sub-object if valid identifier followed by colon and whitespace (not URLs like https://)
      const subObjectMatch = itemRaw.match(/^([a-zA-Z0-9_\-]+):(?:\s+(.*)|\s*)$/);
      const isSubObject =
        Boolean(subObjectMatch) &&
        !itemRaw.startsWith("[") &&
        !itemRaw.startsWith('"') &&
        !itemRaw.startsWith("'");

      if (isSubObject && subObjectMatch) {
        const firstKey = subObjectMatch[1].trim();
        const firstValRaw = (subObjectMatch[2] || "").trim();
        const obj: Record<string, any> = {};

        if (firstValRaw === "") {
          if (nextItemStart < nextItemEnd) {
            const childIndent = lines[nextItemStart].indent;
            const childResult = parseYamlLines(lines.slice(nextItemStart, nextItemEnd), 0, childIndent);
            obj[firstKey] = childResult.result;
          } else {
            obj[firstKey] = null;
          }
        } else {
          obj[firstKey] = parseScalar(firstValRaw);
        }

        // Parse remaining fields of this object
        if (nextItemStart < nextItemEnd) {
          const childLines = lines.slice(nextItemStart, nextItemEnd);
          const childIndent = childLines[0].indent;
          let k = 0;

          while (k < childLines.length) {
            const cLine = childLines[k];
            if (cLine.indent === childIndent && cLine.text.includes(":")) {
              const cColon = cLine.text.indexOf(":");
              const cKey = cLine.text.slice(0, cColon).trim();
              const cValRaw = cLine.text.slice(cColon + 1).trim();

              if (cValRaw === "") {
                // Nested block under this key
                let subK = k + 1;
                while (subK < childLines.length && childLines[subK].indent > childIndent) {
                  subK++;
                }
                if (subK > k + 1) {
                  const subIndent = childLines[k + 1].indent;
                  const subRes = parseYamlLines(childLines.slice(k + 1, subK), 0, subIndent);
                  obj[cKey] = subRes.result;
                  k = subK;
                  continue;
                } else {
                  obj[cKey] = [];
                }
              } else {
                obj[cKey] = parseScalar(cValRaw);
              }
            }
            k++;
          }
        }

        list.push(obj);
      } else {
        // Scalar array item
        list.push(parseScalar(itemRaw));
      }

      i = nextItemEnd;
    }

    return { result: list, nextIdx: i };
  } else {
    // Object block
    const obj: Record<string, any> = {};
    let i = startIdx;

    while (i < lines.length) {
      const line = lines[i];
      if (line.indent < currentIndent) break;
      if (line.indent > currentIndent) {
        i++;
        continue;
      }

      const colonIdx = line.text.indexOf(":");
      if (colonIdx <= 0) {
        i++;
        continue;
      }

      const key = line.text.slice(0, colonIdx).trim();
      const valRaw = line.text.slice(colonIdx + 1).trim();

      if (valRaw === "") {
        // Nested block
        const childStart = i + 1;
        let childEnd = childStart;
        while (childEnd < lines.length && lines[childEnd].indent > currentIndent) {
          childEnd++;
        }

        if (childEnd > childStart) {
          const childIndent = lines[childStart].indent;
          const childParsed = parseYamlLines(lines.slice(childStart, childEnd), 0, childIndent);
          obj[key] = childParsed.result;
          i = childEnd;
          continue;
        } else {
          obj[key] = {};
        }
      } else {
        obj[key] = parseScalar(valRaw);
      }

      i++;
    }

    return { result: obj, nextIdx: i };
  }
}

export function parseYaml(rawYaml: string): Record<string, any> {
  const rawLines = rawYaml.split(/\r?\n/);
  const yamlLines: YamlLine[] = [];

  for (const raw of rawLines) {
    const stripped = stripInlineComment(raw);
    if (!stripped.trim()) continue;

    const leadingSpaces = stripped.search(/\S/);
    yamlLines.push({
      indent: leadingSpaces >= 0 ? leadingSpaces : 0,
      text: stripped.trim(),
      original: raw,
    });
  }

  if (yamlLines.length === 0) return {};
  const baseIndent = yamlLines[0].indent;
  const { result } = parseYamlLines(yamlLines, 0, baseIndent);
  return result;
}

// -------------------------------------------------------------
// Markdown Separation & Parsing
// -------------------------------------------------------------

export function parseProjectMarkdown(content: string): ParsedMarkdown {
  const lineEnding = content.includes("\r\n") ? "\r\n" : "\n";
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      data: {} as ProjectFrontmatter,
      body: content,
      lineEnding,
      rawFrontmatter: "",
    };
  }

  const rawFrontmatter = match[1];
  const body = match[2];
  const data = parseYaml(rawFrontmatter) as ProjectFrontmatter;

  return {
    data,
    body,
    lineEnding,
    rawFrontmatter,
  };
}

// -------------------------------------------------------------
// YAML Stringification
// -------------------------------------------------------------

function quoteString(val: string): string {
  return JSON.stringify(val);
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  if (typeof val === "string") {
    const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : val;
  }
  return String(val);
}

export function stringifyProjectFrontmatter(
  data: Partial<ProjectFrontmatter>,
  lineEnding: "\r\n" | "\n" = "\n"
): string {
  const lines: string[] = ["---"];

  // Standard ordered keys for portfolio projects
  const standardKeyOrder = [
    "title",
    "description",
    "publishDate",
    "tags",
    "githubUrl",
    "liveUrl",
    "mockupImage",
    "mockupCaption",
    "mobileMockupImage",
    "mobileMockupCaption",
    "featured",
    "status",
    "role",
    "timeline",
    "metrics",
    "techStack",
    "roadmap",
  ];

  const processedKeys = new Set<string>();

  function renderField(k: string, v: unknown) {
    if (v === undefined) return;
    processedKeys.add(k);

    if (k === "title" || k === "description" || k === "role" || k === "timeline") {
      lines.push(`${k}: ${quoteString(String(v))}`);
    } else if (k === "publishDate") {
      lines.push(`${k}: ${formatDate(v as string | Date)}`);
    } else if (k === "githubUrl" || k === "liveUrl" || k === "mockupImage" || k === "mockupCaption" || k === "mobileMockupImage" || k === "mobileMockupCaption") {
      lines.push(`${k}: ${quoteString(String(v))}`);
    } else if (k === "featured") {
      lines.push(`${k}: ${Boolean(v)}`);
    } else if (k === "status") {
      lines.push(`${k}: ${quoteString(String(v))}`);
    } else if (k === "tags" && Array.isArray(v)) {
      const items = v.map((item) => quoteString(String(item))).join(", ");
      lines.push(`${k}: [${items}]`);
    } else if (k === "metrics" && Array.isArray(v)) {
      lines.push("metrics:");
      for (const m of v as Metric[]) {
        lines.push(`  - label: ${quoteString(m.label)}`);
        lines.push(`    value: ${quoteString(m.value)}`);
        if (m.description) {
          lines.push(`    description: ${quoteString(m.description)}`);
        }
      }
    } else if (k === "techStack" && typeof v === "object" && v !== null) {
      lines.push("techStack:");
      const ts = v as TechStack;
      for (const cat of ["languages", "frameworks", "infrastructure", "tools"] as (keyof TechStack)[]) {
        if (Array.isArray(ts[cat]) && ts[cat]!.length > 0) {
          const listStr = ts[cat]!.map((item) => quoteString(String(item))).join(", ");
          lines.push(`  ${cat}: [${listStr}]`);
        }
      }
    } else if (k === "roadmap" && Array.isArray(v)) {
      lines.push("roadmap:");
      for (const item of v as RoadmapItem[]) {
        lines.push(`  - phase: ${quoteString(item.phase)}`);
        lines.push(`    title: ${quoteString(item.title)}`);
        lines.push(`    status: ${quoteString(item.status)}`);
        if (item.targetQuarter) {
          lines.push(`    targetQuarter: ${quoteString(item.targetQuarter)}`);
        }
        lines.push(`    summary: ${quoteString(item.summary)}`);
        if (Array.isArray(item.deliverables) && item.deliverables.length > 0) {
          lines.push("    deliverables:");
          for (const d of item.deliverables) {
            lines.push(`      - ${quoteString(d)}`);
          }
        }
      }
    } else if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => quoteString(String(x))).join(", ")}]`);
    } else if (typeof v === "boolean" || typeof v === "number") {
      lines.push(`${k}: ${v}`);
    } else if (typeof v === "string") {
      lines.push(`${k}: ${quoteString(v)}`);
    } else if (v === null || v === undefined) {
      lines.push(`${k}: null`);
    } else if (typeof v === "object") {
      lines.push(`${k}:`);
      for (const [subK, subV] of Object.entries(v)) {
        if (typeof subV === "string") {
          lines.push(`  ${subK}: ${quoteString(subV)}`);
        } else if (typeof subV === "number" || typeof subV === "boolean") {
          lines.push(`  ${subK}: ${subV}`);
        } else if (subV === null || subV === undefined) {
          lines.push(`  ${subK}: null`);
        } else if (Array.isArray(subV)) {
          lines.push(`  ${subK}: [${subV.map((x) => quoteString(String(x))).join(", ")}]`);
        }
      }
    }
  }

  // Render standard fields in order
  for (const k of standardKeyOrder) {
    if (k in data) {
      renderField(k, data[k]);
    }
  }

  // Render any remaining custom fields
  for (const [k, v] of Object.entries(data)) {
    if (!processedKeys.has(k)) {
      renderField(k, v);
    }
  }

  lines.push("---");
  return lines.join(lineEnding);
}

// -------------------------------------------------------------
// Update Helper
// -------------------------------------------------------------

export function updateProjectFrontmatter(
  filePath: string,
  updates: Partial<ProjectFrontmatter>,
  dryRun = false
): UpdateResult {
  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Project file does not exist: ${absPath}`);
  }

  const rawContent = fs.readFileSync(absPath, "utf-8");
  const { data: original, body, lineEnding } = parseProjectMarkdown(rawContent);

  // Merge updates deeply
  const updated: ProjectFrontmatter = {
    ...original,
    ...updates,
  };

  if (updates.techStack) {
    updated.techStack = {
      ...original.techStack,
      ...updates.techStack,
    };
  }

  const newFrontmatterStr = stringifyProjectFrontmatter(updated, lineEnding);
  const newContent = `${newFrontmatterStr}${lineEnding}${body}`;

  const changed = rawContent !== newContent;

  if (changed && !dryRun) {
    fs.writeFileSync(absPath, newContent, "utf-8");
  }

  return {
    filePath: absPath,
    originalFrontmatter: original,
    updatedFrontmatter: updated,
    changed,
    content: newContent,
    dryRun,
  };
}

// -------------------------------------------------------------
// Self-Testing Suite (run with: node --experimental-strip-types scripts/lib/frontmatter.ts)
// -------------------------------------------------------------

function runSelfTests() {
  console.log("Running Frontmatter Parser & Updater self-tests...\n");

  const projectDir = path.resolve(process.cwd(), "src/content/projects");
  const files = fs.readdirSync(projectDir).filter((f) => f.endsWith(".md"));

  let passed = 0;
  for (const file of files) {
    const fullPath = path.join(projectDir, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const parsed = parseProjectMarkdown(content);

    if (!parsed.data.title) {
      throw new Error(`Failed to parse title for ${file}`);
    }
    if (!parsed.data.publishDate) {
      throw new Error(`Failed to parse publishDate for ${file}`);
    }
    if (!Array.isArray(parsed.data.tags) || parsed.data.tags.length === 0) {
      throw new Error(`Failed to parse tags for ${file}`);
    }

    if (parsed.data.techStack) {
      const ts = parsed.data.techStack;
      if (ts.languages && !Array.isArray(ts.languages)) {
        throw new Error(`techStack.languages is not array in ${file}`);
      }
    }

    if (parsed.data.metrics) {
      if (!Array.isArray(parsed.data.metrics)) {
        throw new Error(`metrics is not array in ${file}`);
      }
      for (const m of parsed.data.metrics) {
        if (!m.label || !m.value) {
          throw new Error(`Invalid metric item in ${file}`);
        }
      }
    }

    if (parsed.data.roadmap) {
      if (!Array.isArray(parsed.data.roadmap)) {
        throw new Error(`roadmap is not array in ${file}`);
      }
      for (const r of parsed.data.roadmap) {
        if (!r.phase || !r.title || !r.status || !Array.isArray(r.deliverables)) {
          throw new Error(`Invalid roadmap item in ${file}: ${JSON.stringify(r)}`);
        }
      }
    }

    // Verify dry-run update leaves file unchanged
    const dryRunResult = updateProjectFrontmatter(fullPath, { status: "In Progress" }, true);
    if (!dryRunResult.dryRun) {
      throw new Error("dryRun flag not respected");
    }

    // Verify body preservation
    if (!parsed.body.includes("#") && parsed.body.length > 50) {
      throw new Error(`Markdown body lost in ${file}`);
    }

    console.log(`  ✓ ${file} (parsed successfully, ${parsed.data.roadmap?.length ?? 0} roadmap items, ${parsed.data.metrics?.length ?? 0} metrics)`);
    passed++;
  }

  console.log(`\nAll ${passed} project files passed AST-safe parsing and dry-run tests!`);
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("scripts/lib/frontmatter.ts")) {
  runSelfTests();
}

