# Page Slices

Each route-level feature should use the Bit CRM page-slice shape:

```text
<page-slice>/
├── index.ts
├── <page-slice>.tsx
├── data/
├── state/
├── shared/
├── internal/
└── ui/
```

Initial slices in this project are `auth`, `dashboard`, `clubs`, `feed`, and `events`. Add more slices as the product modules are implemented.
