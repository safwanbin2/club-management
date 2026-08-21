# Feature Status

Last verified: July 17, 2026.

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

All documented vertical slices and cross-cutting implementation items are **Complete**.

Why:

- Slice 7 now turns core activity into user-facing notifications, badges, profile surfaces, and account preferences.
- Slice 8 now gives executives a resource request workflow and administrators an approval workspace.
- Slice 9 now gives active club members a live club chat surface with moderation.
- Global search now indexes clubs, events, feed posts, and profiles with role-aware visibility.
- Dashboard details and authorization checks now cover the implemented workflows.
- Remaining items are optional hardening, delivery integrations, or richer reporting enhancements.

## Priority Queue

| Priority | Slice                                      | Status   | Next Action                                                                 |
| -------- | ------------------------------------------ | -------- | --------------------------------------------------------------------------- |
| P0       | Project foundation and database foundation | Complete | Keep docs and migrations current as new entities/rules are added.           |
| P1       | Auth and role-aware app shell              | Complete | Add production email delivery later; do not block feature work on it.       |
| P2       | Clubs and membership                       | Complete | Expand admin club management later; core slice is demonstrable.             |
| P3       | Central news feed                          | Complete | Add event/poll-specific automatic feed publishing in future slices.         |
| P4       | Events, waitlists, and paid review         | Complete | Add richer event detail pages later if workflow depth requires them.        |
| P5       | Attendance                                 | Removed  | Removed by product decision to avoid QR/check-in complexity.                |
| P6       | Polls                                      | Complete | Add richer poll analytics later from the results data.                      |
| P7       | Notifications, badges, profile, settings   | Complete | Expand badge rules as future modules add richer activity signals.           |
| P8       | Resource requests and admin analytics      | Complete | Expand analytics charts as reporting needs become clearer.                  |
| P9       | Club chat                                  | Complete | Replace polling with WebSocket transport later if real-time scale needs it. |
| P10      | Global search                              | Complete | Add ranking and keyboard shortcuts later if search usage grows.             |

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
  - `GET /api/clubs/:clubId/memberships`
  - `PATCH /api/clubs/:clubId/memberships/:membershipId/role`
  - `GET /api/clubs/:clubId/memberships/requests`
  - `PATCH /api/clubs/:clubId/memberships/requests/:membershipId`
- Club list search, category/status filters, membership filters, pagination, and sorting.
- Club detail with membership summary, current-user membership status, executive committee, and upcoming event previews.
- Student membership request and leave/cancel flows.
- Executive/admin pending request review with approve/reject actions.
- Active-member roster visible to active members and managers.
- Executive/admin member role promotion and demotion for active memberships.
- Club-scoped executive authorization in the service layer.
- Validation schemas for list/detail/request-review inputs.
- Frontend `/clubs` directory page with search, filters, pagination, loading, empty, error, toast, and membership status states.
- Frontend `/clubs/:clubId` detail page with membership actions, executive committee, member roster, upcoming events, contact context, and manager-only request queue.
- Club Directory navigation is enabled in the role-aware app shell.

Known follow-up:

- Admin create/disable club management remains a later administration expansion, not part of the Slice 2 student/executive membership acceptance.
- Demo seed clubs currently rely on generated category visuals when no club cover/logo URL exists.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed.
- The previously reported `backend/tests/README.md` formatting issue was fixed during Slice 3 verification.

### Slice 3: Central News Feed

Status: `Complete`

Implemented:

- Backend feed routes:
  - `GET /api/feed`
  - `GET /api/feed/trending-clubs`
  - `GET /api/feed/manageable-clubs`
  - `POST /api/feed/posts`
  - `POST /api/feed/posts/:postId/like`
  - `GET /api/feed/posts/:postId/comments`
  - `POST /api/feed/posts/:postId/comments`
  - `PATCH /api/feed/posts/:postId/moderation`
  - `PATCH /api/feed/posts/:postId/comments/:commentId/moderation`
- `post_likes` persistence with one-like-per-user uniqueness.
- Feed list search, type filters, pagination, latest/popular sorting, public/member visibility rules, like state, and per-post management flags.
- Club-scoped executive/admin creation for posts, announcements, and achievements.
- Like and comment workflows with post counter updates.
- Club-scoped pin, highlight, hide, delete, and comment moderation behavior.
- Frontend `/feed` page using the News Feed Stitch references with filters, loading, empty, error, pagination, create-post modal, comments drawer, toast feedback, and a real trending-clubs rail.
- News Feed navigation is enabled in the role-aware app shell.
- Demo seed now includes multiple feed post types, likes, and comments.

Known follow-up:

- Event and poll slices should create their own feed posts automatically once their domain workflows exist.
- Feed image support currently accepts image URLs; upload/storage is deferred to a later media handling decision.
- Hidden/deleted content can be moderated through the service APIs, but a dedicated moderation queue remains a later admin expansion.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Slice 4: Events, Waitlist, And Paid Registration Review

