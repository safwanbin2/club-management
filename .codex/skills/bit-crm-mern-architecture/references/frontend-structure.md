# Frontend Structure

Use this reference when creating, moving, or reviewing React code in a standalone app that should feel like Bit CRM.

## Target Tree

```text
project-root/
└── frontend/
    ├── package.json
    ├── public/
    ├── language/                     # only if the new app has localization files
    └── src/
        ├── AppRoutes.tsx             # route declarations and route-level guards
        ├── common/
        │   ├── constants/
        │   ├── context/
        │   ├── globalStates/         # cross-app atoms/stores only
        │   ├── helpers/              # request, formatting, capability, i18n helpers
        │   ├── hooks/                # reusable hooks not owned by one feature
        │   ├── icons/
        │   └── types/
        ├── components/
        │   ├── features/             # reusable domain features used by multiple pages
        │   └── utilities/            # generic UI utilities and primitives
        ├── config/
        ├── icons/
        ├── pages/
        │   └── <page-slice>/
        │       ├── index.ts
        │       ├── <page-slice>.tsx
        │       ├── data/
        │       ├── state/
        │       ├── shared/
        │       ├── internal/
        │       └── ui/
        └── resource/
            ├── img/
            └── styles/
```

Keep this shape even when a slice starts small. Empty folders are not required, but new code should go into the correct slice folder as soon as that concern exists.

## Page Slice Rules

- `index.ts`: export the route entry. For a normal page use `export { default } from './contacts'`. If the app later has variants, keep the switch/barrel here.
- `<page-slice>.tsx`: compose the page, URL/search params, layout, top-level permissions, and feature sections. Keep it readable by pushing table/forms/modals into `ui/` or `internal/`.
- `data/`: TanStack Query hooks and API mutation hooks owned by this page or feature.
- `state/`: Zustand stores owned by this page. Export selectors such as `useContactTableFieldList()` and `useContactTableFieldActions()`.
- `shared/`: types, constants, options, and pure helpers shared by `data`, `state`, `internal`, and `ui`.
- `internal/`: page-private feature parts such as import/export flows, bulk operations, kanban internals, complex form sections, and nested state/data folders.
- `ui/`: presentational page components such as tables, columns, cards, toolbars, and modals that are not broadly reusable outside the slice.

Do not put page-specific internals into global `components/`. Promote to `components/features/` only when multiple page slices use it.

## Shared Component Placement

- `components/features/<feature>/`: reusable domain workflows, for example advanced filters, attachments, notes, timeline, or table features.
- `components/utilities/<utility>/`: generic UI utilities such as pagination, dropdowns, skeletons, sortable wrappers, search input, guards, and loaders.
- `common/hooks/`: generic hooks such as debounce, throttle, click-outside, interval, or shared entity lookup hooks.
- `common/helpers/`: request client, capability helpers, formatters, i18n wrappers, and data transformation helpers.
- `common/globalStates/`: truly global navigation/config/session/theme state. Prefer slice-local `state/` for feature state.

## Data Hooks

Use a `data/use-*.ts` hook for every backend interaction.

```ts
export default function useContacts(payload: ContactsPayload, filters: FilterCondition[][]) {
  const query = useQuery({
    enabled: canViewContacts,
    placeholderData: keepPreviousData,
    queryFn: ({ signal }) =>
      request<ContactListResponse>('contacts/search', { ...payload, filters }, undefined, 'POST', { signal }),
    queryKey: ['contacts', payload, filters],
    retry: false,
    select: response => response.data
  })

  return {
    contacts: query.data?.data || [],
    isContactsFetching: query.isFetching,
    isContactsPending: query.isPending,
    refetchContacts: query.refetch,
    totalContacts: query.data?.total || 0
  }
}
```

Conventions:

- Keep fetch/mutation code out of components unless the component is itself a tiny hook wrapper.
- Use stable query keys: `['contacts', payload, filters]`, `['contact', id]`.
- Return domain-specific names, not only raw query objects.
- Use mutation hooks like `use-create-contact.ts`, `use-update-contact.ts`, `use-delete-contacts.ts`.
- Invalidate or update related query keys inside mutation hooks.
- Keep response parsing centralized through `common/helpers/request`.

## Zustand State

Use small stores per feature concern.

```ts
const useContactTableFieldsStore = create<FieldStore>(set => ({
  actions: {
    setFieldList: updater =>
      set(state => ({
        fieldList: typeof updater === 'function' ? updater(state.fieldList) : updater
      }))
  },
  fieldList: [],
  orders: []
}))

export const useContactTableFieldList = () => useContactTableFieldsStore(state => state.fieldList)
export const useContactTableFieldActions = () => useContactTableFieldsStore(state => state.actions)
```

Conventions:

- Put mutators inside an `actions` object.
- Export narrow selectors. Avoid exporting the raw store as the primary API.
- Keep server data in React Query; use Zustand for selected IDs, table preferences, open modal state, drag/drop state, canvas state, and other UI state.
- Split stores by concern rather than creating a single page mega-store.

## Routing

- Lazy-load pages from `@pages/<page-slice>`.
- Put route guards in `AppRoutes.tsx` or a guard utility, not inside every page.
- Use plural page slices for lists (`contacts`, `deals`) and singular slices for details/create/settings when the app has those separate routes (`contact`, `contact-create`, `contact-settings`).
- Keep URL-derived state (`page`, `perPage`, `searchTerm`, `sortBy`, `sortOrder`, filters) in the page shell and pass typed payloads into data hooks.

## Aliases

Use path aliases that mirror Bit CRM when possible:

```text
@common/*      -> frontend/src/common/*
@features/*    -> frontend/src/components/features/*
@utilities/*   -> frontend/src/components/utilities/*
@components/*  -> frontend/src/components/*
@icons/*       -> frontend/src/icons/*
@resource/*    -> frontend/src/resource/*
@pages/*       -> frontend/src/pages/*
@config/*      -> frontend/src/config/*
@/*            -> frontend/src/*
```

If the project is JavaScript-only, configure the same aliases in Vite/jsconfig.

## Frontend Review Signals

- A route page imports `./data/*`, `./state/*`, `./internal/*`, and `./ui/*` from its own slice.
- A reusable workflow imported by multiple pages lives under `components/features/`.
- A generic control imported across many places lives under `components/utilities/`.
- No page-specific modal/table/bulk-operation component is stranded in global components.
- New files are named consistently with nearby Bit CRM-style files.
