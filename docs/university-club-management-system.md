# University Club Management System

Build a modern, production-quality full-stack web application called **University Club Management System**.

The application should be responsive, visually appealing, and feel similar to a modern SaaS product. Focus on clean UI/UX, reusable components, modular code, and scalability.

Do not generate placeholder pages. Every page should have meaningful functionality.

---

# User Roles

There are three main roles:

## 1. Student

Students can:

- Register/Login
- View and edit their profile
- Manage account settings and profile visibility
- Browse clubs
- Join or leave clubs
- View club information
- Pay membership fee (mock payment is acceptable)
- View club executives
- View club announcements
- View news feed
- Like posts
- Comment on posts
- Register for events
- Cancel event registration
- Join waitlists
- Receive notifications
- Vote in club polls
- Participate in club group chats (only for clubs they belong to)
- View attendance history
- View badges and achievements
- View certificates (optional)

---

## 2. Club Executive

Executives inherit all Student permissions and additionally can:

- Manage their club
- Edit club information
- Manage membership requests
- Accept or reject members
- Assign executive positions
- Create announcements
- Create posts
- Pin important posts
- Delete inappropriate posts/comments
- Create events
- Edit/Delete events
- Set event capacity
- Manage registrations
- Generate QR code for attendance
- View attendance reports
- Create polls
- Close polls
- View poll results
- Moderate club group chat
- View club analytics
- Submit funding requests
- Submit room booking requests

---

## 3. University Administration

University administrators can:

- Manage all clubs
- Create clubs
- Disable clubs
- Manage all users
- View university-wide analytics
- Approve funding requests
- Approve room booking requests
- Moderate platform content
- View reports

---

# Authentication

Implement:

- Login
- Registration
- Logout
- Forgot password
- Reset password
- Role-based authorization
- Protected routes
- Secure authentication
- Session persistence

---

# Account Settings

Authenticated users can:

- Update their own profile information
- Update avatar and basic student details
- Change password
- Manage notification preferences
- Control public profile visibility
- Review active sessions and sign out from other sessions when supported

Settings should be available from the app shell and should use the same protected account context as the authenticated user.

---

# Dashboard

Each role has its own dashboard.

Student Dashboard

- Joined clubs
- Upcoming events
- Notifications
- Attendance summary
- Recent activity
- Badges

Club Executive Dashboard

- Total members
- Pending requests
- Upcoming events
- Poll statistics
- Attendance charts
- Engagement metrics

University Dashboard

- Total clubs
- Total students
- Total events
- Most active clubs
- Monthly participation
- Funding requests
- Room bookings

---

# Club Module

Each club contains:

- Name
- Logo
- Cover image
- Description
- Category
- Faculty advisor
- Contact information
- Social links
- Executive committee
- Members
- Gallery

Members can:

- Join
- Leave
- View members
- View executives

Executives can manage every aspect of their own club.

---

# News Feed

The application homepage is a centralized News Feed.

The feed should aggregate posts from all clubs.

Feed supports multiple content types:

- Regular post
- Announcement
- Event
- Poll
- Achievement

Every post should support:

- Author
- Club
- Timestamp
- Rich text
- Images (optional)
- Likes
- Comments

Executives can pin important posts.

Announcements should appear highlighted.

---

# Event Management

Executives can:

- Create events
- Edit events
- Delete events

Event contains:

- Title
- Description
- Banner
- Date
- Time
- Venue
- Capacity
- Registration deadline
- Organizer
- Status

Students can:

- Register
- Cancel registration

When capacity is reached:

Automatically place students into a waitlist.

When someone cancels:

Automatically move the first waitlisted student into the participant list and notify them.

Completed events should automatically appear as a feed post.

---

# Attendance

Every event should support attendance.

Executives generate a QR code.

Students scan the QR during the event.

Attendance is stored.

Executives can view attendance reports.

Students can view attendance history.

---

# Poll System

Club executives can create polls.

Poll types:

- Single choice
- Multiple choice

Poll features:

- Closing date
- Live results
- Anonymous or public voting
- Total votes
- Automatic closing

Only club members may vote.

Students may only vote once.

---

# Club Chat

Each club has its own real-time group chat.

Only members of that club can access it.

Support:

- Real-time messaging
- Emojis
- Image upload
- Message timestamps
- Typing indicator
- Seen status (optional)
- Reply to message (optional)

Executives can:

- Delete messages
- Pin messages
- Moderate chat

---

# Notifications

Provide an in-app notification system.

Notify users when:

- Membership approved
- New event
- Event reminder
- Registration confirmed
- Waitlist promoted
- Poll created
- Poll ending
- Announcement published
- Badge earned
- Funding approved

---

# Member Profile

The product has two profile surfaces:

- Private own profile and account settings for the authenticated user
- Public profile view for other users, controlled by visibility settings

Each profile displays:

- Avatar
- Student information
- Joined clubs
- Executive positions
- Events attended
- Attendance percentage
- Badges
- Achievements
- Activity timeline

Profiles should be shareable via a public URL.
Public profiles should not expose private settings, security fields, or hidden profile sections.

---

# Badge & Achievement System

Students earn badges based on activities.

Examples:

- First Club Joined
- Event Explorer
- Volunteer
- Executive Member
- 100% Attendance
- Community Leader

Badges should appear on the public profile.

---

# Analytics

Club Analytics

- Membership growth
- Event popularity
- Attendance
- Poll participation
- Feed engagement

University Analytics

- Active clubs
- Active students
- Monthly registrations
- Club rankings
- Event participation
- Attendance trends

Use attractive dashboard charts.

---

# Resource Management

Executives may submit:

Room booking requests

Funding requests

University administration may:

Approve

Reject

Leave remarks

Track request status.

---

# Search

Provide global search for:

- Clubs
- Events
- Students
- Posts

Support filtering and sorting where appropriate.

---

# General Requirements

Implement:

- Responsive design
- Pagination
- Search
- Filters
- Loading states
- Empty states
- Toast notifications
- Form validation
- Error handling
- Confirmation dialogs
- Soft delete where appropriate

---

# UI Design

The UI should feel modern and professional.

Use:

- Dashboard layout
- Sidebar navigation
- Top navigation
- Cards
- Tables
- Charts
- Beautiful forms
- Responsive grids
- Consistent spacing
- Light and dark mode support
- Smooth animations
- Accessible color contrast

The application should resemble a polished SaaS product rather than a basic university assignment.

---

# Code Quality

Generate clean, modular, maintainable code.

Follow best practices.

Avoid duplicated logic.

Create reusable components.

Use clear naming conventions.

Separate business logic from presentation.

Keep the project organized and scalable.

The generated project should be complete enough that it can be run, extended, and demonstrated as a real university club management platform.
