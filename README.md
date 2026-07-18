# University Club Management System

A modern, production-oriented MERN application for managing university clubs, members, events, announcements, attendance, polls, resources, and role-based dashboards.

The project is designed for Students, Club Executives, and University Administration. It uses a modular full-stack structure, shared UI theming, and AI-ready project documentation so juniors and coding agents can build features as clean vertical slices.

## Tech Stack

| Area     | Tools                                                              |
| -------- | ------------------------------------------------------------------ |
| Frontend | React, Vite, TypeScript, React Router, TanStack Query, Zustand     |
| UI       | Ant Design, Tailwind CSS, lucide-react, shared design/theme tokens |
| Backend  | Node.js, Express, TypeScript, MongoDB, Mongoose, Zod               |
| Tooling  | pnpm workspace, ESLint, Prettier, Vitest                           |

## Project Structure

```text
.
├── frontend/        # Vite React app
├── backend/         # Express API server
├── docs/            # Product, API, UI, design, and AI workflow docs
├── pnpm-workspace.yaml
└── AGENTS.md        # Shared instructions for Codex-style agents
```

## Prerequisites

- Node.js 22 or newer
- pnpm
- A MongoDB connection URI

## Getting Started

Clone the repository and install dependencies from the project root:

```bash
pnpm install
```

Create local environment files:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Set `MONGODB_URI` in `backend/.env` to the MongoDB URI for your environment.

Start the frontend and backend together:

```bash
pnpm dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API base URL: `http://localhost:5000/api`
- MongoDB: configured by `backend/.env` as `MONGODB_URI`

The backend CORS policy is intentionally open for this university project: browser
requests from any origin are allowed and preflight requests are handled globally.
`FRONTEND_ORIGIN` is still used to generate attendance check-in links.

## Available Scripts

```bash
pnpm dev           # Start frontend and backend
pnpm dev:frontend  # Start only the frontend
pnpm dev:backend   # Start only the backend
pnpm migrate       # Create MongoDB collections and indexes
pnpm seed:demo     # Upsert demo users, clubs, events, activity, and requests
pnpm ts-check      # Run TypeScript checks
pnpm lint          # Run ESLint
pnpm format:check  # Check formatting
pnpm test          # Run frontend and backend tests
pnpm check         # Run the full quality gate
pnpm build         # Build frontend and backend
```

## Product Scope

The application includes role-aware workflows for:

- authentication and protected routes
- student, executive, and admin dashboards
- club browsing, club details, memberships, and executive management
- news feed, announcements, posts, likes, comments, and moderation
- events, registration, waitlists, QR attendance, and reports
- polls, notifications, group chat, badges, resources, analytics, and search

The full product brief lives in `docs/university-club-management-system.md`.

## Design And AI Workflow

This repository is set up for AI-assisted development. Before large feature work, read:

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
- `docs/feature-status.md`

The Stitch design export is stored in `docs/design/stitch-export/`. New frontend pages should follow the closest available Stitch screenshot and use Ant Design plus Tailwind with the shared project theme.

## AI Agent Integrations

This repo includes native instruction files for common coding assistants:

- Codex/OpenCode: `AGENTS.md`
- GitHub Copilot: `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`
- Cursor: `.cursor/rules/*.mdc`
- Claude: `CLAUDE.md`
- OpenCode extra context: `opencode.json`

All agents point back to the same shared project rules in `docs/agent-instructions.md`. The `architecture` skill is duplicated under `.codex/skills`, `.claude/skills`, and `.cursor/skills`; keep those copies synchronized whenever the skill changes.
