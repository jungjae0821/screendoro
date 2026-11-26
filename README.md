# screendoro

An agent skill that sets design rules for building web screens. It follows the open `SKILL.md` format.

## Install

Install for your user (`~/.claude/skills/screendoro`):

```bash
npx github:jungjae0821/screendoro
```

Install into the current project (`./.claude/skills/screendoro`):

```bash
npx github:jungjae0821/screendoro --project
```

Install into another folder (`<path>/screendoro`):

```bash
npx github:jungjae0821/screendoro --dir <path>
```

Running the command again updates the skill. Node 16.7 or later is required.

## Rules

- Text uses the Gyeonggi Cheonnyeon font (경기천년체), loaded from the web.
- Buttons have rounded corners.
- No pill-shaped buttons.
- No subtitle or description text under a title.
- No double borders.
- No generic AI-template design.

## Upgrading from 2.x

Version 3 replaces the `doro-draft`, `doro-design`, `doro-build`, `doro-check`, and `doro-report` skills with the single `screendoro` skill. Delete those folders from your skills directory before or after installing.
