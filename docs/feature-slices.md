# Feature Slices

Build the product as vertical slices. Each slice should include backend behavior, frontend experience, validation, authorization, and focused tests where useful.

## Slice 1: Auth And Role-Aware Shell

Goal: users can register, log in, persist sessions, log out, and land in the right dashboard shell.

Acceptance:

- Student registration and login work.
- Auth state persists after refresh.
- Protected routes redirect unauthenticated users.
- Role-aware navigation shows Student, Executive, or Admin destinations.
- Dashboard shell has real layout and empty/loading states, not placeholder pages.

## Slice 2: Clubs And Membership

Goal: students can browse clubs and request membership; executives can review requests.

Acceptance:

- Club list supports search, filters, pagination, and detail pages.
- Students can request to join and leave clubs.
- Executives can approve or reject membership requests for their club.
- Membership status is visible in club cards and details.

## Slice 3: Central News Feed

Goal: homepage aggregates club posts, announcements, events, polls, and achievements.

Acceptance:

- Feed supports multiple post types.
- Users can like and comment.
- Executives can create, pin, and moderate posts for their club.
- Announcements are visually distinct.

## Slice 4: Events And Waitlist

Goal: executives manage events and students register.

Acceptance:

- Event CRUD exists for executives.
- Students can register or cancel.
- Capacity produces a waitlist.
- Cancelling promotes the first waitlisted student.
- Notifications are created for registration and waitlist promotion.

## Slice 5: Attendance

Goal: event attendance can be recorded and reported.

Acceptance:

- Executives can generate an attendance QR token.
- Students can check in during the event window.
- Executives can view attendance reports.
- Students can view attendance history.

## Slice 6: Polls

Goal: club members can vote in executive-created polls.

Acceptance:

- Polls support single and multiple choice.
- Only members can vote.
- One vote per student per poll.
- Polls close automatically after closing date.
- Live and final results display correctly.

## Slice 7: Notifications, Badges, Profile, And Settings

Goal: user activity becomes visible and motivating, while users can manage their own profile and account preferences.

Acceptance:

- Notification inbox and unread count work.
- Badge earning rules exist for core activities.
- Private own profile view and edit flows work.
- Account settings support password/security, notification preferences, and public profile visibility.
- Public profile shows clubs, executive positions, attendance, badges, and activity timeline.

## Slice 8: Resource Requests And Admin Analytics

Goal: executives can request rooms/funding and administrators can approve them.

Acceptance:

- Executives submit room booking and funding requests.
- Admins approve, reject, and leave remarks.
- Admin dashboard shows platform metrics and pending work.

## Slice 9: Club Chat

Goal: members can communicate in club-scoped real-time chat.

Acceptance:

- Only club members can enter a chat.
- Messages are real-time.
- Executives can moderate and pin messages.
- Typing indicators and image upload are added if the base chat is stable.
