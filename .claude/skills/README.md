# Agent skills

Claude Code loads these skills automatically for anyone working in this repo (locally or in cloud sessions).

| Skill | Source (commit) | License | Use it for |
| --- | --- | --- | --- |
| Superpowers (15 skills: `brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging`, ...) | [obra/superpowers](https://github.com/obra/superpowers) @ 22f0b46 (v7.0.2) | MIT | Spec, plan, test-first build and review workflow |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) @ 4f2dbb6 (v2.15.0) | MIT | Generating a design system: styles, palettes, font pairings, UX rules |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ cf7ea4a (v4.8.1) | Apache-2.0 | `/impeccable critique`, `audit`, `polish`, `harden` and the AI-slop detector |

These are vendored copies. To update one, replace its folder with the newer version from upstream.

Notes:
- `ui-ux-pro-max` runs local Python 3 scripts (`scripts/search.py`).
- `impeccable` downloads its engine binary on first use into `~/.impeccable/bin/`, verified against `scripts/engine-checksums.txt`. Run `/impeccable init` once to create `PRODUCT.md`.
- When a linter is added to this repo, exclude `.claude/**` so it doesn't lint the vendored skill files.
