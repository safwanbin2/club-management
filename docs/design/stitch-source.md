# Stitch Source

The Stitch export has been copied into this repository so local and AI-assisted work can use it without depending on the external design platform.

## Original Source

- Stitch project: `https://stitch.withgoogle.com/projects/17140187676672735283`
- Local export path when imported: `/home/safwan/Downloads/stitch_university_club_manager`
- Repository copy: `docs/design/stitch-export/`
- Export size: about `9.1M`

## Export Contents

Each screen folder contains:

- `screen.png`: the visual reference to inspect first.
- `code.html`: generated Stitch HTML for structural clues only.

The shared Stitch design-system file is:

- `docs/design/stitch-export/academic_operations_system/DESIGN.md`

## Screen Inventory

| Screen              | Desktop Reference                                                  | Mobile Reference                                                  |
| ------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Login               | `docs/design/stitch-export/login_desktop/screen.png`               | `docs/design/stitch-export/login_mobile/screen.png`               |
| Student Dashboard   | `docs/design/stitch-export/student_dashboard_desktop/screen.png`   | `docs/design/stitch-export/student_dashboard_mobile/screen.png`   |
| Executive Dashboard | `docs/design/stitch-export/executive_dashboard_desktop/screen.png` | `docs/design/stitch-export/executive_dashboard_mobile/screen.png` |
| Admin Dashboard     | `docs/design/stitch-export/admin_dashboard_desktop/screen.png`     | `docs/design/stitch-export/admin_dashboard_mobile/screen.png`     |
| Club Directory      | `docs/design/stitch-export/club_directory_desktop/screen.png`      | `docs/design/stitch-export/club_directory_mobile/screen.png`      |
| Club Detail         | `docs/design/stitch-export/club_detail_desktop/screen.png`         | `docs/design/stitch-export/club_detail_mobile/screen.png`         |
| News Feed           | `docs/design/stitch-export/news_feed_desktop/screen.png`           | `docs/design/stitch-export/news_feed_mobile/screen.png`           |
| Events List         | `docs/design/stitch-export/events_list_desktop/screen.png`         | `docs/design/stitch-export/events_list_mobile/screen.png`         |

Desktop screenshots are mostly `1600 x 1280`. Mobile screenshots are mostly `487 x 1105`, with login mobile at `706 x 1600`.

## Priority

When references disagree, use this priority:

1. Explicit user/project theme choices in `docs/ui-system.md`.
2. Stitch screenshots.
3. Stitch `DESIGN.md`.
4. Stitch `code.html`.

The Stitch frontmatter includes some pink-tinted surface tokens. The project choice is stricter: main background is white, secondary background is soft off-white, text is slate-grey, and primary action color is `#6a0032`.
