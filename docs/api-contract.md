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
- `/events`: event CRUD, registration, cancellation, waitlist
- `/attendance`: QR generation, scan/check-in, reports, history
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
- `GET /clubs/:clubId/memberships/requests`: club-scoped executive/admin pending request queue.
- `PATCH /clubs/:clubId/memberships/requests/:membershipId`: approve or reject a pending request.

Club-scoped executive authorization is enforced in the service layer. A `club_executive` can review requests only for clubs where they have an active `executive` or `advisor` membership; university administrators can review any club.

## Validation

Validate input at the route boundary with Zod. Keep simple schemas inline in routes and move reusable or complex schemas into `*.validation.ts`.

Normalize these at the boundary:

- ObjectId strings
- pagination values
- sort fields and sort order
- booleans
- arrays from query strings
- dates and times
