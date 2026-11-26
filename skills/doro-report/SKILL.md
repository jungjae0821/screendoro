---
name: doro-report
description: Write the short completion report for screen work after doro-check, from the facts its script gathers.
compatibility: Node 18+
metadata:
  version: "2.0.0-draft"
  step: "5 of 5"
---

Use this last, after `doro-check`, to tell the user what was done and what is left.

## Steps

1. From the project root, run `node <skill>/scripts/report.cjs`. It reads the doro-check reports, the draft verdicts, `[AI]` values in `DESIGN.md`, and `TODO(screendoro)` placeholders.

2. If the output lists any "still required" item, the work is not done. Say which items remain instead of reporting completion.

3. Write the report in the user's language, in three to six short lines:
   - steps: which of draft, design, build, check ran, and which were skipped
   - draft: differences found by the user and by AI, and how they were judged
   - checks: widths checked, console errors, failed requests, CLS and LCP if measured; "rendering unverified" with the reason if there is no report
   - fixed: how many required items `doro-check` fixed, with one or two examples
   - left: recommended items not fixed, as a short list
   - real content: the placeholders that need the user's material

4. If `DESIGN.md` has `[AI]` values, list a few and ask whether to accept them. Change the ones the user accepts to `[user]`.

State only what the script output or this conversation shows. Leave out lines with nothing to say.
