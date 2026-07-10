# Feature Status

Last verified: July 10, 2026.

Use this file as the handoff ledger for future agents. It tracks what is complete, what is only partially built, and what should be built next. The source of truth for product behavior remains `docs/university-club-management-system.md`; the build order comes from `docs/feature-slices.md`.

## Status Convention

| Status      | Meaning                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Complete    | A usable vertical slice exists across backend, frontend, validation, authorization, and verification. |
| Partial     | Some foundation exists, but user-facing workflow, API behavior, permissions, or tests are missing.    |
| Not Started | No meaningful integrated backend and frontend workflow exists yet.                                    |
| Blocked     | Work cannot proceed without a missing decision, dependency, credential, or external service.          |

Do not mark a slice `Complete` because only models, pages, or mock data exist. Complete means the slice can be demonstrated through the app and has passed the relevant checks.

## Current Build Pointer

The next recommended slice is **Slice 3: Central News Feed**.

Why:

- Slice 2 now provides real club directory, detail, membership request, leave, and executive review workflows.
- Feed creation, moderation, events, polls, chat, and attendance can now depend on club membership status and club-scoped executive authorization.
- Existing Stitch references directly cover the News Feed screen.

## Priority Queue

| Priority | Slice                                      | Status      | Next Action                                                           |
| -------- | ------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| P0       | Project foundation and database foundation | Complete    | Keep docs and migrations current as new entities/rules are added.     |
| P1       | Auth and role-aware app shell              | Complete    | Add production email delivery later; do not block feature work on it. |
| P2       | Clubs and membership                       | Complete    | Expand admin club management later; core slice is demonstrable.       |
| P3       | Central news feed                          | Not Started | Build feed APIs, frontend page, likes/comments, and moderation.       |
| P4       | Events and waitlists                       | Not Started | Build after clubs and memberships are functional.                     |
| P5       | Attendance                                 | Not Started | Build after event registration exists.                                |
| P6       | Polls                                      | Not Started | Build after club membership permission checks are reliable.           |
| P7       | Notifications, badges, profile, settings   | Not Started | Build once core activity events can create notifications and badges.  |
| P8       | Resource requests and admin analytics      | Not Started | Build after admin and executive club context is stable.               |
| P9       | Club chat                                  | Not Started | Build after membership-gated club access exists.                      |
| P10      | Global search                              | Not Started | Build once searchable modules have real APIs and data shapes.         |

## Completed Work

### Project Foundation And Database Foundation

Status: `Complete`

Evidence:

- Docker has been removed from the project workflow.
- MongoDB is configured through `MONGODB_URI`.
- Database migration runner exists.
- Initial migration creates core collections and indexes.
- Demo seed exists for users, clubs, memberships, events, activity, and requests.
- Real Mongoose models exist for:
  - users
  - auth sessions
  - clubs
  - memberships
  - posts
  - comments
  - events
  - event registrations
  - attendance
  - polls
  - poll votes
  - chat messages
  - notifications
  - badges
  - resource requests
- Capability registry and authorization middleware foundation exist.

Verification:

- Migration was applied successfully to the configured MongoDB database.
- Demo seed was applied successfully.
- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed.
- `pnpm format:check` passed.

### Slice 1: Auth And Role-Aware App Shell

Status: `Complete`

Implemented:

- Backend auth routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
- Password hashing.
- Access token and refresh/session persistence.
- Auth middleware.
- Role and capability foundation.
- Frontend auth pages:
  - login
  - register
  - forgot password
  - reset password
- Protected and guest route guards.
- Auth bootstrap on app load.
- Role-aware app shell.
- Role-aware dashboard summary route and dashboard page.

Known follow-up:

- Password reset currently has the application-level flow, but production email delivery is not integrated.
- Auth can be hardened later with stricter session rotation, device management, and audit history.

Verification:

- Student, Club Executive, and University Admin demo users can log in.
- `/api/dashboard/summary` returns role-aware data for all three roles.
- Standard quality checks passed.

### Slice 2: Clubs And Membership

Status: `Complete`

Implemented:

- Backend club routes:
  - `GET /api/clubs`
  - `GET /api/clubs/:clubId`
  - `POST /api/clubs/:clubId/memberships/request`
  - `POST /api/clubs/:clubId/memberships/leave`
  - `GET /api/clubs/:clubId/memberships/requests`
  - `PATCH /api/clubs/:clubId/memberships/requests/:membershipId`
