# Shared Agent Instructions

Use this file as the cross-agent adapter for Codex, GitHub Copilot, Cursor, Claude, and OpenCode.

## Start Here

Before meaningful planning or code changes, read:

1. `AGENTS.md`
2. `docs/ai-workflow.md`
3. `docs/university-club-management-system.md`
4. `docs/roadmap.md`
5. `docs/domain-model.md`
6. `docs/api-contract.md`
7. `docs/ui-system.md`
8. `docs/design/stitch-source.md`
9. `docs/design/page-map.md`
10. `docs/design/implementation-notes.md`
11. `docs/feature-slices.md` for feature work
12. `docs/feature-status.md` before continuing pending implementation

For architecture decisions, use the local `architecture` skill:

- `.codex/skills/architecture/SKILL.md`
- `.claude/skills/architecture/SKILL.md`
- `.cursor/skills/architecture/SKILL.md`

The same skill package is duplicated for Codex, Claude, and Cursor:

- `.codex/skills/architecture/`
- `.claude/skills/architecture/`
- `.cursor/skills/architecture/`

When editing the skill or any reference file, sync the same change across the `.codex`, `.claude`, and `.cursor` copies in the same change.

## Product Direction

This app is the University Club Management System. Preserve the role model for Students, Club Executives, and University Administration. Build meaningful product behavior, not placeholder pages.

Work in vertical slices:

1. Backend model/service/controller/routes/validation.
2. Frontend shared types/data hooks/state/UI/page route.
3. Loading, empty, error, validation, confirmation, and success states.
4. Focused tests and `pnpm check`.

## Frontend Rules

- Use React, Vite, React Router, TanStack Query, Zustand, Ant Design, Tailwind CSS, and TypeScript.
- Use Ant Design for complex controls: forms, tables, modals, drawers, menus, tabs, date pickers, notifications, layout primitives, badges, cards, and inputs.
- Use Tailwind for page layout, spacing, responsive grids, state sections, and small composition utilities.
- Before designing or building a new frontend page, inspect the closest Stitch desktop and mobile screenshots listed in `docs/design/page-map.md`.
- For pages without exact Stitch coverage, derive the page from the closest existing reference and keep the same layout density, shell behavior, card/table patterns, and responsive rhythm.
- Keep route pages under `frontend/src/pages/<page-slice>/`.
- Keep server interactions in `data/use-*.ts`.
- Keep page UI state in `state/`.
- Keep presentational page pieces in `ui/`.
- Keep page-private workflows in `internal/`.
- Promote reusable controls to `components/utilities/` or `components/features/` only when reused.
- Use the theme tokens from `frontend/src/config/theme.ts`, `frontend/src/resource/styles/tokens.css`, and `frontend/tailwind.config.cjs`.
- Do not hard-code brand colors. Use Ant Design theme tokens or Tailwind token classes such as `bg-primary`, `bg-muted`, `text-text`, `text-text-soft`, and `border-border`.

## Backend Rules

- Use Express, MongoDB, Mongoose, Zod, TypeScript, and module-first folders.
- Keep route wiring in `*.routes.ts`.
- Keep HTTP translation in `*.controller.ts`.
- Keep business rules in `*.service.ts`.
- Keep persistence in `*.model.ts`.
- Keep validation at the route boundary using inline schemas or `*.validation.ts`.
- Register backend modules through `backend/src/http/routes.ts`.
- Use shared response helpers and the API contract in `docs/api-contract.md`.

## Gitkeep Rule

Use `.gitkeep` only for intentionally empty tracked directories. When adding a real tracked source, config, docs, asset, or test file to that directory, remove the directory's `.gitkeep` in the same change unless the real file is generated or ignored.

## Verification

After meaningful changes, run:

```bash
pnpm check
```

For frontend/backend build-impacting work, also run:

```bash
pnpm build
```

If a command cannot run, state why and what remains unverified.
