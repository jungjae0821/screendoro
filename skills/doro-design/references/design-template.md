---
name: <project>
surface: persuade
colors:
  bg: "#ffffff"
  text: "#111111"
  primary: "#0000ff"
typography:
  display:
    fontFamily: "'경기천년제목', 'Pretendard', system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "'경기천년바탕', 'Pretendard', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
rounded:
  button: "10px"
  input: "6px"
---

<!-- Values above show the format only. Replace every one with values from the picked mockup. -->
<!-- Token names become CSS variables: colors.x → --color-x, typography.x.fontSize → --text-x, spacing.x → --space-x, rounded.x → --radius-x. -->
<!-- Blended colors (muted text, tinted surfaces) get their own entry under colors. -->

# Design

One line per value: the value, why, and a mark ([picked: B], [user], [existing], [AI]). Leave out sections that do not apply.

## Overview
Direction, its source, screen type, one guiding sentence.

## Color
Role of each color and where it is used.

## Typography
Size steps, weights, line breaking (`text-wrap: balance` for headings, `word-break: keep-all` for Korean body).

## Layout
Grid, max width, outer margins per breakpoint, alignment.

## Section rhythm
Spacing between sections (two steps: major and minor), when the surface color changes, no two sections of the same type in a row.

## Section types
3 to 5 types named for their role in this direction, each with when to use it, a small ASCII sketch, and its kit path.

## Signature
The one memorable element: what it is, where it appears, how often.

## Depth and shape
Shadows, borders, surfaces, radius per element type.

## Components
Buttons, inputs, nav, surfaces, states (hover, active, focus, disabled, loading, error, empty).

## Do and don't
House rules, plus anything the user rejected during mockups.

## Kit
| Part | Path | Mark |
|---|---|---|
