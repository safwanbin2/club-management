# Demo Data Plan

Demo data should make the product feel alive and should exercise the tricky workflows: roles, membership approvals, waitlists, attendance, polls, notifications, analytics, and resource approvals.

## Personas

- Student: Aisha Rahman, first-year CSE student, joined Robotics and Photography.
- Student: Omar Hasan, active event attendee, on one event waitlist.
- Club Executive: Nabila Chowdhury, president of Robotics Club.
- Club Executive: Rafi Ahmed, events lead for Debate Society.
- University Admin: Dr. Farhana Karim, Student Affairs administrator.

## Clubs

- Robotics Club: technology, active membership requests, upcoming workshop.
- Debate Society: public speaking, active tournament event.
- Photography Club: arts, gallery posts and achievement feed items.
- Cultural Club: performance, room booking request.
- Volunteer Forum: community service, badges and attendance activity.

## Workflow Scenarios

- A student requests to join a club and waits for executive approval.
- An executive approves one member and rejects another with remarks.
- An event reaches capacity and places students on the waitlist.
- A cancellation promotes the first waitlisted student and creates a notification.
- A completed event produces a feed post.
- A QR attendance check-in records attendance history.
- A poll closes and exposes final results.
- Aisha has an unread membership notification and seeded first-club badge for profile and notification demos.
- A room booking request is pending admin review and a funding request is approved by administration.
- Robotics Club has a pinned chat welcome message with Aisha marked as seen.

## Seed Strategy

The backend seed command is:

```bash
pnpm seed:demo
```

It:

1. Runs pending database migrations first.
2. Upserts users with known demo credentials.
3. Upserts clubs, memberships, events, posts, post likes, comments, polls, resource requests, notifications, badges, chat, and attendance.
4. Prints demo login credentials.

The script is idempotent and does not clear arbitrary data. Do not run demo seeding against production data.
