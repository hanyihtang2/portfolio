# Two-Tier Agentic Review and Quality Gate Pipeline

**Canonical Reference Guide & Cross-Repository Rollout Kit**  
**Initiative:** FEAT-005  
**Governing Standard:** [`pm/standards/AGENT_REVIEW_CONTRACT.md`](../../pm/standards/AGENT_REVIEW_CONTRACT.md)  
**Schema Definition:** [`pm/standards/schemas/review-verdict.schema.json`](../../pm/standards/schemas/review-verdict.schema.json)  

---

## 1. Executive Summary & Problem Space

As autonomous coding agents become the primary driver of feature development across repositories, engineering organizations face two systemic failure modes:

1. **Self-Review Blindness (In-Session):**  
   A primary coding agent that writes code accumulates tens of thousands of tokens of trial-and-error reasoning, compile-repair attempts, and conversational residue. When prompted to review its own work, it suffers from **confirmation bias** and **intent anchoring**—evaluating what it intended to build rather than the ground-truth diff.
2. **Post-Hoc Disconnected Fix Loops (Remote PR Bots):**  
   Relying solely on remote PR bots (e.g. GitHub Action webhook reviewers) disconnects critique from execution. By the time a PR comment is posted, the local execution session is terminated. Re-triggering automated fixes across asynchronous git pushes creates high token overhead, noisy git histories, and prolonged review cycles.

### The Solution: Two-Tier Review Architecture

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

- **Tier 1 (Inner Loop):** A fresh-context, read-only reviewer subagent audits the branch diff against task acceptance criteria and architectural domains (`pm/areas.json`) *while the active coding session is live*. Blocker findings (P0/P1) trigger an immediate, in-session fix loop capped at **2 iterations**.
- **Tier 2 (Outer Loop):** Once Tier 1 passes, the PR is opened with an embedded **Evidence Pack**. GitHub Actions enforces remote deterministic compilation and verifies review evidence before alerting the human maintainer who holds the merge key.

---

## 2. Review Contract & Severity Taxonomy Quick Reference

Reviews are strictly objective. Hallucinated nitpicking and abstract stylistic advice are prohibited.

| Severity | Label | Merge Impact | In-Loop Auto-Fix | Qualifying Conditions |
| :--- | :--- | :---: | :---: | :--- |
| **`P0`** | **Blocker** | **BLOCKS** | **Yes** | Deterministic check fails (`npm run build`), task acceptance criterion not met, runtime exception / null pointer, data loss, security vulnerability. |
| **`P1`** | **High** | **BLOCKS** | **Yes** | Boundary violation (`pm/areas.json` or undeclared paths), missing I/O error boundary, breaking API contract change. |
| **`P2`** | **Nit** | **DOES NOT BLOCK** | **No (Optional)** | Minor non-blocking typos in comments, optional idiomatic suggestions. |

Every P0/P1 finding must satisfy the **Proof-of-Defect Requirement**:
1. Exact relative file path.
2. Exact line numbers in the diff.
3. Violating Acceptance Criterion ID or specific crash scenario.
4. Concrete suggested code snippet.

---

## 3. Sibling Repository Adoption Checklist

To implement this architecture in sibling projects (**PlateMark**, **MAKER**, **CommuteShift**), follow this 5-step checklist:

### Step 1: Copy Core Standards & Schemas
Copy the contract and schema files from the portfolio into the target repository:
```bash
mkdir -p pm/standards/schemas
cp <portfolio-root>/pm/standards/AGENT_REVIEW_CONTRACT.md pm/standards/
cp <portfolio-root>/pm/standards/TIER_1_REVIEWER_SPEC.md pm/standards/
cp <portfolio-root>/pm/standards/schemas/review-verdict.schema.json pm/standards/schemas/
```

### Step 2: Install Evidence Pack Orchestrator & CLI Scripts
1. Copy the review scripts:
   ```bash
   mkdir -p scripts/review
   cp <portfolio-root>/scripts/review/prepare-evidence.ts scripts/review/
   cp <portfolio-root>/scripts/review/types.ts scripts/review/
   cp <portfolio-root>/scripts/review/reviewer-prompt-template.md scripts/review/
   ```
2. Add `.review/` to `.gitignore`:
   ```gitignore
   # Review Evidence Packs
   .review/
   ```
3. Register the npm script in `package.json`:
   ```json
   {
     "scripts": {
       "agent:review-pack": "node --experimental-strip-types scripts/review/prepare-evidence.ts"
     }
   }
   ```

