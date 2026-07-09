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
- A funding request is approved by administration.

## Seed Strategy

When models are implemented, add a backend seed command that:

1. Clears only demo-owned records in development.
2. Creates users with known demo credentials.
3. Creates clubs, memberships, events, posts, polls, resource requests, notifications, badges, and attendance.
4. Prints demo login credentials and local URLs.

Do not seed production data from this script.
