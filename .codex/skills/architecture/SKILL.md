---
name: architecture
description: >
  Build and maintain standalone React, Node.js, Express, and MongoDB/Mongoose applications using Bit CRM's strict frontend folder structure and an Express-native backend adapted from Bit CRM's controller, service, model, route, and middleware boundaries. Use when scaffolding a MERN app outside WordPress, adding a feature/module, reviewing code organization, deciding where components/hooks/state/services/models/routes belong, or translating Bit CRM conventions into a React/Express/Mongoose project.
---

# Architecture

## Core Rule

Follow Bit CRM's frontend structure strictly. Keep `frontend/` and `backend/` as sibling folders at the project root, with root-level scripts that can run both apps together. Adapt the backend only partially to a module-first Express/Mongoose shape: keep thin controllers, services for business logic, models for persistence, routes for wiring, and middleware for cross-cutting concerns. Do not force PHP-style request classes or request folders into the Node backend.

## Start Here

1. Inspect the target repo before editing: package manager, TypeScript/JavaScript choice, aliases, router, state libraries, validation library, scripts, and current folders.
2. For project root layout and `pnpm dev`, read [references/project-setup.md](references/project-setup.md).
3. For frontend work, read [references/frontend-structure.md](references/frontend-structure.md).
4. For frontend UI/page design in this repo, read `docs/design/stitch-source.md`, `docs/design/page-map.md`, `docs/design/implementation-notes.md`, and the closest screenshots under `docs/design/stitch-export/`.
5. For backend/API/database work, read [references/backend-structure.md](references/backend-structure.md).
6. For new full-stack features, read [references/feature-blueprint.md](references/feature-blueprint.md) after the relevant setup/frontend/backend reference.

## Default Stack

- Root project: `frontend/` and `backend/` folders at the same level; root `pnpm dev` runs both frontend and backend concurrently.
- Frontend: React, Vite, React Router, TanStack Query, Zustand, and a shared request helper. Use TypeScript when starting fresh; if the target project is plain JavaScript, keep the same folder and naming conventions with `.js`/`.jsx`.
- Backend: Node.js, Express, MongoDB, Mongoose, centralized env/config, async error handling, shared response helpers, and lightweight input validation only where endpoints need it.
- Do not copy WordPress-only mechanics into the new app. Replace WordPress nonce, capability, hooks, and i18n patterns with app auth/RBAC middleware, app events where needed, and normal web/API concerns.

## Naming And Placement

- Use kebab-case file and folder names: `use-contact-fields.ts`, `contacts-table.tsx`, `contact.service.ts`.
- Use PascalCase for React components and types/classes: `ContactsTable`, `ContactService`.
- Use `use-*` files and `useX` exports for hooks. Use `use-*-store` for Zustand stores.
- Keep server state in `data/` hooks, feature UI state in `state/`, shared feature contracts in `shared/`, feature-private implementation in `internal/`, and presentational page pieces in `ui/`.
- Keep Express route wiring in `*.routes`, HTTP translation in `*.controller`, business rules in `*.service`, and persistence in `*.model`. Put validation in route middleware, inline schemas, or an optional `*.validation.ts` file only when useful.
- Use `.gitkeep` only for intentionally empty directories that need to be tracked. When adding a real tracked source, config, docs, asset, or test file to that directory, remove the directory's `.gitkeep` in the same change unless the real file is generated, ignored, or otherwise not expected to be tracked.

## Review Checklist

- Frontend list/detail/create/settings pages follow the Bit CRM page-slice layout.
- New frontend UI follows the closest Stitch design reference, or documents which reference was used for a missing page.
- No page-level API calls live directly inside JSX-heavy components when a `data/use-*` hook should own them.
- Zustand stores expose selectors/actions instead of leaking a large raw store through the app.
- Backend controllers do not contain Mongoose query logic or business transactions.
- External input is normalized before service logic when needed, and services can be tested without `req`/`res`.
- API responses are consistent enough that frontend React Query hooks do not reimplement response parsing per feature.
- `.gitkeep` files are not left beside real tracked files in the same directory.
