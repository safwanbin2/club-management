# Project Setup

Use this reference when creating or reviewing the root project layout, package scripts, and local development workflow.

## Required Root Layout

Keep frontend and backend as sibling folders at the same level:

```text
project-root/
├── package.json
├── pnpm-workspace.yaml          # recommended when using pnpm workspaces
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
└── backend/
    ├── package.json
    └── src/
```

Do not nest the backend inside `frontend/`, or the frontend inside `backend/`. The root is only for orchestration, shared tooling, workspace config, docs, and repo-level scripts.

## Root Dev Command

Running this from the project root must start both apps:

```bash
pnpm dev
```

Prefer a pnpm workspace plus `concurrently`:

```yaml
# pnpm-workspace.yaml
packages:
  - frontend
  - backend
```

```json
{
  "private": true,
  "scripts": {
    "dev": "concurrently -n frontend,backend -c cyan,green \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

For this to work, set package names predictably:

```json
// frontend/package.json
{ "name": "frontend" }
```

```json
// backend/package.json
{ "name": "backend" }
```

If the project is not using workspaces, the root script can use `--dir` instead:

```json
{
  "scripts": {
    "dev": "concurrently -n frontend,backend -c cyan,green \"pnpm --dir frontend dev\" \"pnpm --dir backend dev\""
  }
}
```

## App-Level Dev Scripts

Frontend usually runs Vite:

```json
{
  "scripts": {
    "dev": "vite"
  }
}
```

Backend should run the Express server in watch mode. Pick the watcher already used by the project; for a new TypeScript backend, `tsx` is a clean default:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

For JavaScript, use Node watch mode or nodemon:

```json
{
  "scripts": {
    "dev": "node --watch src/server.js"
  }
}
```

## Local Ports And API Connection

- Keep frontend and backend ports explicit, for example frontend `5173` and backend `5000`.
- Store backend API URL in frontend env, for example `frontend/.env.local` with `VITE_API_URL=http://localhost:5000/api`.
- Enable CORS in backend development for the frontend origin.
- Keep `.env` files app-local: `frontend/.env.local` for Vite values and `backend/.env` for server secrets like `MONGODB_URI`.

## Review Signals

- `pnpm dev` from the root starts both apps.
- `frontend/` and `backend/` each keep their own package scripts and dependencies.
- Root `package.json` does not become an application runtime; it orchestrates the sibling apps.
- Frontend API helpers read one configured backend base URL.
- Backend CORS, env loading, and database connection live in backend config/bootstrap files.
