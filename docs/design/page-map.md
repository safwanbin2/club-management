# Design Page Map

Use this map to choose the closest Stitch reference before building or redesigning a frontend page.

## Direct Matches

| App Area            | Expected Route Pattern               | Stitch Reference                                            |
| ------------------- | ------------------------------------ | ----------------------------------------------------------- |
| Login               | `/login`                             | `login_desktop`, `login_mobile`                             |
| Student Dashboard   | `/dashboard` or `/student/dashboard` | `student_dashboard_desktop`, `student_dashboard_mobile`     |
| Executive Dashboard | `/executive/dashboard`               | `executive_dashboard_desktop`, `executive_dashboard_mobile` |
| Admin Dashboard     | `/admin/dashboard`                   | `admin_dashboard_desktop`, `admin_dashboard_mobile`         |
| Club Directory      | `/clubs`                             | `club_directory_desktop`, `club_directory_mobile`           |
| Club Detail         | `/clubs/:clubId`                     | `club_detail_desktop`, `club_detail_mobile`                 |
| News Feed           | `/feed` or `/news-feed`              | `news_feed_desktop`, `news_feed_mobile`                     |
| Events List         | `/events`                            | `events_list_desktop`, `events_list_mobile`                 |

## Derive Missing Pages From Existing References

| Missing Or Future Page                    | Start From                           | Notes                                                                                       |
| ----------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| Register, forgot password, reset password | Login                                | Keep the split auth layout, restrained form density, maroon primary action, and slate copy. |
| Profile, account settings                 | Student Dashboard plus Club Detail   | Use the dashboard shell, compact cards, and detail-page section rhythm.                     |
| Notifications, global search results      | Dashboard references                 | Keep topbar/search behavior aligned with the shell and use compact list rows.               |
| Attendance, event check-in, QR flows      | Events List plus Executive Dashboard | Use event cards/tables and executive operational controls.                                  |
| Polls, voting, feedback                   | News Feed plus Events List           | Use feed cards for participation and table/list density for management views.               |
| Chat or announcements                     | News Feed                            | Use timeline/feed cards, clear author metadata, and compact input controls.                 |
| Resource booking or requests              | Events List plus Admin Dashboard     | Use filters, status badges, tables, and confirmation flows.                                 |
| Admin users, clubs, reports, approvals    | Admin Dashboard plus Club Directory  | Prefer table-first layouts with filters, status badges, row actions, and summary cards.     |
| Executive member management               | Executive Dashboard plus Club Detail | Use dense management cards and tables inside the club context.                              |

## Design Selection Rule

For a new page without an exact design, write down the closest Stitch reference in the implementation notes or PR summary. Then reuse that reference's layout pattern before creating a new one.
