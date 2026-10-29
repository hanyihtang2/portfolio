# Portfolio Product Management as Code (PM-as-Code)

A repository-native system for managing portfolio feature initiatives, cross-repository synchronization pipelines, PRDs, roadmaps, and agent tasks using version-controlled Markdown.

---

## Directory Structure

```text
pm/
├── areas.json                        # Map of portfolio modules, paths, and tech stack
├── KANBAN.md                         # Auto-generated cross-feature task board
├── ROADMAP.md                        # Auto-generated portfolio roadmap and progress dashboard
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
| **`FEAT-`** | **Product Features** | Cross-repo sync CLI, adapters, roadmap visualizers, case-study tools. | `FEAT-001 Local Sync CLI`, `FEAT-002 PM Adapter` |
| **`INFRA-`** | **Engineering Enablers** | GitHub Actions Pages deployment, repository dispatch listeners, CI. | `INFRA-001 Pages Pipeline`, `INFRA-002 Dispatch Webhooks` |
| **`TECH-`** | **Tech Debt & Polish** | Styling updates, typography scaling, image optimization, SEO. | `TECH-001 Tailwind v4 Tokens`, `TECH-002 Accessibility` |

---

## CLI Commands

The system is managed via `scripts/pm.ts`:

| Command | Description |
| :--- | :--- |
| `npm run pm:kanban` | Regenerates `pm/KANBAN.md` cross-feature task board |
| `npm run pm:roadmap` | Regenerates `pm/ROADMAP.md` table with progress stats |
| `npm run pm:all` | Regenerates both `pm/ROADMAP.md` and `pm/KANBAN.md` |
| `npm run pm -- new-feature "<ID> <Title>"` | Scaffolds a new feature directory, PRD, and task stages |
| `npm run pm -- new-task <ID> "<Title>"` | Scaffolds a new task in `0-backlog` (auto-syncs board) |
| `npm run pm -- move <task-id> <stage>` | Moves a task between stage folders and synchronizes frontmatter, KANBAN, and ROADMAP |

### Examples:
```bash
# Regenerate the task Kanban board
npm run pm:kanban

# Create a feature
npm run pm -- new-feature "FEAT-001 Local Sync CLI and Frontmatter Updater"

# Add a task to an initiative (auto-syncs KANBAN & ROADMAP)
npm run pm -- new-task FEAT-001 "Build Frontmatter AST Updater"

# Move a task through stages (auto-syncs KANBAN & ROADMAP)
npm run pm -- move TASK-001 in-progress
npm run pm -- move TASK-001 review
npm run pm -- move TASK-001 done

# Regenerate roadmap
npm run pm:roadmap
```

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
    }
  }
}
```

---

## AI Agent Prompt Pattern

To assign a task directly to an autonomous AI agent, use this prompt pattern:

```text
Please execute task TASK-001 located at:
pm/features/FEAT-001-local-sync-cli-and-frontmatter-updater/tasks/0-backlog/TASK-001-build-ast-safe-markdown-frontmatter-parser-and-updater.md

Instructions:
1. Read the parent PRD at ../prd.md and pm/areas.json for architectural context.
2. Check pm/areas.json to confirm allowed paths and tech stack.
3. Move the task to 1-in-progress: npm run pm -- move TASK-001 in-progress.
4. Implement the requirements in TypeScript adhering to strict mode.
5. Verify by running: npm run build.
6. Check off each item in the Acceptance Criteria section of the task file [x].
7. Move the task to 2-review: npm run pm -- move TASK-001 review.
```
