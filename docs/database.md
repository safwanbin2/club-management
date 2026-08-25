# Database Foundation

The backend uses MongoDB through Mongoose models. MongoDB is not managed by this repo; set `MONGODB_URI` in `backend/.env`.

## Commands

```bash
pnpm migrate
pnpm seed:demo
```

`pnpm migrate` creates collections and indexes and records applied migrations in `schema_migrations`.

`pnpm seed:demo` runs migrations first, then upserts demonstration data for the documented workflows.

## Implemented Collections

- `users`
- `auth_sessions`
- `clubs`
- `memberships`
- `posts`
- `post_likes`
- `comments`
- `events`
- `event_registrations`
- `polls`
- `poll_votes`
- `chat_messages`
- `notifications`
- `badges`
- `resource_requests`
- `schema_migrations`

## Authorization Foundation

Role capabilities are defined in `backend/src/constants/capabilities.ts`.

- Students receive browse, join, participation, profile, notification, and own-history capabilities.
- Club executives inherit student capabilities and receive club-scoped management capabilities.
- University administrators inherit broad capabilities and receive platform-wide management capabilities.

## User Preferences

User documents persist profile visibility and notification preferences. These settings currently drive public profile access and in-app notification surfaces, and leave room for later email digest and reminder delivery.