- Club list search, category/status filters, membership filters, pagination, and sorting.
- Club detail with membership summary, current-user membership status, executive committee, and upcoming event previews.
- Student membership request and leave/cancel flows.
- Executive/admin pending request review with approve/reject actions.
- Club-scoped executive authorization in the service layer.
- Validation schemas for list/detail/request-review inputs.
- Frontend `/clubs` directory page with search, filters, pagination, loading, empty, error, toast, and membership status states.
- Frontend `/clubs/:clubId` detail page with membership actions, executive committee, upcoming events, contact context, and executive request queue.
- Club Directory navigation is enabled in the role-aware app shell.

Known follow-up:

- Admin create/disable club management remains a later administration expansion, not part of the Slice 2 student/executive membership acceptance.
- Demo seed clubs currently rely on generated category visuals when no club cover/logo URL exists.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed.
- `pnpm format:check` still reports a pre-existing formatting issue in `backend/tests/README.md`, which was not touched by this slice.

## Partial Work

### Dashboard Details And Analytics

Status: `Partial`

Implemented:

- Backend dashboard summary service aggregates real database data.
- Frontend dashboard displays role-aware metric cards and panels.

Missing:

- Full Student dashboard sections for joined clubs, upcoming events, notifications, attendance summary, recent activity, and badges.
- Full Club Executive dashboard sections for pending requests, attendance charts, poll statistics, engagement metrics, and management shortcuts.
- Full University Admin dashboard sections for active clubs, monthly participation, funding requests, room bookings, and reports.
- Chart visualizations and deeper drill-down pages.

Recommended timing:

- Continue expanding dashboard details after the related domain slice exists. For example, membership widgets after Slice 2, event widgets after Slice 4, and resource widgets after Slice 8.

### Authorization And Permissions

Status: `Partial`

Implemented:

- Role constants.
- Capability registry.
- Authentication middleware.
- Broad capability middleware foundation.

Missing:

- Domain-scoped service checks for most workflows.
- Club-scoped executive authorization outside the implemented membership review workflow.
- Member-only access checks for polls, chat, and private club content.
- Admin moderation and approval permissions in real routes.

Recommended timing:

- Add domain-scoped authorization inside each feature service as that feature is built.

## Pending Feature Slices

### Slice 3: Central News Feed

Status: `Not Started`

Notes:

- A placeholder frontend feed page file exists, but it is not routed as a real page and has no API integration.

Required:

- Feed API for posts, announcements, events, polls, and achievements.
- Like and comment workflows.
- Executive create, pin, and moderation actions.
- `/feed` page using the News Feed Stitch references.
- Announcement highlighting, filters, pagination, and states.

### Slice 4: Events And Waitlist

Status: `Not Started`

Required:

- Event CRUD for executives.
- Event list and detail experience.
- Registration and cancellation.
- Waitlist placement when capacity is full.
- Waitlist promotion on cancellation.
- Notifications for registration and promotion.
- Tests for capacity and waitlist rules.

### Slice 5: Attendance

Status: `Not Started`

Required:

- Attendance QR token generation.
- Student check-in during event window.
- Executive attendance reports.
- Student attendance history.
- Authorization tied to event club and registration.

### Slice 6: Polls

Status: `Not Started`

Required:

- Poll CRUD for executives.
- Single-choice and multiple-choice voting.
- Member-only voting.
- One vote per user per poll.
- Closing date and automatic closing behavior.
- Live and final result views.

### Slice 7: Notifications, Badges, Profile, And Settings

Status: `Not Started`

Required:

- Notification inbox and unread count.
- Mark read and mark all read actions.
- Badge earning rules for core activities.
- Private own profile view and edit page.
- Account settings page for password/security, notification preferences, and public profile visibility.
- Public profile page with clubs, positions, attendance, badges, and activity timeline.

### Slice 8: Resource Requests And Admin Analytics

Status: `Not Started`

Required:

- Executive room booking and funding request submission.
- Admin approve/reject workflow with remarks.
- Request status tracking.
- Admin analytics dashboard expansion.
- Club analytics foundation.

### Slice 9: Club Chat

Status: `Not Started`

Required:

- Club-scoped chat access for members only.
- Real-time messaging.
- Executive delete and pin moderation actions.
- Typing indicators and image upload only after the base chat is stable.

### Global Search

Status: `Not Started`

Recommended timing:

- Build after clubs, events, feed, and users have real list/detail APIs.

Required:

- Search across clubs, events, students, and posts.
- Filtering, sorting, and result grouping.
- Frontend search page or drawer aligned with the app shell.

## Update Protocol

When a slice is built or materially changed:

1. Update this file in the same change.
2. Move the slice status only when the completion criteria are actually met.
3. Record important missing pieces under `Known follow-up` or `Missing`.
4. Add any new route groups to `docs/api-contract.md`.
5. Add or update implementation decisions in `docs/decisions/` when the choice affects future slices.
6. Run the relevant checks from `docs/ai-workflow.md` and record any skipped checks in the final response.
