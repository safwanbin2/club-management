# Codex Project Instructions

This project is the University Club Management System described in `docs/university-club-management-system.md`.

Before planning or editing code in this repository, read that product brief and treat it as the canonical scope and behavior guide. If a task implements only part of the brief, make the slice explicit instead of quietly replacing the full product direction with a smaller assumption.

Use the local `bit-crm-mern-architecture` skill for architecture decisions. Keep the app organized as a production-quality MERN project with `frontend/` and `backend/` sibling folders, reusable UI, modular feature code, thin Express controllers, service-owned business logic, Mongoose models, and route/middleware wiring.

General expectations:

- Build meaningful functionality, not placeholder pages.
- Preserve role-aware behavior for Students, Club Executives, and University Administration.
- Keep authentication, authorization, dashboards, clubs, feed, events, attendance, polls, chat, notifications, profiles, badges, analytics, resources, and search aligned with the brief.
- Favor responsive, accessible, SaaS-style UI with loading, empty, error, validation, confirmation, pagination, filter, and toast states where appropriate.
- Keep code clean, modular, maintainable, and scalable.
