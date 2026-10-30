# Rule: Tier 1 Reviewer Subagent Protocol

This rule governs how AI coding agents in this repository invoke, handle, and escalate automated code reviews before marking tasks as ready for review or opening pull requests.

---

## 1. When to Invoke the Reviewer Subagent

Whenever you complete code changes for any task tracked under `pm/features/*/tasks/`:
1. **Never review your own code in the same session.** You suffer from self-review blindness and confirmation bias.
2. Ensure all task acceptance criteria are marked `[x]` in the task markdown file.
3. Verify deterministic checks by running `npm run build`.
4. Generate an isolated Evidence Pack by running:
   ```bash
   npm run agent:review-pack <TASK_ID>
   ```
5. Launch the Tier 1 Reviewer Subagent using the `invoke_subagent` tool (Role: `Reviewer Subagent`, TypeName: `research` or fresh subagent), providing the compiled evidence pack in `.review/evidence-pack-<task-id>.md` and the instructions from `scripts/review/reviewer-prompt-template.md`.

---

## 2. Handling the Reviewer Verdict

The reviewer returns a structured JSON verdict conforming to `pm/standards/schemas/review-verdict.schema.json`.

### Scenario A: Verdict is `PASS` (`blocking_count === 0`)
- P2 nits (if any) may be addressed optionally.
- Move the task to review stage:
  ```bash
  npm run pm -- move <TASK_ID> review
  ```
- Open a Pull Request including the Evidence Pack in the PR body.

### Scenario B: Verdict is `CHANGES_REQUESTED` (Iteration 1)
- Read each P0 and P1 finding carefully.
- Modify the code to address the specific defect and failure evidence.
- Run `npm run build` to verify the fix.
- Re-generate the evidence pack:
  ```bash
  npm run agent:review-pack <TASK_ID>
  ```
- Invoke the reviewer subagent for **Iteration 2**, referencing the updated evidence pack and the previous findings.

### Scenario C: Verdict is `CHANGES_REQUESTED` (Iteration 2)
- **Hard Termination Ceiling:** Do NOT attempt a 3rd iteration.
- Set verdict state to `ESCALATED_TO_HUMAN`.
- Output a clear summary of the unresolved blockers for the human engineer.
- Await human guidance.

---

## 3. Reviewer Subagent Constraints

- The reviewer subagent MUST be read-only (zero file modifications).
- The reviewer MUST cite exact file paths, line ranges, and concrete execution proof for all P0/P1 blockers.
- Subjective style commentary and abstract architectural nitpicks are prohibited.

