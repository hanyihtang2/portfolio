/**
 * Types for Two-Tier Agentic Review and Quality Gate Pipeline
 */

export type Severity = "P0" | "P1" | "P2";

export type VerdictStatus = "PASS" | "CHANGES_REQUESTED" | "ESCALATED_TO_HUMAN";

export interface AreaDefinition {
  title: string;
  description: string;
  paths: string[];
  techStack: string[];
}

export interface AreasConfig {
  $schema?: string;
  version?: string;
  areas: Record<string, AreaDefinition>;
}

export interface TaskSpec {
  id: string;
  title: string;
  parentFeature: string;
  filePath: string;
  stage: string;
  objective: string;
  acceptanceCriteria: { text: string; completed: boolean }[];
  targetPaths: string[];
  declaredAreas: string[];
}

export interface DeterministicCheckResult {
  name: string;
  command: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  output: string;
  exitCode: number;
  durationMs: number;
}

export interface MatchedAreaInfo {
  key: string;
  title: string;
  description: string;
  techStack: string[];
  matchedFiles: string[];
}

export interface EvidencePackData {
  taskId: string;
  targetBranch: string;
  currentBranch: string;
  timestamp: string;
  taskSpec: TaskSpec;
  matchedAreas: MatchedAreaInfo[];
  outOfScopeFiles: string[];
  deterministicChecks: DeterministicCheckResult[];
  changedFiles: string[];
  gitDiff: string;
}

export interface ReviewFinding {
  id: string;
  severity: Severity;
  file: string;
  line_start?: number;
  line_end?: number;
  criterion_id?: string;
  description: string;
  evidence: string;
  suggested_fix: string;
}

export interface ReviewVerdict {
  $schema?: string;
  task_id: string;
  verdict: VerdictStatus;
  iteration: number;
  evaluated_at: string;
  reviewer: string;
  deterministic_checks: Record<string, "SUCCESS" | "FAILED" | "SKIPPED">;
  blocking_count: number;
  summary: string;
  findings: ReviewFinding[];
}

