import type { ProjectFrontmatter } from "../lib/frontmatter.ts";

export interface ProjectExtractionResult {
  slug: string;
  repoPath: string;
  found: boolean;
  warnings: string[];
  updates: Partial<ProjectFrontmatter>;
  summary: {
    status?: string;
    timeline?: string;
    techStackSummary?: string;
    metricsCount?: number;
    details?: Record<string, unknown>;
  };
}

export interface ProjectExtractor {
  slug: string;
  defaultRepoPath: string;
  extract(repoPath?: string): ProjectExtractionResult | Promise<ProjectExtractionResult>;
}

