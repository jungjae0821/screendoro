---
name: doro-check
description: Check finished screens after the design work is done, by rendering them at three widths and running the check scripts, then fix what they find.
compatibility: Node 18+ and Playwright (not installed by this skill)
metadata:
  version: "2.0.0-draft"
  step: "4 of 5"
  next: "doro-report"
---

Use this once every screen in the request is built. The scripts decide what is required; your job is to run them, look at the screenshots, and fix.

## Steps

1. Serve the screen: start the dev server in the background, or use the HTML file path directly.

2. Check that Playwright is available: `node -e "require.resolve('playwright')"`. If it is missing, ask the user whether to install it. If Playwright is there but its browser is not, pass an installed Chrome or Edge with `--executable <path>`. Without it, run `house-check.js`, `design-check.js`, and `launch-check.js` from `scripts/` in any browser you can drive, and report rendering at three widths as unverified.

3. Run, from the project root, once per screen:

   `node <skill>/scripts/render.cjs <url or file> --name <screen>`

   Add `--public` for landing or other public pages, `--dark` if `DESIGN.md` defines dark mode, and `--font "경기천년|<font>"` if `DESIGN.md` records a font exception. The report lands in `screendoro/render/<screen>-report.json` with `required` and `recommended` lists.

4. Open every screenshot and look for what the scripts cannot see: decorative elements from `references/house-rules.md`, overlaps, clipped text, Korean words broken mid-word, a missing or buried signature element.

5. Compare the screen with the final structure in `screendoro/draft.md`, element by element. A difference with no verdict is required: fix it, or ask the user for a verdict.

6. Try the main interactions: the primary action, submitting a form empty, and opening the mobile menu if there is one.

7. If antislop is installed, load its core and the one sub-skill that fits the work best. Treat its findings as recommended unless they break a house rule or accessibility.

8. Fix every required item. If a finding is an exception listed in `references/house-rules.md` (an in-sentence link, an active tab line, a table cell border), leave it and note it as a false positive. Fix recommended items that are quick; leave the rest for the report.

9. Re-run step 3 once, for the fixed screens only. Do not loop further.

Do not claim a screen was checked at a width, or that the console was clean, without a report that says so.

Next: `doro-report`, with the report files from `screendoro/render/`.
