# Domain Model

This document captures the first-pass domain language for the University Club Management System. Update it when implementation reveals better names or constraints.

## Roles

`student`

- Base authenticated user.
- Can browse clubs, join/leave clubs, interact with feed posts, register for events, vote in club polls, join club chat, view profile, badges, and notifications.

`club_executive`

- A student with management responsibilities for one or more clubs.
- Can manage assigned clubs, membership requests, member roles, posts, announcements, events, paid registration review, polls, chat moderation, analytics, funding requests, and room bookings.

`university_admin`

- Platform-level administrator.
- Can manage clubs and users, moderate content, view university analytics, and approve resource requests.

## Core Entities

User:

- identity, email, password hash, role, avatar, student information, profile visibility, notification preferences, account settings, status

Club:

- name, slug, logo, cover image, description, category, faculty advisor, contact info, social links, status

Membership:

- user, club, status, requestedAt, approvedAt, rejectedAt, role within club, executive position

Post:

- author, club, type, body, images, pinned, highlighted, like count, comment count, moderation status

Comment:

- post, author, body, moderation status

Event:

- club, title, description, banner, schedule, venue, capacity, registration deadline, status, optional fee amount, bKash number

EventRegistration:

- event, user, status, registeredAt, waitlistPosition, promotedAt, cancelledAt, payment transaction ID, payment review metadata

Poll:

- club, question, options, type, closesAt, visibility, status

PollVote:

- poll, user, selected options, createdAt

ChatMessage:

- club, author, body, attachments, parent message, pinned, deleted, seen status

Notification:

- recipient, type, title, body, readAt, link, metadata

Badge:

- user, badge type, earnedAt, source activity

ResourceRequest:

- club, requester, type, details, status, reviewer, remarks

## Important Rules

- Only club members can access a club chat.
- Only club members can vote in that club's polls.
- A student can vote only once per poll.
- Event registrations move to waitlist after capacity is reached.
- Paid event registrations start as pending until a club executive or university admin approves or declines the submitted bKash transaction ID.
- Cancelling a registration promotes the first waitlisted student.
- Completed events should create a feed item.
- Executive permissions are scoped to clubs they manage.
- University admin permissions are platform-wide.
- Soft delete is preferred for user-facing records that may need moderation or recovery.
