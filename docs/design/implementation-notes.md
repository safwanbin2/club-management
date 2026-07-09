# Design Implementation Notes

Use this file when translating the Stitch reference into React, Ant Design, and Tailwind.

## Required Workflow

1. Pick the closest screen from `docs/design/page-map.md`.
2. Inspect both desktop and mobile `screen.png` references for that screen.
3. Check `docs/design/stitch-export/academic_operations_system/DESIGN.md` for spacing, radius, typography, and component behavior.
4. Implement with Ant Design components, Tailwind layout utilities, and shared project tokens.
5. Keep the result visually aligned with the screenshots before adding extra polish.

## Do Not Copy Generated HTML

The `code.html` files are useful for reading hierarchy, spacing intent, icon choices, and responsive behavior. Do not paste them into React components. Rebuild the page using project structure:

- page shell in `frontend/src/pages/<page-slice>/<page-slice>.tsx`
- presentational pieces in `frontend/src/pages/<page-slice>/ui/`
- page-private workflows in `frontend/src/pages/<page-slice>/internal/`
- data hooks in `frontend/src/pages/<page-slice>/data/`
- shared constants/types/helpers in `frontend/src/pages/<page-slice>/shared/`

## Visual System

- Use a fixed or persistent desktop sidebar around `260px` wide.
- Use a topbar around `64px` high for search, notifications, and user controls.
- Use `24px` page padding on desktop and reduce spacing on tablet/mobile.
- Keep the UI operational and dense, not marketing-like.
- Use cards with `1px` borders, subtle shadows, and `8px` radius or less.
- Use active nav styling with maroon text, a soft maroon background, and a left accent bar.
- Prefer table/list patterns for admin and executive workflows.
- Prefer feed-card patterns for news, announcements, polls, and discussion-like workflows.
- Use hover states, loading skeletons, empty states, errors, validation, confirmations, and success feedback.

## Token Mapping

Use the project theme from `docs/ui-system.md`:

- Primary/action: `#6a0032`
- Main background: `#ffffff`
- Secondary background: soft off-white from the app tokens
- Main text: slate-grey, not pure black
- Borders: light grey

Use Tailwind token classes such as `bg-canvas`, `bg-muted`, `bg-surface`, `text-text`, `text-text-soft`, `text-text-muted`, `border-border`, `bg-primary`, `hover:bg-primary-hover`, and `bg-primary-soft`.

Use Ant Design under `ConfigProvider` so controls inherit the theme automatically. Do not scatter raw brand colors through page components.

## Asset Rule

The screenshots are local and reliable. Generated HTML may reference remote image URLs from Stitch; do not depend on those remote URLs for production UI. Use real project assets, generated/local placeholders, or domain data images when building the app.
