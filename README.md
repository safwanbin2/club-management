# University Club Management System

This repository is scaffolded as a production-oriented MERN application for the product brief in `docs/university-club-management-system.md`.

## Structure

```text
.
├── frontend/   # Vite, React, React Router, TanStack Query, Zustand
├── backend/    # Express, MongoDB, Mongoose
├── docs/       # Product and project documentation
└── AGENTS.md   # Project instructions for Codex-style agents
```

## Local Development

Install dependencies from the root, then start both apps:

```bash
pnpm install
pnpm db:up
pnpm dev
```

The frontend is configured for `http://localhost:5173` and the backend for `http://localhost:5000`.

## Project Context

Read these docs before large feature work:

- `docs/agent-instructions.md`
- `docs/ai-workflow.md`
- `docs/roadmap.md`
- `docs/domain-model.md`
- `docs/api-contract.md`
- `docs/ui-system.md`
- `docs/design/stitch-source.md`
- `docs/design/page-map.md`
- `docs/design/implementation-notes.md`
- `docs/feature-slices.md`
- `docs/demo-data.md`

See `docs/development.md` for local setup and quality commands.

## AI Agent Integrations

This repo includes native instruction files for common coding assistants:

- Codex/OpenCode: `AGENTS.md`
- GitHub Copilot: `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`
- Cursor: `.cursor/rules/*.mdc`
- Claude: `CLAUDE.md`
- OpenCode extra context: `opencode.json`

All of them point back to the same shared project rules in `docs/agent-instructions.md`.
The `architecture` skill is duplicated under `.codex/skills`, `.claude/skills`, and `.cursor/skills`; keep those copies synchronized whenever the skill changes.
