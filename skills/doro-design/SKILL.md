---
name: doro-design
description: Set a project's look once by letting the user pick from HTML mockups, then write DESIGN.md, tokens, and a small component kit.
compatibility: Node 18+ for scripts/tokens.cjs
metadata:
  version: "2.0.0-draft"
  step: "2 of 5"
  next: "doro-build"
---

Use this once per project, when there is no `DESIGN.md` yet, or when the user asks for a redesign. It sets the look only. Screens are built later by `doro-build`, and checks run later in `doro-check`.

Read `references/house-rules.md` first. Those rules hold in every mockup and in `DESIGN.md`.

## Steps

1. Read the final structure in `screendoro/draft.md`. If there is none, hand back to `doro-draft`. Also read what already exists: CSS approach (plain CSS, Tailwind, CSS Modules), logo, brand colors, font files, and any references the user gave.

2. If the project already has styled screens, ask once: keep the existing style, or redesign. To keep it, write the values the screens already use into `DESIGN.md`, mark each `[existing]`, and skip to step 8.

3. Name the screen type in one line: persuade (landing, pricing), operate (dashboard, settings), read (docs), or showcase (portfolio). The type sets how bold the look can be.

4. Draw the whole main screen as a gray-box wireframe in `screendoro/mocks/wireframe.html`: sections in the final-structure order, real copy, item counts, rough heights, and where the first screen ends. No color, font, or decoration. Show it and ask "as is, or what to change". Every mockup keeps this structure.

5. Make three directions that differ in layout, color, type contrast, and mood, not just color. Take each from something the target users know well (a sign system, packaging, a place, a printed form) and follow `references/slop-tells.md`. For each, write one line each for: source, colors, type contrast, layout, texture, risk.

6. Build each direction as static HTML in `screendoro/mocks/option-a.html` to `option-c.html`: the first screen plus one representative section, the same section in all three. Use the real product name and copy. Do not invent prices, customers, or numbers. Put all three in `screendoro/mocks/index.html` with name and one line each for direction, strength, and risk. Open it for the user.

7. Let the user pick one. Mixes ("A's layout with B's color") are fine. If they reject, ask which axis is wrong (layout, color, type, density, mood), log their words in `screendoro/feedback.md`, change only that axis, and redraw.

8. Write `DESIGN.md` at the project root from the picked mockup, using `references/design-template.md`. Give every value a one-line reason and a mark:
   - `[picked: B]` for values visible in the picked mockup
   - `[user]` for values the user stated
   - `[existing]` for values taken from existing screens
   - `[AI]` for everything else (states, dark mode, components not in the mockup)

9. Generate the token file: `node scripts/tokens.cjs DESIGN.md --out <styles folder>/tokens.css`. Import it once at the app root. Do not hand-copy values.

10. Build a minimal kit in the project's usual component folder (`src/design/` if none): primary and secondary button, input, link, nav, the surface used by this direction, the signature element, and frames only for sections drawn in the mockup. Use tokens only. Put every part with real copy on `screendoro/mocks/kit.html`. List parts and paths in the Kit section of `DESIGN.md`.

## Rules

- Do not write `DESIGN.md` or tokens before the user picks.
- Do not mark a value `[picked]` or `[user]` unless the user saw or said it.
- Do not copy a reference site's logo, images, copy, or whole layout. Take patterns only.
- Do not invent font or image URLs. If the font file is missing, ask for it; if there is still none, keep the `font-family` with fallbacks and note it in `DESIGN.md`.

Next: `doro-build`.
