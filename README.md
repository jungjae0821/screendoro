# screendoro

A set of small agent skills for building frontend screens step by step: the user sketches the structure first, the look is picked from mockups, screens are assembled from a fixed kit, and the result is checked by scripts after the design is done.

Each step is its own skill. Install only the ones you need. The skills follow the open `SKILL.md` format, so they are not tied to one agent.

```bash
npx skills add jungjae0821/screendoro
```

## Skills

| Step | Skill | What it does | Status |
|---|---|---|---|
| 1 | `doro-draft` | Takes the user's own draft of the screen first, proposes a structure, and lets the user judge every difference | Draft |
| 2 | `doro-design` | Once per project: mockups to choose from, then `DESIGN.md`, tokens, and a component kit | Draft |
| 3 | `doro-build` | Plans the screen and assembles it from the kit | Draft |
| 4 | `doro-check` | After the design is done: render at 375/768/1280 and run the check scripts | Draft |
| 5 | `doro-report` | Short completion report from the check results | Draft |

The usual order is `doro-draft` → (`doro-design`) → `doro-build` → `doro-check` → `doro-report`. Each skill names the next one when it finishes. `doro-design` runs only when the project has no `DESIGN.md` yet. Landing pages follow the same steps; there is no separate landing skill.

## Files written to your project

| Path | Written by | Contents |
|---|---|---|
| `DESIGN.md` | `doro-design` | Design decisions and token values |
| `screendoro/draft.md` | `doro-draft` | The user's draft, word for word, and the judged structure |
| `<styles>/tokens.css` | `doro-design` | CSS variables generated from `DESIGN.md` |
| `screendoro/mocks/` | `doro-design` | Wireframe, mockups, and kit catalog |
| `screendoro/feedback.md` | `doro-design` | Why the user rejected a mockup, in their words |
| `screendoro/render/` | `doro-check` | Screenshots and check results (JSON) |

Whether to commit these is your call. A common choice is to commit `DESIGN.md` and `screendoro/draft.md` and ignore `screendoro/mocks/` and `screendoro/render/`.

## Requirements

- `doro-check` needs Node 18+ and Playwright. It does not install them for you.
- [antislop](https://github.com/miqdadbadjuber/anti-slop) is optional. `doro-check` uses it if it is installed.

## Migration from 1.x

Version 1.x was a single Claude Code plugin (`plugins/screendoro`) that ran every step in one skill and pulled in frontend-design, antislop, web-quality-skills, and Astryx. Version 2 splits it into the skills above, drops the separate landing strategy step and the Astryx, frontend-design, and web-quality-skills dependencies, and moves project files from `.claude/` to `screendoro/`. The 1.x plugin and its marketplace file are removed; the last 1.x version is commit `1efd79d` in git history.

If you installed 1.x as a Claude Code plugin, remove it:

```bash
claude plugin uninstall screendoro@screendoro-skills
claude plugin marketplace remove screendoro-skills
```
