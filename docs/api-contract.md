# API Contract

The backend serves JSON under `/api`. The frontend reads the base URL from `VITE_API_URL`.

## Response Shape

Successful responses:

```json
{
  "status": "success",
  "code": "SUCCESS",
  "data": {},
  "message": "OK"
}
```

Error responses:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "data": null,
  "message": "Human readable message"
}
```

Validation errors:

```json
{
  "status": "error",
  "code": "VALIDATION",
  "data": {
    "field": ["Validation message"]
  },
  "message": "Validation failed"
}
```

## Pagination

Use camelCase metadata consistently:

```json
{
  "data": [],
  "total": 100,
  "perPage": 10,
  "currentPage": 1,
  "currentTotal": 10,
  "lastPage": 10
}
```

Frontend data hooks should adapt backend responses once, then return domain names such as `clubs`, `totalClubs`, `isClubsPending`, and `refetchClubs`.

## Auth

Initial auth should use secure password hashing, short-lived access tokens, refresh/session persistence, and role-aware guards.

Roles:

- `student`
- `club_executive`
- `university_admin`

Route middleware should handle authentication and broad capabilities. Services should enforce domain-specific authorization, such as whether an executive can manage a specific club.

## Route Groups

Planned route groups:

- `/auth`: login, register, logout, refresh, forgot password, reset password
- `/users`: own profile, public profile, account settings, admin user management
- `/clubs`: club directory, details, membership, executive management
- `/feed`: posts, announcements, comments, likes, pins
- `/events`: event CRUD, free/paid registration, bKash transaction review, cancellation, waitlist
- `/polls`: poll CRUD, voting, results, closing
- `/chat`: club-scoped real-time messaging
- `/notifications`: notification list, unread counts, mark read
- `/resource-requests`: room bookings and funding requests
- `/search`: global search across clubs, events, students, and posts

## Implemented Clubs And Membership Routes

The Slice 2 club workflow is implemented under `/clubs`:

- `GET /clubs`: paginated club directory with search, category/status filters, membership filters, and sorting.
- `GET /clubs/:clubId`: club detail by slug or ObjectId with membership summary, executive committee, upcoming events, and current-user membership status.
- `POST /clubs/:clubId/memberships/request`: create or reopen the authenticated user's membership request.
- `POST /clubs/:clubId/memberships/leave`: leave an active membership or cancel a pending membership request.
- `GET /clubs/:clubId/memberships`: active member roster, visible to active club members and club managers.
- `PATCH /clubs/:clubId/memberships/:membershipId/role`: club-scoped executive/admin promotion or demotion for active members.
- `GET /clubs/:clubId/memberships/requests`: club-scoped executive/admin pending request queue.
- `PATCH /clubs/:clubId/memberships/requests/:membershipId`: approve or reject a pending request.

Club-scoped executive authorization is enforced in the service layer. A `club_executive` can review requests only for clubs where they have an active `executive` or `advisor` membership; university administrators can review any club.

## Implemented Feed Routes

The Slice 3 central news feed workflow is implemented under `/feed`:

- `GET /feed`: paginated feed posts with search, type filters, latest/popular sorting, public/member visibility rules, current-user like state, and moderation flags.
- `GET /feed/trending-clubs`: active clubs ranked by visible feed activity and member counts.
- `GET /feed/manageable-clubs`: clubs the authenticated executive/admin can publish for.
- `POST /feed/posts`: executive/admin creation for club posts, announcements, and achievements.
- `POST /feed/posts/:postId/like`: toggle the authenticated user's like on a visible post.
- `GET /feed/posts/:postId/comments`: paginated visible comments; club managers can also see non-deleted moderated comments.
- `POST /feed/posts/:postId/comments`: create a visible comment and update post comment counts.
- `PATCH /feed/posts/:postId/moderation`: club-scoped executive/admin pin, highlight, hide, flag, or delete moderation actions.
- `PATCH /feed/posts/:postId/comments/:commentId/moderation`: club-scoped executive/admin comment moderation.

Likes are persisted in `post_likes` with a unique post/user index. Club-scoped executive authorization is enforced in the feed service layer for create and moderation actions; university administrators can manage posts for any active club.

## Implemented Events And Waitlist Routes

The Slice 4 events workflow is implemented under `/events`:

- `GET /events`: paginated event list with search, scope filters, status filters, timeframe filters, sorting, visibility rules, registration counts, current-user registration state, and management flags.
- `GET /events/manageable-clubs`: clubs the authenticated executive/admin can create events for.
- `POST /events`: club-scoped executive/admin event creation.
- `GET /events/:eventId`: event detail by ObjectId.
- `PATCH /events/:eventId`: club-scoped executive/admin event updates.
- `DELETE /events/:eventId`: soft-delete/cancel an event.
- `POST /events/:eventId/register`: register the authenticated user, place them at the end of the waitlist when capacity is full, or create a pending paid registration when the event has a fee.
- `POST /events/:eventId/cancel-registration`: cancel a registration or waitlist entry; cancelling a confirmed registration promotes the first waitlisted user.
- `GET /events/:eventId/registrations`: club-scoped executive/admin registration queue by status.
- `PATCH /events/:eventId/registrations/:registrationId/review`: club-scoped executive/admin approve or decline for pending paid registrations.

Paid events expose `feeAmount`, `paymentMethod`, and `bkashNumber`. Paid registrations require `paymentTransactionId`, remain `pending`, and move to `registered`, `waitlisted`, or `declined` after manager review. Registration and waitlist promotion create notifications using `registration_confirmed` and `waitlist_promoted` notification types. Event management authorization is club-scoped in the service layer; university administrators can manage events for any active club.

## Implemented Poll Routes

The Slice 6 poll workflow is implemented under `/polls`:

- `GET /polls`: paginated poll list with search, scope filters, status filters, current-user vote state, management flags, live counts, and automatic closing of expired open polls.
- `GET /polls/manageable-clubs`: clubs the authenticated executive/admin can create polls for.
- `POST /polls`: club-scoped executive/admin poll creation for single-choice and multiple-choice polls.
- `PATCH /polls/:pollId/status`: club-scoped executive/admin open/close controls.
- `POST /polls/:pollId/vote`: active club member voting with one-vote-per-user enforcement and option count updates.

Poll voting is member-only in the service layer. Each user can vote once per poll through the existing unique `poll_votes` poll/user index.

## Implemented Notifications, Profiles, And Settings Routes

The Slice 7 user activity workflow is implemented under `/notifications` and `/users`:

- `GET /notifications`: paginated notification inbox with all/read/unread filters.
- `GET /notifications/unread-count`: unread notification count for the authenticated user.
- `PATCH /notifications/read-all`: mark all authenticated-user notifications as read.
- `PATCH /notifications/:notificationId/read`: mark one authenticated-user notification as read.
- `GET /users/me/profile`: authenticated user's profile, clubs, badges, and activity timeline.
- `PATCH /users/me/profile`: update authenticated user's name, student ID, department, and avatar URL.
- `GET /users/me/settings`: authenticated user's profile visibility and notification preferences.
- `PATCH /users/me/settings`: update profile visibility and notification preferences.
- `PATCH /users/me/password`: change password after validating the current password.
- `GET /users/:userId/profile`: public profile view with profile-visibility enforcement.

Profile reads award newly earned badges from current membership, event registration, and leadership activity. Newly awarded badges create `badge_earned` in-app notifications. Notification preferences are persisted on `users` for later delivery integrations.

## Implemented Resource Request Routes

The Slice 8 resource request workflow is implemented under `/resource-requests`:

- `GET /resource-requests`: paginated request list with search, status, type, club filters, and role-scoped visibility.
- `GET /resource-requests/analytics`: request totals for pending, approved, rejected, pending funding amount, pending room bookings, and managed clubs.
- `GET /resource-requests/manageable-clubs`: active clubs the authenticated executive/admin can submit requests for.
- `POST /resource-requests`: executive/admin submission for funding or room booking requests.
- `PATCH /resource-requests/:requestId/review`: university admin approve/reject review with optional remarks.

Club executives can submit and list requests only for active clubs where they hold an active `executive` or `advisor` membership. University administrators can list and review all requests. Submission and review create in-app notifications using `resource_request_submitted`, `resource_request_approved`, and `resource_request_rejected`.

## Implemented Club Chat Routes

The Slice 9 club chat workflow is implemented under `/chat`:

- `GET /chat/clubs`: clubs whose chat the authenticated user can access, with unread counts and last-message timestamps.
- `GET /chat/clubs/:clubId/messages`: paginated club message history.
- `POST /chat/clubs/:clubId/messages`: create a text message, with attachment URL payload support for future upload integrations.
- `POST /chat/clubs/:clubId/read`: mark visible messages read for the authenticated user.
- `PATCH /chat/messages/:messageId/moderation`: club executive/admin pin, unpin, or soft-delete moderation action.

Students can access chat only for clubs where they have an active membership. Club executives can moderate only chats for clubs where they are active `executive` or `advisor` members. University administrators can access and moderate all active club chats. The frontend keeps channels live with short polling; a WebSocket transport can replace the polling layer later without changing these route contracts.

## Implemented Search Routes

The global search workflow is implemented under `/search`:

- `GET /search`: grouped search results across clubs, events, feed posts, and profiles.

Query parameters:

- `q`: search term.
- `type`: `all`, `clubs`, `events`, `posts`, or `profiles`.
- `limit`: maximum items per group, capped at 10.

Search honors existing visibility boundaries. Member-only events and feed posts are returned only when the authenticated user belongs to the related club; university administrators can search across active platform content. Private profiles are excluded except for the profile owner and university administrators.

## Validation

Validate input at the route boundary with Zod. Keep simple schemas inline in routes and move reusable or complex schemas into `*.validation.ts`.

Normalize these at the boundary:

- ObjectId strings
- pagination values
- sort fields and sort order
- booleans
- arrays from query strings
- dates and times
