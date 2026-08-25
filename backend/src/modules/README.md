# Backend Modules

Use one module folder per domain area. Each implemented module should keep route wiring, HTTP translation, business logic, persistence, and types separate.

```text
<module>/
├── <module>.controller.ts
├── <module>.model.ts
├── <module>.routes.ts
├── <module>.service.ts
├── <module>.types.ts
└── <module>.validation.ts
```

Initial domain folders match the product brief: `auth`, `user`, `club`, `feed`, `event`, `poll`, `chat`, `notification`, `resource-request`, and `search`.