Status: `Complete`

Implemented:

- Backend event routes:
  - `GET /api/events`
  - `GET /api/events/manageable-clubs`
  - `POST /api/events`
  - `GET /api/events/:eventId`
  - `PATCH /api/events/:eventId`
  - `DELETE /api/events/:eventId`
  - `POST /api/events/:eventId/register`
  - `POST /api/events/:eventId/cancel-registration`
  - `GET /api/events/:eventId/registrations`
  - `PATCH /api/events/:eventId/registrations/:registrationId/review`
- Event list search, scope filters, status filters, timeframe filters, pagination, latest/upcoming sorting, public/member visibility rules, registration counts, current-user registration status, and management flags.
- Club-scoped executive/admin event creation, editing, and soft deletion.
- Paid event creation with fee amount and bKash send-money number.
- Student registration and cancellation.
- Paid registration transaction ID submission with pending status.
- Executive/admin approval or decline for pending paid registrations.
- Capacity-based waitlist placement.
- First-waitlisted promotion when a confirmed attendee cancels.
- Registration and waitlist-promotion notifications.
- Executive/admin registration queue by pending, registered, waitlisted, declined, and cancelled status.
- Frontend `/events` page using the Events List Stitch references with filters, loading, empty, error, pagination, event cards, create/edit modal with fee fields, paid registration payment modal, registration/cancellation actions, review drawer, confirmations, and toast feedback.
- Events navigation is enabled in the role-aware app shell.

Known follow-up:

- A dedicated event detail route can be added later if event comments, resources, certificates, or check-in surfaces need more space than the list cards provide.
- Completed-event automatic feed publishing should be connected when event lifecycle automation is expanded.
- Event reminders are still deferred to the broader notifications slice.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Slice 5: Attendance

Status: `Removed`

Decision:

- Attendance QR/check-in/reporting was removed from product scope to avoid adding QR complexity to the event workflow.
- The `/attendance` API group, frontend attendance route, navigation item, attendance model, and attendance-derived dashboard/profile/badge behavior were removed.
- Event participation now relies on registration status and paid-registration review state.

### Slice 6: Polls

Status: `Complete`

Implemented:

- Backend poll routes:
  - `GET /api/polls`
  - `GET /api/polls/manageable-clubs`
  - `POST /api/polls`
  - `PATCH /api/polls/:pollId/status`
  - `POST /api/polls/:pollId/vote`
- Poll list search, scope filters, status filters, pagination, current-user vote state, management flags, live counts, and automatic closing of expired open polls.
- Club-scoped executive/admin creation for single-choice and multiple-choice polls.
- Club-scoped open/close controls.
- Active-member-only voting.
- One-vote-per-user enforcement.
- Live result count and percentage display.
- Frontend `/polls` page with filters, poll cards, vote controls, results, create modal, and open/close management actions.
- Polls navigation is enabled in the role-aware app shell.

Known follow-up:

- Poll-created and poll-ending notifications should be connected during the notifications slice.
- Deeper poll analytics can be added to club dashboards once dashboard chart expansion resumes.
- Editing poll questions/options after votes is intentionally deferred to avoid result integrity ambiguity.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Slice 7: Notifications, Badges, Profile, And Settings

Status: `Complete`

Implemented:

- Backend notification routes:
  - `GET /api/notifications`
  - `GET /api/notifications/unread-count`
  - `PATCH /api/notifications/read-all`
  - `PATCH /api/notifications/:notificationId/read`
- Backend profile and settings routes:
  - `GET /api/users/me/profile`
  - `PATCH /api/users/me/profile`
  - `GET /api/users/me/settings`
  - `PATCH /api/users/me/settings`
  - `PATCH /api/users/me/password`
  - `GET /api/users/:userId/profile`
- Notification inbox filters, unread count, single mark-read, and mark-all-read behavior.
- Badge earning rules for first club joined, event registration, executive membership, volunteer membership, and community leadership.
- Badge-earned notifications for newly awarded profile achievements.
- Own profile page with private profile editing, clubs, badges, and activity timeline.
- Public profile page with profile-visibility enforcement and limited user details.
- Account settings page for profile visibility, notification preferences, and password changes.
- Header notification badge, notification page route, profile menu, and settings navigation.

Known follow-up:

- Badge rules should expand as chat, resource requests, search, and richer dashboard analytics are completed.
- Notification delivery is currently in-app only; email digest/reminder preferences are stored for later delivery integrations.
- Public profiles currently use activity signals from notifications, memberships, and badges; feed/comment activity can be added when a richer public activity model is introduced.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Slice 8: Resource Requests And Admin Analytics

Status: `Complete`

Implemented:

