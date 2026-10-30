---
id: FEAT-004
title: "AI Agentic Sync and Case Study Co-Pilot"
status: completed
priority: P0
target_release: v0.4.0
lead: human
created_at: 2026-10-28
branch_prefix: feat/feat-004-ai-copilot
areas:
  - sync/cli
  - content/projects
---

# PRD: AI Agentic Sync and Case Study Co-Pilot (Phase 4)

## 1. Executive Summary & Problem Statement
Automated scripts can update frontmatter versions, roadmap tables, and metric counters, but they cannot articulate the human engineering narrative: *Why did we move from Supabase to Neon? How did we resolve mobile gesture conflicts between bottom sheets and MapLibre GL panning?*

This feature establishes an **AI Agentic Co-Pilot** workflow powered by Google Antigravity. When invoked via a custom prompt or slash command (`/sync-project PlateMark`), the agent analyzes recent git commits, PRDs, and code diffs in the target repository, synthesizes the core technical decisions, and drafts enriched case-study narrative paragraphs for the author to review interactively in chat before committing.

---

## 2. User Stories
- **As the portfolio author**, I want to tell the AI assistant `"Update the PlateMark case study based on the last two weeks of commits"`, and receive well-crafted narrative paragraphs explaining technical trade-offs without writing them from scratch.
- **As an engineering hiring manager**, I want to read compelling, detailed architectural stories that showcase real problem-solving rather than generic marketing bullet points.
- **As the author**, I want an interactive review step in chat where I can edit, approve, or reject proposed prose changes before files are touched.

---

## 3. Scope & Key Capabilities

### In Scope
- **Antigravity Custom Skill / Prompt Pattern**:
  - Structured prompt instructions guiding the AI agent to inspect git logs (`git log -n 25 --oneline`), PRDs in `pm/features/`, and key source file diffs.
- **Git Diff & Commit Synthesizer**:
  - Translates cryptic commit messages (e.g. `c24d28c feat(places): convert VenueDetailDrawer to mobile bottom sheet`) into readable architectural narratives describing UX design, performance optimizations, and state management.
- **Interactive Review & Astro Build Validation**:
  - Presents proposed narrative diffs in the chat conversation.
  - Automatically runs `npm run build` to verify that newly generated headings, tables, or markdown links do not break Astro static generation.
- **Mockup & Diagram Asset Synchronization**:
  - Helper to detect new UI screenshots or diagrams in sibling repositories, copy them into `public/images/projects/`, and generate accessible caption frontmatter.

### Out of Scope
- Unattended, headless AI generation without human review.

---

## 4. User Experience & Flows

```text
User: /sync-project PlateMark

Antigravity Agent:
1. Inspecting c:\Users\hanyi\projects\PlateMark (15 new commits found since last sync).
2. Found completed features: TECH-005 (Mobile Atlas UX), TECH-006 (Mobile Directory Polish).
3. Running local sync script to update frontmatter.
4. Proposed Case Study Additions:
   ### Mobile-First Sheet Architecture & Camera Offsets
   "To deliver an uninterrupted one-handed exploration experience on mobile, PlateMark 
   transitions from desktop split-view to a full-bleed MapLibre GL canvas paired with a 
   tri-state snapping bottom sheet..."
   
Would you like me to commit these changes and run `npm run build`?
```

---

## 5. Technical Architecture & Constraints
- **Primary Code Areas**: `scripts/agent/`, `pm/areas.json`, Antigravity customizations.
- **Voice & Tone Constraints**: High-trust, analytical, humble, and deeply technical (inspired by Stripe Engineering and Monzo blogs). Avoid generic AI buzzwords ("paradigm shift", "seamless experience").

---

## 6. Acceptance Criteria
- [ ] Custom agent prompt accurately reads git diffs and PRDs from sibling repositories.
- [ ] Synthesizes technical decisions into authentic, human-grade engineering prose.
- [ ] Validates full Astro build before finalizing changes.
- [ ] Leaves all existing handwritten sections intact unless explicitly replaced.

---

## 7. Task Breakdown Index
- [ ] `TASK-014`: Design Antigravity sync agent prompt and slash command specification
- [ ] `TASK-015`: Build Git diff & commit synthesizer for case study narrative drafting
- [ ] `TASK-016`: Implement interactive review workflow & Astro build validation gate
- [ ] `TASK-017`: Build UI mockup and diagram asset synchronization helper

