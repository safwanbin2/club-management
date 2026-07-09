---
applyTo: 'backend/**/*'
---

# Backend Instructions

Follow `docs/agent-instructions.md`, `docs/api-contract.md`, and `.codex/skills/architecture/references/backend-structure.md`.

- Use Express, MongoDB, Mongoose, Zod, and TypeScript.
- Keep route wiring in `*.routes.ts`.
- Keep HTTP translation in `*.controller.ts`.
- Keep business rules in `*.service.ts`.
- Keep persistence in `*.model.ts`.
- Keep route-bound validation inline or in `*.validation.ts` when reused or complex.
- Register routes from `backend/src/http/routes.ts`.
- Use shared response helpers and the API response shape from `docs/api-contract.md`.
- Remove `.gitkeep` when adding real files to a directory.
