# Full-Stack Feature Blueprint

Use this reference when adding a feature/module to the MERN app.

## Scaffold Order

1. Define the domain shape: module name, routes, fields, permissions, list/detail/create/update/delete behavior, search/filter/sort needs, and relationships.
2. Confirm root `pnpm dev` runs both sibling apps, or add the root script from [project-setup.md](project-setup.md).
3. Create the backend model, service, controller, routes, and lightweight validation only where needed.
4. Register backend routes in the root route registry.
5. Create frontend shared types/constants/helpers for the page slice.
6. Create frontend `data/` hooks for list/detail/mutations.
7. Create frontend `state/` stores for selected IDs, table fields, modals, view mode, or canvas state.
8. Create frontend `ui/` components and `internal/` workflows.
9. Create the page shell and route entry.
10. Add route declarations, guards, query invalidation, and focused tests.

## Example: Contacts Feature

Frontend:

```text
frontend/src/pages/contacts/
├── index.ts
├── contacts.tsx
├── data/
│   ├── use-contacts.ts
│   ├── use-contact-fields.ts
│   ├── use-create-contact.ts
│   ├── use-update-contact.ts
│   └── use-delete-contacts.ts
├── state/
│   ├── use-contact-table-fields-store.ts
│   └── use-selected-contact-keys-store.ts
├── shared/
│   ├── constants.ts
│   ├── helpers.ts
│   └── types.ts
├── internal/
│   ├── contact-bulk-operations/
│   │   ├── index.ts
│   │   ├── data/
│   │   ├── state/
│   │   └── ui/
│   ├── import-contacts/
│   └── export-contacts/
└── ui/
    ├── contacts-columns.tsx
    ├── contacts-table.tsx
    └── delete-contact-popup.tsx
```

Backend:

```text
backend/src/modules/contact/
├── contact.constants.ts
├── contact.controller.ts
├── contact.model.ts
├── contact.routes.ts
├── contact.service.ts
├── contact.types.ts
└── utils/
    └── build-contact-search-query.ts
```

Add `contact.validation.ts` or route-level schemas only when endpoint validation is complex enough to justify it.

## Frontend Page Shell Pattern

The page shell should:

- Read URL state such as page, perPage, searchTerm, sortBy, sortOrder, filters, and tags.
- Build a typed query payload with `useMemo`.
- Debounce payloads that drive search/list requests.
- Call `data/` hooks.
- Initialize page stores from fetched fields/settings.
- Compose top toolbar, table/list/kanban, bulk operations, and pagination from `ui/` and `internal/`.

Keep field splitting, payload building, and orchestration in the page shell. Keep table row rendering and modal rendering out of the shell when they grow.

## Backend CRUD Pattern

For a standard module, create:

- `GET /contacts` or `POST /contacts/search` for paginated lists when filters are complex.
- `GET /contacts/:id` for detail.
- `POST /contacts` for create.
- `PATCH /contacts/:id` for update.
- `DELETE /contacts` for bulk delete/trash when list pages support multi-select.
- Optional nested routes for tags, import/export, related entities, or restore/trash behavior.

Keep the service API close to the business action:

```ts
contactService.search(payload)
contactService.store(payload, actor)
contactService.show(id, actor)
contactService.update(id, payload, actor)
contactService.trash(ids, actor)
```

## Query And State Coordination

- Query keys should mirror the feature: `['contacts', payload, filters]`, `['contact', id]`, `['contact-fields']`.
- Mutations should invalidate all affected list/detail/field keys.
- URL params own shareable list state. Zustand owns non-shareable UI state.
- Components should receive typed props rather than reaching into unrelated stores.

## Import, Export, And Bulk Operations

If a workflow is private to one page, place it under `internal/<workflow>/`.

```text
internal/contact-bulk-operations/
├── index.ts
├── data/
├── state/
└── ui/
```

Only promote it to `components/features/` if at least two page slices use the same workflow.

## Tests

- Backend: test service behavior, route integration, and validation for endpoints that have non-trivial validation.
- Frontend: test data hook adapters when response shapes are non-trivial, stores with complex transitions, and page workflows that combine URL state with query hooks.
- Keep tests near the module or in a parallel `tests/` tree, following the target repo's existing pattern.

## Final Review

- The frontend page slice is complete and uses the strict folder names.
- The backend module can be understood without jumping across unrelated feature folders.
- API response shape matches frontend hook expectations.
- Validation, authorization, and error handling are centralized enough to be reused.
- New shared code is promoted only when at least two modules need it.
