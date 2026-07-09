# Development Setup

## Prerequisites

- Node.js 22 or newer
- pnpm
- Docker, or a local MongoDB instance

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
- MongoDB: `mongodb://127.0.0.1:27017/university-club-management`

## Commands

Install dependencies:

```bash
pnpm install
```

Start MongoDB with Docker:

```bash
pnpm db:up
```

Start both apps:

```bash
pnpm dev
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
