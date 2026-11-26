---
name: doro-build
description: Build a screen by assembling the project's kit, following the final structure and DESIGN.md.
metadata:
  version: "2.0.0-draft"
  step: "3 of 5"
  next: "doro-check"
---

Use this to write the code for a new or rearranged screen once the structure is settled. It builds only. Checks run afterwards in `doro-check`.

Read `references/house-rules.md` first.

## Steps

1. Read the final structure for this screen in `screendoro/draft.md`, then `DESIGN.md` and its Kit section. If there is no final structure, hand back to `doro-draft`. If there is no `DESIGN.md`, hand off to `doro-design`. If the project predates `DESIGN.md`, treat its existing components and screens as the kit and match them.

2. Write a short plan and show it in a few lines, without waiting for approval:
   - signature: the one memorable element on this screen, sized and placed per `DESIGN.md`
   - one line per section: `section → section type → content`
   - plan the whole page before building any section

3. Build the page by assembling kit parts and section frames, in final-structure order.
   - Use tokens for every color, size, spacing, and radius. If a value is missing, add it to `DESIGN.md` as `[AI]` and regenerate the token file instead of hard-coding it.
   - Do not restyle a kit part inside a page. Add a variant to the part instead.
   - Make a new section frame only when no section type fits. Add it to the kit and to `DESIGN.md` as `[AI]`.
   - Tell the user before changing an existing kit part, since every screen changes with it.

4. Fill in real content and every state.
   - Write real copy in the product's voice. No lorem ipsum.
   - Do not invent facts: reviews, customer names or logos, user counts, prices, ratings, guarantees. Use what the user gave; otherwise leave a placeholder sized like the real thing and mark it `TODO(screendoro): replace with <what>`.
   - Example data inside product UI (list rows, chart values) may be made up, but should read like a real product's data.
   - Give interactive parts hover, active, focus, disabled, loading, error, and empty states. No dead links; disable what does not work yet.
   - One primary action on the first screen.

5. If the build needs a change to the final structure, stop, tell the user, get a verdict, and append it to the table in `screendoro/draft.md`.

Next: `doro-check`, once every screen in this request is built.
