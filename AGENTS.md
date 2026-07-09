# Codex Project Instructions

This project is the University Club Management System described in `docs/university-club-management-system.md`.

Before planning or editing code in this repository, read the project context in this order:

1. `docs/ai-workflow.md`
2. `docs/university-club-management-system.md`
3. `docs/roadmap.md`
4. `docs/domain-model.md`
5. `docs/api-contract.md`
6. `docs/ui-system.md`
7. `docs/design/stitch-source.md`
8. `docs/design/page-map.md`
9. `docs/design/implementation-notes.md`
10. `docs/feature-slices.md` for feature work

Treat the product brief as the canonical scope and behavior guide. If a task implements only part of the brief, make the slice explicit instead of quietly replacing the full product direction with a smaller assumption.

Use the local `architecture` skill for architecture decisions. Keep the app organized as a production-quality MERN project with `frontend/` and `backend/` sibling folders, reusable UI, modular feature code, thin Express controllers, service-owned business logic, Mongoose models, and route/middleware wiring.

General expectations:

- Build meaningful functionality, not placeholder pages.
- Preserve role-aware behavior for Students, Club Executives, and University Administration.
- Keep authentication, authorization, dashboards, clubs, feed, events, attendance, polls, chat, notifications, profiles, badges, analytics, resources, and search aligned with the brief.
- Before designing or building frontend UI, inspect the closest Stitch screenshots under `docs/design/stitch-export/` and follow the reference map in `docs/design/page-map.md`.
- Favor responsive, accessible, SaaS-style UI with loading, empty, error, validation, confirmation, pagination, filter, and toast states where appropriate.
- Keep code clean, modular, maintainable, and scalable.
- Update project docs when implementation decisions change future work.
- Run `pnpm ts-check`, `pnpm lint`, and focused tests after meaningful changes when dependencies are installed.
