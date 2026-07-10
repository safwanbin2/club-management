# AI Workflow

This project is intended to be built through fast AI-assisted vertical slices while still keeping production-grade structure.

## Supported Agents

The same project context is exposed to multiple coding assistants:

- Codex and OpenCode read `AGENTS.md`.
- GitHub Copilot reads `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`.
- Cursor reads `.cursor/rules/*.mdc`.
- Claude reads `CLAUDE.md`.
- OpenCode also receives extra context from `opencode.json`.

Keep shared guidance in `docs/agent-instructions.md` so tool-specific files do not drift.
The `architecture` skill is duplicated under `.codex/skills`, `.claude/skills`, and `.cursor/skills`; keep those copies synchronized when changing the skill.
The Stitch design reference lives under `docs/design/`; keep those docs in the start routine for frontend-capable agents.

## Agent Start Routine

Before planning or editing code, read these files in order:

1. `AGENTS.md`
2. `docs/university-club-management-system.md`
3. `docs/roadmap.md`
4. `docs/domain-model.md`
5. `docs/api-contract.md`
6. `docs/ui-system.md`
7. `docs/design/stitch-source.md`
8. `docs/design/page-map.md`
9. `docs/design/implementation-notes.md`
10. The relevant `architecture` skill reference under the active agent's skill folder.

For feature work, also read `docs/feature-slices.md`, `docs/feature-status.md`, and the relevant existing module/page files.
Before continuing pending implementation, use `docs/feature-status.md` to confirm the current build pointer and slice status.
For frontend work, also inspect the closest Stitch desktop and mobile screenshots under `docs/design/stitch-export/`.

## Work Style

- Build one vertical slice at a time: backend model/service/routes, frontend data hooks/state/UI, routing, validation, and tests.
- Prefer meaningful working UI over placeholder pages.
- Make new page designs follow the closest Stitch reference before adding new visual patterns.
- Keep decisions in docs when they affect future work.
- If implementation needs a narrower scope than the full product brief, state the slice clearly.
- Remove a directory's `.gitkeep` as soon as a real tracked file is added to that directory.

## Done Criteria

A slice is done when:

- Role and permission rules are represented.
- API response shape follows `docs/api-contract.md`.
- Frontend page slice follows the Bit CRM folder shape.
- Loading, empty, error, validation, and confirmation states exist where the workflow needs them.
- `pnpm ts-check`, `pnpm lint`, and focused tests pass, or the reason they could not run is documented.

## Prompting Pattern

Good prompts for this repo:

- "Build the auth vertical slice from `docs/feature-slices.md`."
- "Implement club browsing and membership requests with backend persistence."
- "Polish the dashboard shell using the UI system, no placeholders."
- "Review the event registration flow against the domain model."

Avoid prompts that ask for the entire product in one pass. The product is large enough that smaller slices will produce better code and fewer hidden assumptions.
