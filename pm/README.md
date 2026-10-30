# Portfolio Product Management as Code (PM-as-Code)

A repository-native system for managing portfolio feature initiatives, cross-repository synchronization pipelines, PRDs, roadmaps, and agent tasks using version-controlled Markdown.

---

## Directory Structure

```text
pm/
├── areas.json                        # Map of portfolio modules, paths, and tech stack
├── KANBAN.md                         # Auto-generated cross-feature task board
├── ROADMAP.md                        # Auto-generated portfolio roadmap and progress dashboard
├── standards/                        # Governing engineering standards and review contracts
│   ├── AGENT_REVIEW_CONTRACT.md      # P0/P1/P2 taxonomy, proof-of-defect & loop limits
│   ├── TIER_1_REVIEWER_SPEC.md       # Fresh-context reviewer subagent specification
│   └── schemas/
│       └── review-verdict.schema.json # JSON schema for machine-readable review verdicts
├── templates/
│   ├── prd-template.md               # Standard PRD template for new portfolio features
│   └── task-template.md              # Standard Task template for agent execution
└── features/
    ├── FEAT-[ID]-[slug]/             # Product Features (Sync CLI, adapters, CI triggers)
    │   ├── prd.md                    # Feature PRD & architectural requirements
    │   └── tasks/
    │       ├── 0-backlog/            # Tasks planned / pending assignment
    │       ├── 1-in-progress/        # Active tasks (branch cut or being worked on)
    │       ├── 2-review/             # PR open / awaiting static build verification
    │       └── 3-done/               # Completed & merged tasks
    │
    └── INFRA-[ID]-[slug]/            # CI/CD, GitHub Pages & Deployment Tooling
        ├── prd.md                    # Technical specification & requirements
        └── tasks/
            ├── 0-backlog/
            ├── 1-in-progress/
            ├── 2-review/
            └── 3-done/
```

---

## Initiative Types & Prefixes

Initiatives are tracked under `pm/features/` with clear identifier prefixes:

| Prefix | Category | Purpose | Examples |
| :--- | :--- | :--- | :--- |
| **`FEAT-`** | **Product Features** | Cross-repo sync CLI, adapters, roadmap visualizers, case-study tools. | `FEAT-001 Local Sync CLI`, `FEAT-002 PM Adapter`, `FEAT-005 Two-Tier Review` |
| **`INFRA-`** | **Engineering Enablers** | GitHub Actions Pages deployment, repository dispatch listeners, CI. | `INFRA-001 Pages Pipeline`, `INFRA-002 Dispatch Webhooks` |
| **`TECH-`** | **Tech Debt & Polish** | Styling updates, typography scaling, image optimization, SEO. | `TECH-001 Tailwind v4 Tokens`, `TECH-002 Accessibility` |

---

## CLI Commands

### PM-as-Code Orchestration (`scripts/pm.ts`)

| Command | Description |
| :--- | :--- |
| `npm run pm:kanban` | Regenerates `pm/KANBAN.md` cross-feature task board |
| `npm run pm:roadmap` | Regenerates `pm/ROADMAP.md` table with progress stats |
| `npm run pm:all` | Regenerates both `pm/ROADMAP.md` and `pm/KANBAN.md` |
| `npm run pm -- new-feature "<ID> <Title>"` | Scaffolds a new feature directory, PRD, and task stages |
| `npm run pm -- new-task <ID> "<Title>"` | Scaffolds a new task in `0-backlog` (auto-syncs board) |
| `npm run pm -- move <task-id> <stage>` | Moves a task between stage folders and synchronizes frontmatter, KANBAN, and ROADMAP |

### Two-Tier Agentic Review & Verification (`scripts/review/`)

| Command | Description |
| :--- | :--- |
| `npm run agent:review-pack [task-id]` | Runs deterministic checks, extracts clean diff, matches `pm/areas.json`, and compiles isolated Evidence Pack in `.review/` |
| `npm run agent:synthesize` | Synthesizes recent commit logs and diffs into case study narratives |
| `npm run agent:verify` | Verifies project case study frontmatter, links, and builds |
| `npm run agent:mockups` | Synchronizes project screenshots and mockups |

---

## Two-Tier Agentic Review & Quality Gate Pipeline

To eliminate **self-review blindness** and **post-hoc PR fix latency**, all development adheres to the **Two-Tier Agentic Review Model** (FEAT-005):