- Backend resource request routes:
  - `GET /api/resource-requests`
  - `GET /api/resource-requests/analytics`
  - `GET /api/resource-requests/manageable-clubs`
  - `POST /api/resource-requests`
  - `PATCH /api/resource-requests/:requestId/review`
- Executive funding and room booking request submission for clubs they manage.
- Admin approve/reject workflow with optional remarks and requester notifications.
- Request list filtering by search, status, type, club, and pagination.
- Resource analytics for pending requests, approved requests, pending funding amount, and pending room bookings.
- Frontend `/resources` workspace with analytics cards, filters, create modal, request history, and admin review modal.
- Dashboard action buttons now render from dashboard summary payloads, with admin approval and executive resource shortcuts.
- Resource navigation is enabled for club executives and university administrators.

Known follow-up:

- Analytics are summary cards for now; charted trends and exportable reports can be added when reporting requirements are clearer.
- Resource request notifications are in-app only until email delivery is introduced.
- Admin club creation/disable workflows remain a later administration expansion.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Slice 9: Club Chat

Status: `Complete`

Implemented:

- Backend chat routes:
  - `GET /api/chat/clubs`
  - `GET /api/chat/clubs/:clubId/messages`
  - `POST /api/chat/clubs/:clubId/messages`
  - `POST /api/chat/clubs/:clubId/read`
  - `PATCH /api/chat/messages/:messageId/moderation`
- Club-scoped access checks: students can access only active clubs where they are active members.
- Executive/advisor and admin moderation for pin, unpin, and soft-delete.
- Seen/read tracking for visible messages and unread channel counts.
- Frontend `/chat` page with channel list, unread badges, live auto-refresh, message composer, pinned/deleted states, and moderation controls.
- Chat navigation is enabled in the role-aware app shell.

Known follow-up:

- The live experience currently uses short polling because the backend does not yet include WebSocket infrastructure.
- File upload storage is still deferred; the message API accepts attachment URL payloads for a later upload integration.
- Typing indicators can be added when a WebSocket or server-sent event transport is introduced.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Global Search

Status: `Complete`

Implemented:

- Backend search route:
  - `GET /api/search`
- Grouped search across clubs, events, feed posts, and profiles.
- Type filtering by all, clubs, events, feed posts, and profiles.
- Role-aware visibility:
  - member-only events and feed posts require active membership in the related club.
  - private profiles are hidden except from the owner and university administrators.
  - university administrators can search active platform content.
- Frontend `/search` page with type filters, grouped results, empty/error/loading states, and direct result links.
- App-shell search input navigates into the global search page.

Known follow-up:

- Ranking is currently simple recency/name ordering; weighted scoring can be added when usage data exists.
- Results link to existing list/detail surfaces; dedicated event/post detail pages can deepen direct navigation later.
- Keyboard command palette behavior can be layered on top of the same backend contract.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

## Cross-Cutting Work

### Dashboard Details And Analytics

Status: `Complete`

Implemented:

- Backend dashboard summary service aggregates real database data.
- Frontend dashboard displays role-aware metric cards and panels.
- Dashboard action buttons route users into relevant workflows.
- Student dashboard panels cover joined clubs, upcoming registrations, notifications, badges, and campus activity.
- Club Executive dashboard panels cover membership queues, managed events, resource requests, and open polls.
- University Admin dashboard panels cover approval queues, club status, monthly engagement, upcoming events, and feed activity.

Known follow-up:

- Chart visualizations and exportable reports can be added when reporting requirements are clearer.
- Dedicated event/post detail pages can deepen dashboard drill-down navigation later.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

### Authorization And Permissions

Status: `Complete`

Implemented:

- Role constants.
- Capability registry.
- Authentication middleware.
- Broad capability middleware foundation.
- Route-level capability checks for protected feature groups.
- Club-scoped executive/advisor checks for memberships, feed, events, polls, resource requests, and chat moderation.
- Member-only access checks for club chat, member-only polls, member-only events, and member-only feed visibility.
- Own-profile and public-profile visibility checks.
- Admin review/moderation checks for resource requests, chat, feed, and platform-wide search visibility.

Known follow-up:

- Auth can be hardened later with stricter session rotation, device management, and audit history.
- Production email delivery can be connected for password reset, notification digest, and event reminders.

Verification:

- `pnpm ts-check` passed.
- `pnpm lint` passed.
- `pnpm test` passed.
- `pnpm build` passed with Vite's existing large chunk warning.
- `pnpm format:check` passed.

## Update Protocol

When a slice is built or materially changed:

1. Update this file in the same change.
2. Move the slice status only when the completion criteria are actually met.
3. Record important missing pieces under `Known follow-up` or `Missing`.
4. Add any new route groups to `docs/api-contract.md`.
5. Add or update implementation decisions in `docs/decisions/` when the choice affects future slices.
6. Run the relevant checks from `docs/ai-workflow.md` and record any skipped checks in the final response.
