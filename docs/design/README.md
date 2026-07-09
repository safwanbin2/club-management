# Design Reference

This directory contains the project design source for the University Club Management System.

## Read Order

Before designing or implementing a new frontend page, read these files:

1. `docs/design/stitch-source.md`
2. `docs/design/page-map.md`
3. `docs/design/implementation-notes.md`
4. The closest matching screenshots under `docs/design/stitch-export/`

Use `docs/ui-system.md` for the theme tokens and component system. Use the Stitch screenshots for layout, density, visual rhythm, and page composition.

## Source Of Truth

- Screenshots in `docs/design/stitch-export/*/screen.png` are the visual reference.
- `docs/design/stitch-export/academic_operations_system/DESIGN.md` is the design-system reference.
- `code.html` files are reference material only. Do not paste generated HTML into React pages.
- If a page does not have an exact Stitch design, derive it from the closest existing page listed in `docs/design/page-map.md`.

## Implementation Rule

New UI must feel like the Stitch reference before it feels like a generic Ant Design screen. Keep the existing project stack: Ant Design for controls, Tailwind for layout, and shared tokens from `docs/ui-system.md`.
