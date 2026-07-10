# GitHub Copilot Repository Instructions

This repository is the University Club Management System, a production-oriented MERN app.

Before making substantial suggestions or edits, follow `docs/agent-instructions.md` and the project docs it lists. Important files:

- `AGENTS.md`
- `docs/ai-workflow.md`
- `docs/university-club-management-system.md`
- `docs/roadmap.md`
- `docs/domain-model.md`
- `docs/api-contract.md`
- `docs/ui-system.md`
- `docs/design/stitch-source.md`
- `docs/design/page-map.md`
- `docs/design/implementation-notes.md`
- `docs/feature-slices.md`
- `docs/feature-status.md`
- `.codex/skills/architecture/SKILL.md`

Use the `architecture` skill rules:

- `frontend/` and `backend/` are sibling apps.
- Frontend page slices live under `frontend/src/pages/<page-slice>/`.
- Backend modules live under `backend/src/modules/<module>/`.
- Build one vertical slice at a time.
- Use Ant Design plus Tailwind, with shared theme tokens.
- Before frontend UI work, inspect the closest Stitch screenshots under `docs/design/stitch-export/`.
- Derive pages without exact Stitch coverage from `docs/design/page-map.md`.
- Do not hard-code brand colors.
- Remove `.gitkeep` when a directory receives real tracked files.

After meaningful changes, run `pnpm check`. For build-impacting work, also run `pnpm build`.
