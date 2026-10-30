# Portfolio & Multi-Project Engineering Engine

An enterprise-grade, high-performance portfolio and case-study platform built with **Astro 5**, **Tailwind CSS v4**, and **TypeScript**, powered by a version-controlled **PM-as-Code** system and a **Two-Tier Agentic Review and Quality Gate Pipeline**.

---

## 🚀 Key Systems & Architecture

```text
portfolio/
├── .github/                          # CI/CD and Quality Gates
│   ├── workflows/deploy.yml          # GitHub Pages static deployment
│   ├── workflows/agent-quality-gate.yml # Tier 2 agent PR quality gate
│   └── pull_request_template.md      # Standardized PR evidence pack format
├── pm/                               # PM-as-Code Subsystem
│   ├── areas.json                    # Codebase domain boundaries and tech stacks
│   ├── KANBAN.md                     # Auto-generated task kanban board
│   ├── ROADMAP.md                    # Auto-generated feature roadmap
│   ├── standards/                    # Governing review contracts and schemas
│   │   ├── AGENT_REVIEW_CONTRACT.md  # Severity taxonomy (P0/P1/P2) & termination rules
│   │   ├── TIER_1_REVIEWER_SPEC.md   # Fresh-context reviewer subagent spec
│   │   └── schemas/review-verdict.schema.json # JSON verdict schema
│   └── features/                     # Feature initiatives & task lifecycle stages
├── scripts/                          # Automation & Sync Tooling
│   ├── pm.ts                         # PM-as-Code CLI orchestrator
│   ├── sync-projects.ts              # Sibling repository meta & roadmap extractors
│   ├── agent/                        # AI narrative synthesis & verification tools
│   └── review/                       # Evidence pack compilers & reviewer templates
├── docs/                             # Engineering Guides & Architecture RFCs
│   └── guides/two-tier-agentic-review.md # Canonical cross-repo rollout guide
└── src/                              # Astro static site application
    ├── content/projects/             # Markdown case studies & collection schemas
    ├── pages/                        # Routes (projects, roadmaps, resume, contact)
    └── components/                   # UI components & status badges
```

---

## 🛡️ Two-Tier Agentic Review & Quality Gate Pipeline (FEAT-005)

To prevent **self-review blindness** (where an author agent evaluates what it intended rather than what it built) and avoid **disconnected PR fix loops**, all development follows a strict two-tier verification model:

```mermaid
flowchart TD
    subgraph Tier1["Tier 1: Inner Loop (Local Pre-PR)"]
        Dev["Primary Coding Agent"] -->|1. Finishes Code| DetBuild["Deterministic Pre-Check (npm run build)"]
        DetBuild -->|Pass| Pack["Evidence Pack Compiler (scripts/review/prepare-evidence.ts)"]
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

### Review Severity Taxonomy

| Severity | Label | Merge Impact | In-Loop Auto-Fix | Trigger Conditions |
| :--- | :--- | :---: | :---: | :--- |
| **`P0`** | **Blocker** | **BLOCKS** | **Yes (Mandatory)** | Build failure, unmet acceptance criteria, runtime crash, data corruption, or security risk. |
| **`P1`** | **High** | **BLOCKS** | **Yes (Mandatory)** | Scope violation (`pm/areas.json`), missing I/O error handling, or breaking API contract. |
| **`P2`** | **Nit** | **DOES NOT BLOCK** | **No (Optional)** | Minor non-blocking typos, documentation improvements, or optional idiomatic patterns. |

- **Proof-of-Defect Requirement:** Every P0/P1 finding must cite exact file path, diff line numbers, concrete execution failure proof, and an actionable remediation snippet.
- **Bounded Iteration:** Hard ceiling of **2 iterations** between author and reviewer agents. If blockers remain unresolved, status escalates to `ESCALATED_TO_HUMAN`.
- **Human Authority:** AI agents never possess direct merge rights; human maintainers retain final merge sign-off.

---

## 🛠️ CLI Commands & Workflows

### Static Site Development
```bash
# Start local development server
npm run dev

# Run Astro check and static production build
npm run build

# Preview production build locally
npm run preview
```

### PM-as-Code Orchestration (`scripts/pm.ts`)
```bash
# Regenerate KANBAN board and ROADMAP dashboard
npm run pm:all

# Scaffold a new feature initiative
npm run pm -- new-feature "FEAT-006 Realtime Performance Telemetry"

# Scaffold a new task in backlog
npm run pm -- new-task FEAT-006 "Add Web Vitals Observer"

# Move a task through lifecycle stages (backlog -> in-progress -> review -> done)
npm run pm -- move TASK-023 in-progress
npm run pm -- move TASK-023 review
npm run pm -- move TASK-023 done
```

### Two-Tier Review & Agentic Verification (`scripts/review/`)
```bash
# Compile isolated Evidence Pack for a task before subagent review
npm run agent:review-pack TASK-019

# Synthesize recent git commits and diffs into case study narrative
npm run agent:synthesize

# Verify case study frontmatter, links, and build integrity
npm run agent:verify

# Synchronize UI mockups and screenshot assets
npm run agent:mockups
```

### Sibling Project Metadata Synchronization
```bash
# Run cross-repo sync for all connected sibling projects
npm run sync:projects

# Dry run sync without writing to disk
npm run sync:dry

# Sync individual project
npm run sync:platemark
npm run sync:maker
npm run sync:commuteshift
```

---

## 📚 Documentation & Reference Guides

- [Cross-Repository Rollout Guide](docs/guides/two-tier-agentic-review.md): Step-by-step instructions for porting the two-tier agent review pipeline to Turborepo monorepos, SPAs, and Next.js applications.
- [Agent Review Contract & Taxonomy](pm/standards/AGENT_REVIEW_CONTRACT.md): Governing contract defining P0/P1/P2 defect rules and loop termination limits.
- [Tier 1 Reviewer Subagent Specification](pm/standards/TIER_1_REVIEWER_SPEC.md): Operational rules and read-only boundaries for fresh-context reviewer subagents.
- [Review Verdict Schema](pm/standards/schemas/review-verdict.schema.json): Draft-07 JSON Schema for structured review verdicts.
- [PM-as-Code Guide](pm/README.md): Detailed workflow documentation for managing features, tasks, and areas.

