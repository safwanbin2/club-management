# Development Setup

## Prerequisites

- Node.js 22 or newer
- pnpm
- A MongoDB connection URI

## Environment Files

Frontend:

```bash
cp frontend/.env.example frontend/.env.local
```

Backend:

```bash
cp backend/.env.example backend/.env
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API: `http://localhost:5000/api`
- MongoDB: configured by `backend/.env` as `MONGODB_URI`

## Commands

Install dependencies:

```bash
pnpm install
```

Set `MONGODB_URI` in `backend/.env` to the MongoDB URI for your environment.

The backend does not start or manage MongoDB. It only connects to the URI you provide.

Start both apps:

```bash
pnpm dev
```

Prepare database collections and demo data:

```bash
pnpm migrate
pnpm seed:demo
```

Quality checks:

```bash
pnpm ts-check
pnpm lint
pnpm format:check
pnpm test
```

Run everything expected before handoff:

```bash
pnpm check
```
