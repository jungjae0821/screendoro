---
name: doro-draft
description: Get the user's own draft of a new screen or page before proposing anything, then settle the structure together.
metadata:
  version: "2.0.0-draft"
  step: "1 of 5"
  next: "doro-design or doro-build"
---

Use this whenever a new screen or page is built or its sections are rearranged. Skip it for copy, color, spacing, or bug fixes.

Do not propose a structure, layout, example, or options before the user's draft is in. Options you write are your draft, not theirs.

## Steps

1. Ask in plain text, free form, for three things:
   - the elements on the screen and their order
   - the one most important thing
   - references (URL or screenshot) and what to take from each

   For a landing or marketing page, add one line asking for the one action visitors should take, who they are, and what they get.

   Ask only these lines, with no preamble, no explanation of this process, and no hints of what could go on the screen (no "for example, social login or terms"). End with one line, in the user's language, saying they can skip by asking for no draft. If the first message already covers some of this, ask only for what is missing. Any form counts: a list, a sketch photo, a sentence.

2. If the elements or the most important thing are still missing, ask once more for just that, with no examples. Leave whatever stays unanswered blank.

3. Write the draft to `screendoro/draft.md`, word for word. Do not reword, reorder, or fill blanks. For a sketch or screenshot, write what you read, mark it "read from image", and ask the user to confirm. Use the template in `references/draft-template.md`. Append if the file exists.

4. Read the references. Focus on what the user wants to take and on structure: element order, first-screen content, amount of information. Never copy logos, images, copy, or assets.

5. Post your structure in text: element order, one line of content per element, what is emphasized. Follow the draft unless you have a reason not to. Fill blanks yourself. Show it without marking differences and ask the user to point out where it differs from their draft.

6. Record each difference the user points out as found by "user". If they say what to do, that is the verdict. If your version has a reason, say it once in one line and then accept their call.

7. Then disclose every difference they did not mention, with a one-line reason each, found by "AI":
   - changed: order, content, or emphasis differs from the draft
   - dropped: in the draft, not in your structure
   - filled: not in the draft, or a blank you filled

   Say "no other differences" if there are none. Do this even if the user says "just go ahead".

8. Get a verdict per difference: draft, AI, or a mix (write down the mix). A choice prompt is fine for differences you disclosed; with more than four, show a table and take the answer as a message.
   - "you decide": use the AI version for every open difference and list which ones, so the user can revert.
   - "use mine": use the draft for every open difference. Leave out filled items except filled blanks.

9. Write the final structure under "Final structure". Make nothing (no mockup or code) until every verdict is in.

## Skipping

Skip only when the user says so, in any language ("no draft", "초안 없이"). Do not suggest skipping. Write "No draft (skipped by user)" under the screen heading and continue. The next new screen asks again.

## Quick mode

Use it when `DESIGN.md` and a component kit already exist and the screen is a working sub-screen (settings, list, detail, form, admin), not a landing or main screen.

- Ask in one line: "What goes on this screen, and what matters most?" Do not ask for references.
- Post the structure and every difference in one message, skipping step 6.
- Ask for verdicts only if there are differences.

## After this step

The final structure counts as a user instruction: it outranks `DESIGN.md` and any default section order. If a later step needs to change it, tell the user first, get a verdict, and append it to the table.

This skill ends at the final structure. Do not build the screen here. Hand off to the next skill: `doro-design` if the project has no `DESIGN.md`, or `doro-build` if it does. If that skill is not installed, tell the user which one is missing and ask before building without it.
