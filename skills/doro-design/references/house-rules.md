# House rules

The user's rules for every project. A direct instruction from the user overrides them.

## Font: Gyeonggi Cheonnyeon

- Headings, buttons, nav, emphasis: `'경기천년제목'`. Body, tables, form values: `'경기천년바탕'`. Fallback: `'Pretendard', system-ui, sans-serif`.
- Monospace only where fixed width does a job (code, aligned numbers).
- Korean body text gets `word-break: keep-all`.
- Use font files already in the project, or ask the user for them. Never invent a CDN URL.

Ask once, and use another font only if the user agrees, when:
- the project already has its own font
- the site has no Korean text
- it is an operate screen and table, form, or helper text is 14px or smaller (body serif is hard to read there; headings stay Gyeonggi)

Record an exception in `DESIGN.md` typography as `[user]`.

## Buttons: rounded

- Every button has a radius of 8px or more, one rule per screen.
- Do not default to pill shape; pick a value that fits the direction.
- Only buttons. Inputs, cards, badges, and modals get their own radius.

## No double borders

Not allowed: `border-style: double`; a border plus an outline or ring shadow; a bordered box inside a bordered box less than 16px apart (table cells excepted); a border plus an inset shadow; a pseudo-element line next to a border.

Keep one. Usually drop the inner border and separate with spacing or a surface tint. Focus rings stay; give them `outline-offset`.

## No needless underlines or elements

Remove: decorative bars under headings, underlines on nav, buttons, or card titles, highlighter marks, unneeded dividers, eyebrow labels, meaningless badges, decorative icons, background blobs, dot or grid patterns, filler copy, empty cards, arrows that do nothing.

Keep: underlines on links inside sentences, active-tab and current-page lines, `del`, `s`, `ins`.

Test: does removing it lose information or function? If not, remove it. Then fill the gap with type contrast, spacing, a surface change, or real content, not with another ornament.
