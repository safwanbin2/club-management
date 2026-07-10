# Roadmap

This roadmap is optimized for AI-assisted delivery: each phase creates a working product slice and leaves the codebase easier for the next slice.

## Phase 0: Project Foundation

- Finalize local env setup.
- Install dependencies and generate `pnpm-lock.yaml`.
- Add linting, formatting, and test runners.
- Keep the AI docs up to date.

## Phase 1: Auth And App Shell

- User model, auth service, auth routes, validation, password hashing, sessions/tokens.
- Frontend auth pages, protected routes, session store, role-aware app layout.
- Student, executive, and admin dashboard shells.

## Phase 2: Clubs And Membership

- Club and membership models.
- Club directory, club detail, join/leave/request flows.
- Executive membership approval workflow.

## Phase 3: Feed And Announcements

- Post, comment, like, and announcement behavior.
- Feed homepage with filters and pinned/highlighted content.
- Executive moderation actions.

## Phase 4: Events, Waitlists, Attendance

- Event CRUD, registration, cancellation, waitlist promotion.
- Attendance QR token and check-in flow.
- Attendance reports and history.

## Phase 5: Polls, Notifications, Profiles, Settings

- Club polls and vote restrictions.
- Notification system and unread state.
- Badge rules and profile achievements.
- Own profile, public profile, and account settings.

## Phase 6: Resource Requests, Analytics, Search

- Funding and room booking workflows.
- Club and university analytics dashboards.
- Global search across clubs, events, students, and posts.

## Current Recommended Next Slice

Start with Phase 2: Clubs And Membership. Phase 1 and the database foundation are complete enough to support the next vertical slice.

For the live feature ledger, use `docs/feature-status.md`.