### Step 3: Install Antigravity Rules
Copy the reviewer subagent rule:
```bash
mkdir -p .gemini/rules
cp <portfolio-root>/.gemini/rules/reviewer-subagent.md .gemini/rules/
```

### Step 4: Configure GitHub Quality Gate & PR Template
1. Copy the pull request template:
   ```bash
   mkdir -p .github
   cp <portfolio-root>/.github/pull_request_template.md .github/
   ```
2. Copy the GitHub Actions quality gate workflow:
   ```bash
   mkdir -p .github/workflows
   cp <portfolio-root>/.github/workflows/agent-quality-gate.yml .github/workflows/
   ```

### Step 5: Enable GitHub Branch Protection
In GitHub repository settings (`Settings -> Branches -> Branch protection rules -> main`):
- Enable: **Require status checks to pass before merging**.
- Add required check: `Deterministic Build & Typecheck Gate`.
- Add required check: `Evidence Pack & Review Contract Gate`.
- Do NOT grant bypass permissions to automated bot tokens.

---

## 4. Adapting to Different Tech Stacks

Each sibling project has unique frameworks and build requirements. Customize `scripts/review/prepare-evidence.ts` and `.github/workflows/agent-quality-gate.yml` using the recipes below:

### Recipe A: MAKER (Turborepo + Monorepo)

**Build Command Adaptation:**
In Turborepo, run scoped builds and package tests instead of global checks:
```typescript
// scripts/review/prepare-evidence.ts (MAKER adaptation)
const command = "pnpm turbo run check-types test build --filter=...[origin/main]";
```

**Quality Gate Workflow Adaptation (`.github/workflows/agent-quality-gate.yml`):**
```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9

- name: Install Monorepo Dependencies
  run: pnpm install --frozen-lockfile

- name: Run Turborepo Pipeline
  run: pnpm turbo run lint check-types test build
```

---

### Recipe B: CommuteShift (React + Vite SPA)

**Build Command Adaptation:**
```typescript
// scripts/review/prepare-evidence.ts (CommuteShift adaptation)
const command = "npm run test:run && npm run build"; // runs Vitest then Vite build
```

**Quality Gate Workflow Adaptation:**
```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm

- name: Install dependencies
  run: npm ci

- name: Run Vitest and Vite Build
  run: |
    npm run test:run
    npm run build
```

---

### Recipe C: PlateMark (Next.js + Neon + Drizzle/Prisma)

**Build Command Adaptation:**
PlateMark requires database schema generation before compiling API routes and server components:
```typescript
// scripts/review/prepare-evidence.ts (PlateMark adaptation)
const command = "npx drizzle-kit generate && npm run build";
```

**Quality Gate Workflow Adaptation:**
```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm

- name: Run Drizzle Check & Next.js Build
  run: |
    npm ci
    npm run lint
    npm run build
  env:
    DATABASE_URL: "postgresql://dummy:dummy@localhost:5432/test"
```

---

## 5. Operational Playbook & Troubleshooting

### Handling False-Positive Blocker Claims
Occasionally, an LLM reviewer may flag code that is intentionally designed for an edge case.
1. The primary agent must examine the failure proof.
2. If the reviewer's scenario is invalid (e.g. asserting an input cannot be null when a TypeScript type guard already handles it), the primary agent adds a concise code comment or unit test disproving the scenario.
3. In Iteration 2, the primary agent supplies the test output in the updated Evidence Pack.

### Model Tiering & Token Optimization
- **Evidence Extraction (`scripts/review/prepare-evidence.ts`):** 100% deterministic local Node.js script. **Zero tokens spent.**
- **Tier 1 Reviewer Subagent:** Delegate to standard reasoning models (e.g., `Gemini 1.5 Pro` or `Gemini Flash`) using strict JSON schema output.
- **Evidence Pack Truncation:** Large binary assets or third-party bundles are excluded from the git diff to stay well within 30k context windows.

### Human Escalation Protocol (`ESCALATED_TO_HUMAN`)
When 2 review cycles fail to resolve P0/P1 blockers:
1. The automated agent stops mutating source code immediately.
2. The agent outputs an escalation summary:
   - Violated Acceptance Criteria.
   - Primary agent's proposed approach vs Reviewer subagent's objection.
   - File paths and lines in contention.
3. The human engineer reviews the context and resolves the architectural decision directly.

