# UI System

The UI should feel like a polished SaaS product for university club operations: dense enough for repeated work, but friendly enough for students.

## Tooling Decision

Use Ant Design and Tailwind CSS together. Ant Design should provide production-ready controls such as forms, tables, modals, drawers, date pickers, menus, tabs, notifications, and layout primitives. Tailwind should handle page composition, spacing, responsive layout, and small custom utilities.

Use:

- Ant Design for complex interactive components.
- Tailwind CSS for layout and utility styling.
- CSS variables for theme tokens.
- Ant Design `ConfigProvider` for automatic component theming.
- `class-variance-authority`, `clsx`, and `tailwind-merge` for component variants.
- `lucide-react` for icons.
- Custom components only when Ant Design does not provide a good fit or when the component is project-specific.

## Visual Direction

- Calm operational layout with sidebar navigation and top bar.
- Use `#6a0032` as the primary brand and action color.
- Use white as the main application background.
- Use a softer secondary background for app chrome, muted sections, table headers, filters, and empty states.
- Text should be slate-grey rather than complete black.
- Accent colors should cover multiple families, not one dominant hue. Use green for success, amber for attention, red for destructive actions, blue for informational states, and violet only as a secondary accent.
- Cards should use `8px` radius or less.
- Avoid decorative gradient blobs and oversized marketing-style hero layouts inside the app.

## Stitch Design Reference

Use the Stitch export in `docs/design/stitch-export/` as the project visual reference before designing new UI. Read:

- `docs/design/stitch-source.md`
- `docs/design/page-map.md`
- `docs/design/implementation-notes.md`

Then inspect the closest desktop and mobile screenshots for the page being built. If there is no exact screen, derive the new page from the closest existing reference in `docs/design/page-map.md`.

The screenshots define layout, density, component rhythm, and responsive behavior. The generated `code.html` files are structural references only; rebuild pages with React, Ant Design, Tailwind, and the architecture skill folder rules.

## Color Tokens

Use these as the default light theme:

- Primary: `#6a0032`
- Primary hover: `#560029`
- Primary soft: `#f7e9f0`
- Background: `#ffffff`
- Secondary background: `#f7f8fa`
- Surface: `#ffffff`
- Border: `#e4e7ec`
- Main text: `#26313f`
- Soft text: `#667085`
- Muted text: `#98a2b3`
- Success: `#16803c`
- Warning: `#b76e00`
- Danger: `#c52222`
- Info: `#2563eb`
- Achievement: `#7c3aed`

Primary buttons, active navigation items, focused controls, and important selected states should use the primary maroon. Do not use pure black text in the app UI; use the slate text tokens unless a specific asset or logo requires otherwise.

## Ant Design And Tailwind Theming

All Ant Design components must be rendered under the app-level `ConfigProvider` in `frontend/src/common/context/app-providers.tsx`. The Ant Design theme lives in `frontend/src/config/theme.ts`.

Use Ant Design components directly when they fit the workflow:

- `Button`, `Form`, `Input`, `Select`, `Table`, `Modal`, `Drawer`, `Tabs`, `Menu`, `Dropdown`, `DatePicker`, `Tag`, `Badge`, `Avatar`, `Card`, `App`, and `notification`.

Use Tailwind classes for app layout and composition:

- page shells
- grids
- spacing
- responsive behavior
- custom empty/loading/error sections
- one-off layout wrappers around Ant Design controls

Tailwind classes should use the shared tokens:

- `bg-canvas`
- `bg-muted`
- `bg-surface`
- `text-text`
- `text-text-soft`
- `text-text-muted`
- `border-border`
- `bg-primary`
- `hover:bg-primary-hover`
- `bg-primary-soft`

Do not hard-code `#6a0032` throughout components. Use Ant Design tokens or Tailwind token classes so future brand changes happen in one place.

## Layout Rules

- App shell owns sidebar, top navigation, user menu, notifications, and global search.
- Page shells own URL state, permissions, data hooks, and composition.
- Presentational sections live in page `ui/`.
- Reusable controls live in `components/utilities/`.
- Reusable domain workflows used by multiple pages live in `components/features/`.

## Expected States

Every meaningful workflow should handle:

- loading
- empty
- error
- validation
- optimistic or pending mutation state
- confirmation before destructive actions
- toast or inline success feedback

## Accessibility

- Use semantic buttons and links.
- Inputs need labels and error text.
- Icon-only buttons need accessible names and tooltips when the meaning is not obvious.
- Preserve keyboard navigation and visible focus states.
- Keep color contrast readable in light and dark modes.
