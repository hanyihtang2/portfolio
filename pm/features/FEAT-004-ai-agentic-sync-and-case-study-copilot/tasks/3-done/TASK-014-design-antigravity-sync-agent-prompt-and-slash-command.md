---
id: TASK-014
parent_feature: FEAT-004
title: Design Antigravity sync agent prompt and slash command specification
status: done
priority: P1
areas:
  - sync/cli
target_paths:
  - pm/docs/ai-sync-copilot-guide.md
branch: feat/feat-004-copilot-prompt
dependencies: []
assigned_to: human
created_at: 2026-10-28
updated_at: 2026-10-30
---

# TASK-014: Design Antigravity Sync Agent Prompt and Slash Command Specification

## 1. Objective
Author the specification and prompt instructions (`pm/docs/ai-sync-copilot-guide.md`) for an Antigravity AI co-pilot capable of auditing sibling repositories and drafting portfolio case-study updates.

## 2. Context & PRD Reference
- Parent PRD: `../prd.md`
- Target assistant: Google Antigravity

## 3. Technical Implementation Details
- Formulate the system prompt structure:
  - Role: Senior Product Engineer & Portfolio Biographer.
  - Tone: Editorial, precise, data-backed, avoids hollow corporate jargon.
  - Inspection protocol: check git logs, read `pm/features/*/prd.md`, examine schema changes.
  - Output protocol: present frontmatter updates first, followed by proposed prose diffs.
- Provide example slash command trigger: `/sync-project <ProjectName>`.

## 4. Acceptance Criteria
- [x] Complete prompt template documented with clear inputs and outputs.
- [x] Guidance on restricting agent file edits strictly to the relevant project markdown file.
- [x] Includes tone guidelines with specific dos and don'ts.

## 5. Agent Run Notes & Prompt Guidance
> **Agent Instructions:**
> Reference Antigravity best practices for subagents and slash commands.

### Execution Log / Decisions
- Authored comprehensive specification in `pm/docs/ai-sync-copilot-guide.md`.
- Defined Senior Product Engineer & Portfolio Biographer persona with high-trust tone principles.
- Documented 4-step inspection sequence (Fact Ingestion -> Commit Synthesis -> PRD Reading -> Narrative Drafting).
- Established dual review gates: interactive chat diff approval and Astro static build verification.
- Provided standardized prompt template for subagent delegation and slash command invocations.

