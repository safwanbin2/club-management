---
applyTo: 'frontend/**/*'
---

# Frontend Instructions

Follow `docs/agent-instructions.md`, `docs/ui-system.md`, `docs/design/stitch-source.md`, `docs/design/page-map.md`, `docs/design/implementation-notes.md`, and `.codex/skills/architecture/references/frontend-structure.md`.

- Use React, Vite, React Router, TanStack Query, Zustand, Ant Design, Tailwind CSS, and TypeScript.
- Use Ant Design for complex app controls and Tailwind for page layout/composition.
- Inspect the closest Stitch desktop and mobile screenshots under `docs/design/stitch-export/` before designing or implementing a page.
- Derive pages without exact Stitch coverage from `docs/design/page-map.md`.
- Keep pages in `frontend/src/pages/<page-slice>/`.
- Keep backend interactions in `data/use-*.ts`.
- Keep page UI state in `state/`.
- Keep presentational page pieces in `ui/`.
- Keep page-private workflows in `internal/`.
- Use shared theme tokens from `frontend/src/config/theme.ts`, `frontend/src/resource/styles/tokens.css`, and `frontend/tailwind.config.cjs`.
- Avoid placeholder pages; implement meaningful states and workflows.
- Remove `.gitkeep` when adding real files to a directory.