```mermaid
flowchart TD
    subgraph Tier1["Tier 1: Inner Loop (Local Pre-PR)"]
        Dev["Primary Coding Agent"] -->|1. Finishes Code| DetBuild["Deterministic Pre-Check (npm run build)"]
        DetBuild -->|Pass| Pack["Evidence Pack (npm run agent:review-pack)"]
        Pack -->|Isolated Diff + Criteria| Sub["Fresh-Context Reviewer Subagent"]
        Sub -->|Audit Verdict| Dec1{"Verdict?"}
        Dec1 -->|CHANGES_REQUESTED (Iter 1)| Dev
        Dec1 -->|PASS| PR["Push Branch & Open Pull Request"]
    end

    subgraph Tier2["Tier 2: Outer Loop (GitHub PR & CI Gate)"]
        PR --> GHA["GitHub Actions Quality Gate (.github/workflows/agent-quality-gate.yml)"]
        GHA --> Check1["1. Deterministic Clean Build (npm ci && npm run build)"]
        GHA --> Check2["2. Validate Evidence Pack Structure & PASS Verdict"]
        Check1 --> Summary["Generate GHA Audit Summary"]
        Check2 --> Summary
        Summary --> Human["Human Maintainer Review & Merge Sign-Off"]
    end
```

### Governing Documents & Standards
- [Agent Review Contract & Taxonomy](standards/AGENT_REVIEW_CONTRACT.md): Governs P0/P1/P2 classification, proof-of-defect requirements, and 2-pass termination rules.
- [Tier 1 Reviewer Subagent Spec](standards/TIER_1_REVIEWER_SPEC.md): Defines read-only isolation boundaries and evaluation axes.
- [Review Verdict Schema](standards/schemas/review-verdict.schema.json): Machine-readable JSON contract for reviewer agent output.
- [Cross-Repository Rollout Guide](../docs/guides/two-tier-agentic-review.md): Practical runbook for rolling out this pipeline to sibling repositories (PlateMark, MAKER, CommuteShift).

---

## Codebase Mapping (`pm/areas.json`)

To prevent AI agents from modifying unintended files, [`pm/areas.json`](./areas.json) maps logical domains to exact file trees:

```json
{
  "areas": {
    "content/projects": {
      "paths": ["src/content/projects/", "src/content.config.ts"],
      "techStack": ["astro", "zod", "markdown"]
    },
    "sync/cli": {
      "paths": ["scripts/"],
      "techStack": ["typescript", "nodejs"]
    },
    "review/agentic": {
      "paths": [
        "scripts/review/",
        ".github/workflows/agent-*.yml",
        ".github/pull_request_template.md",
        "pm/standards/",
        "docs/guides/"
      ],
      "techStack": ["typescript", "github-actions", "markdown"]
    }
  }
}
```

---

## AI Agent Prompt Pattern (Two-Tier Review Compliant)

To assign a task directly to an autonomous AI agent under the two-tier review contract, use this updated prompt pattern:

```text
Please execute task TASK-019 located at:
pm/features/FEAT-005-two-tier-agentic-review-and-quality-gate-pipeline/tasks/0-backlog/TASK-019-build-in-loop-evidence-pack-and-pre-review-cli-orchestrator.md

Instructions:
1. Read the parent PRD at ../prd.md and pm/areas.json for architectural context.
2. Check pm/areas.json to confirm allowed paths and tech stack.
3. Move the task to 1-in-progress: npm run pm -- move TASK-019 in-progress.
4. Implement the requirements in TypeScript adhering to strict mode.
5. Verify deterministic checks by running: npm run build.
6. Compile the isolated Evidence Pack: npm run agent:review-pack TASK-019.
7. Delegate code review to a fresh Tier 1 Reviewer Subagent using .gemini/rules/reviewer-subagent.md and scripts/review/reviewer-prompt-template.md.
8. If the reviewer returns CHANGES_REQUESTED with P0/P1 blockers, address them in-session and re-verify (max 2 iterations).
9. Once the reviewer returns PASS, check off all Acceptance Criteria [x] in the task file.
10. Move the task to 2-review: npm run pm -- move TASK-019 review.
11. Submit a Pull Request using .github/pull_request_template.md embedding the Evidence Pack and review verdict.
```
