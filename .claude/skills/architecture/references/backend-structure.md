# Backend Structure

Use this reference when creating or reviewing the Node.js, Express, MongoDB, and Mongoose backend. The backend should borrow Bit CRM's high-level responsibility boundaries, not its PHP filesystem literally.

## Target Tree

Prefer a module-first backend:

```text
project-root/
└── backend/
    ├── package.json
    ├── src/
    │   ├── app.ts                     # express app setup
    │   ├── server.ts                  # process startup
    │   ├── config/
    │   │   ├── env.ts
    │   │   └── database.ts
    │   ├── constants/
    │   ├── db/
    │   │   ├── mongoose.ts
    │   │   ├── migrations/            # optional
    │   │   └── seeders/               # optional
    │   ├── http/
    │   │   ├── middleware/
    │   │   ├── responses/
    │   │   └── routes.ts              # root route registry
    │   ├── modules/
    │   │   └── contact/
    │   │       ├── contact.controller.ts
    │   │       ├── contact.model.ts
    │   │       ├── contact.routes.ts
    │   │       ├── contact.service.ts
    │   │       ├── contact.types.ts
    │   │       ├── contact.constants.ts
    │   │       └── utils/             # only if private to the module
    │   ├── services/                  # cross-module services only
    │   ├── utils/
    │   ├── helpers/
    │   └── types/
    └── tests/
```

If the target repo already uses layer-first folders, keep it consistent, but preserve the same boundaries: routes, controllers, services, models, middleware, constants, helpers, and utils. Add validators/schemas only where they reduce complexity.

## Bit CRM To Express Mapping

```text
backend/app/HTTP/Controllers/*  -> modules/<module>/*.controller.ts
backend/app/Services/*          -> modules/<module>/*.service.ts
backend/app/Model/*             -> modules/<module>/*.model.ts
backend/app/HTTP/Middleware/*   -> http/middleware/*
backend/app/Constants/*         -> constants/* or modules/<module>/*.constants.ts
backend/app/HTTP/Requests/*     -> route middleware, inline schemas, or optional *.validation.ts files
backend/app/Rules/*             -> schema refinements or shared validators only when needed
backend/app/Helpers|Utils/*     -> helpers/* and utils/*
backend/db/Migrations/*         -> db/migrations/* when migrations are needed
```

## Module Responsibilities

- `*.routes.ts`: declare paths, HTTP methods, middleware, and controller handlers. No business logic.
- `*.controller.ts`: translate HTTP to service calls. Read validated input, call the service, return response helpers. No Mongoose query building.
- `*.service.ts`: own business rules, transactions, permissions that are not pure route middleware, and orchestration across models/modules.
- `*.model.ts`: define Mongoose schemas, indexes, timestamps, soft-delete fields, statics/methods that are persistence-specific, and collection names.
- `*.types.ts`: payloads, response DTOs, domain types, and service input/output types.
- `*.validation.ts` or `*.validators.ts`: optional home for Zod/Joi/express-validator schemas when inline route validation becomes noisy or schemas are reused.
- `utils/` inside a module: pure helpers private to that module. Promote to root `utils/` only when shared.

## API Response Shape

Use a shared response helper so frontend hooks can stay predictable:

```ts
success(res, data, message?)
error(res, message, statusCode?)
validation(res, errors)
```

Recommended JSON shape:

```json
{
  "status": "success",
  "code": "SUCCESS",
  "data": {},
  "message": "Optional message"
}
```

For validation:

```json
{
  "status": "error",
  "code": "VALIDATION",
  "data": {
    "field": ["Message"]
  },
  "message": "Validation failed"
}
```

If the frontend table hooks mimic Bit CRM exactly, use pagination metadata compatible with those hooks:

```json
{
  "data": [],
  "total": 100,
  "per_page": 10,
  "current_page": 1,
  "current_total": 10,
  "last_page": 10,
  "pages": 10
}
```

If starting fresh, camelCase metadata is acceptable only when all frontend types and hooks use it consistently.

## Controller Pattern

```ts
export async function searchContacts(req: Request, res: Response) {
  const result = await contactService.search(req.validated)
  return success(res, result)
}
```

Controllers should be boring. Put try/catch in an async-handler middleware or centralized error middleware unless the endpoint has a specific recovery path.

## Input Validation

Validate external input at the route boundary, but choose the lightest structure that fits the endpoint. Do not scaffold a `requests/` folder by default.

Good options:

- Inline a tiny schema in `*.routes.ts` for simple endpoints.
- Use `*.validation.ts` for complex or reused schemas.
- Use a shared `validate(schema)` middleware if the project has one.

```ts
export const searchContactsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(10),
  searchTerm: z.string().trim().default(''),
  sortBy: z.string().trim().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  tags: z.array(z.string()).default([])
})
```

Rules:

- Validate before the controller calls the service.
- Coerce and normalize pagination, ObjectId strings, booleans, and arrays at the route/middleware edge.
- Keep permission checks in middleware when they are route-level. Keep domain-specific authorization in services.
- Let the target project's existing validation style win when one already exists.

## Service Pattern

Services are the backend equivalent of Bit CRM's `*Service.php` classes.

- Accept plain validated data, not `req` or `res`.
- Return plain data or throw typed application errors.
- Own transactions with `mongoose.startSession()` when multiple writes must succeed together.
- Keep reusable search/filter/pagination logic in private helpers or module utils.
- Emit app events only after successful writes when another module needs to react.

## Mongoose Model Pattern

Models should include:

- Schema fields, defaults, required flags, enums, refs, timestamps, and indexes.
- Soft-delete fields when the feature needs trash/recycle-bin behavior.
- Query helpers/statics only when they are persistence-specific and broadly reused.
- No Express response logic, route validation, or user-facing messages.

Prefer lean reads for list endpoints, explicit indexes for search/sort fields, and service-level DTO shaping when returning data to the frontend.

## Middleware And Cross-Cutting Concerns

- `auth` middleware replaces WordPress nonce/user checks.
- `requireCapability('contact:create')` or similar replaces Bit CRM capability checks.
- `validate(schema)` is optional route-bound input validation, not a PHP request-class replacement pattern to copy everywhere.
- `errorHandler` centralizes thrown application errors.
- `notFound` handles unknown routes.
- `requestLogger`/`auditLogger` should be middleware or events, not scattered through controllers.

## Backend Review Signals

- Adding a feature creates one module folder with controller, service, model, routes, and types; validation files are optional.
- Controllers stay thin enough to read in one glance.
- Services can be unit-tested without constructing Express objects.
- Mongoose sessions wrap multi-document writes.
- Search endpoints share pagination/sort/filter helpers rather than duplicating query parsing.
- Route registration is discoverable from `http/routes.ts`.
