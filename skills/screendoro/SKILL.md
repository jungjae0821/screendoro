---
name: screendoro
description: >-
  Design rules for building web screens, pages, components, and HTML mockups.
  Use whenever you create or restyle any user-facing UI.
  Loads the Gyeonggi Cheonnyeon font from the web and keeps the result free of generic AI-template looks.
---

# screendoro

Follow every rule below on every screen.

- Use the Gyeonggi Cheonnyeon font (경기천년체), loaded from the web with the CSS below. Headings use `GyeonggiTitleM`, body text uses `GyeonggiBatang`.
- Buttons have rounded corners.
- No pill-shaped buttons.
- No subtitle or description text under a title.
- No double borders.
- No generic AI-template design: purple or blue gradients, glassmorphism, glowing blobs, centered hero with a small tag above the title, rows of identical icon cards, emoji as icons, the same large radius on everything.

```css
@font-face {
  font-family: 'GyeonggiTitleM';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/GyeonggiTitleM.woff') format('woff');
  font-display: swap;
}
@font-face {
  font-family: 'GyeonggiBatang';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/GyeonggiBatang.woff') format('woff');
  font-display: swap;
}
```
