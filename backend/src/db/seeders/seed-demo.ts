import type { HydratedDocument, Types } from 'mongoose'

import { connectDatabase, disconnectDatabase } from '../mongoose.js'
import { runMigrations } from '../migrations/run-migrations.js'
import { AttendanceModel } from '../../modules/attendance/attendance.model.js'
import { BadgeModel } from '../../modules/badge/badge.model.js'
import { ChatMessageModel } from '../../modules/chat/chat-message.model.js'
import { ClubModel } from '../../modules/club/club.model.js'
import type { Club } from '../../modules/club/club.types.js'
import { EventModel } from '../../modules/event/event.model.js'
import { EventRegistrationModel } from '../../modules/event/event-registration.model.js'
import { PostModel } from '../../modules/feed/post.model.js'
import { MembershipModel } from '../../modules/membership/membership.model.js'
import { NotificationModel } from '../../modules/notification/notification.model.js'
import { PollModel } from '../../modules/poll/poll.model.js'
import { PollVoteModel } from '../../modules/poll/poll-vote.model.js'
import { ResourceRequestModel } from '../../modules/resource-request/resource-request.model.js'
import { UserModel, type UserDocument } from '../../modules/user/user.model.js'
import { hashPassword } from '../../modules/auth/password.service.js'
import { USER_ROLES } from '../../constants/roles.js'

type UserKey = 'admin' | 'aisha' | 'nabila' | 'omar' | 'rafi'
type ClubKey = 'cultural' | 'debate' | 'photography' | 'robotics' | 'volunteer'
type ClubDocument = HydratedDocument<Club> & { _id: Types.ObjectId }

const userSeeds: Record<
  UserKey,
  {
    department: string
    email: string
    name: string
    password: string
    role: (typeof USER_ROLES)[keyof typeof USER_ROLES]
    studentId: string
  }
> = {
  admin: {
    department: 'Student Affairs',
    email: 'farhana.admin@example.edu',
    name: 'Dr. Farhana Karim',
    password: 'DemoAdmin123!',
    role: USER_ROLES.universityAdmin,
    studentId: 'STAFF-001'
  },
  aisha: {
    department: 'Computer Science',
    email: 'aisha.student@example.edu',
    name: 'Aisha Rahman',
    password: 'DemoStudent123!',
    role: USER_ROLES.student,
    studentId: 'CSE-2026-001'
  },
  nabila: {
    department: 'Computer Science',
    email: 'nabila.executive@example.edu',
    name: 'Nabila Chowdhury',
    password: 'DemoExecutive123!',
    role: USER_ROLES.clubExecutive,
    studentId: 'CSE-2024-042'
  },
  omar: {
    department: 'Business Administration',
    email: 'omar.student@example.edu',
    name: 'Omar Hasan',
    password: 'DemoStudent123!',
    role: USER_ROLES.student,
    studentId: 'BBA-2025-118'
  },
  rafi: {
    department: 'English',
    email: 'rafi.executive@example.edu',
    name: 'Rafi Ahmed',
    password: 'DemoExecutive123!',
    role: USER_ROLES.clubExecutive,
    studentId: 'ENG-2024-077'
  }
}

const clubSeeds: Record<
  ClubKey,
  {
    category:
      | 'academic'
      | 'arts'
      | 'community_service'
      | 'culture'
      | 'entrepreneurship'
      | 'sports'
      | 'technology'
    contactEmail: string
    description: string
    facultyAdvisor: { department: string; email: string; name: string }
    name: string
    slug: string
  }
> = {
  cultural: {
    category: 'culture',
    contactEmail: 'cultural.club@example.edu',
    description:
      'Celebrates campus culture through performance, festivals, and room-based programs.',
    facultyAdvisor: {
      department: 'Humanities',
      email: 'salma.advisor@example.edu',
      name: 'Prof. Salma Akter'
    },
    name: 'Cultural Club',
    slug: 'cultural-club'
  },
  debate: {
    category: 'academic',
    contactEmail: 'debate.society@example.edu',
    description: 'Builds public speaking, parliamentary debate, and tournament leadership.',
    facultyAdvisor: {
      department: 'English',
      email: 'kamal.advisor@example.edu',
      name: 'Dr. Kamal Hossain'
    },
    name: 'Debate Society',
    slug: 'debate-society'
  },
  photography: {
    category: 'arts',
    contactEmail: 'photo.club@example.edu',
    description:
      'Runs photo walks, exhibitions, visual storytelling workshops, and campus galleries.',
    facultyAdvisor: {
      department: 'Architecture',
      email: 'maisha.advisor@example.edu',
      name: 'Maisha Rahman'
    },
    name: 'Photography Club',
    slug: 'photography-club'
  },
  robotics: {
    category: 'technology',
    contactEmail: 'robotics.club@example.edu',
    description: 'Hands-on robotics, embedded systems, AI projects, and engineering competitions.',
    facultyAdvisor: {
      department: 'Computer Science',
      email: 'anika.advisor@example.edu',
      name: 'Dr. Anika Sultana'
    },
    name: 'Robotics Club',
    slug: 'robotics-club'
  },
  volunteer: {
    category: 'community_service',
    contactEmail: 'volunteer.forum@example.edu',
    description: 'Coordinates service campaigns, volunteer badges, and community outreach.',
    facultyAdvisor: {
      department: 'Social Sciences',
      email: 'hasan.advisor@example.edu',
      name: 'Dr. Hasan Mahmud'
    },
    name: 'Volunteer Forum',
    slug: 'volunteer-forum'
  }
}

async function seedUsers() {
  const users = {} as Record<UserKey, UserDocument>

  for (const [key, user] of Object.entries(userSeeds) as [UserKey, (typeof userSeeds)[UserKey]][]) {
    users[key] = (await UserModel.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          department: user.department,
          email: user.email,
          name: user.name,
          passwordHash: await hashPassword(user.password),
          role: user.role,
          status: 'active',
          studentId: user.studentId
        }
      },
      { new: true, setDefaultsOnInsert: true, upsert: true }
    )) as UserDocument
  }

  return users
}

async function seedClubs(users: Record<UserKey, UserDocument>) {
  const clubs = {} as Record<ClubKey, ClubDocument>

  for (const [key, club] of Object.entries(clubSeeds) as [ClubKey, (typeof clubSeeds)[ClubKey]][]) {
    clubs[key] = (await ClubModel.findOneAndUpdate(
      { slug: club.slug },
      {
        $set: {
          category: club.category,
          contactEmail: club.contactEmail,
          contactPhone: null,
          createdBy: users.admin._id,
          deletedAt: null,
          description: club.description,
          disabledAt: null,
          facultyAdvisor: club.facultyAdvisor,
          gallery: [],
          name: club.name,
          slug: club.slug,
          socialLinks: {
            website: `https://example.edu/clubs/${club.slug}`
          },
          status: 'active'
        }
      },
      { new: true, setDefaultsOnInsert: true, upsert: true }
    )) as ClubDocument
  }

  return clubs
}

async function seedMemberships(
  users: Record<UserKey, UserDocument>,
  clubs: Record<ClubKey, ClubDocument>
) {
  const rows = [
    {
      club: clubs.robotics._id,
      clubRole: 'executive',
      executivePosition: 'President',
      status: 'active',
      user: users.nabila._id
    },
    {
      club: clubs.debate._id,
      clubRole: 'executive',
      executivePosition: 'Events Lead',
      status: 'active',
      user: users.rafi._id
    },
    {
      club: clubs.robotics._id,
      clubRole: 'member',
      executivePosition: null,
      status: 'active',
      user: users.aisha._id
    },
    {
      club: clubs.photography._id,
      clubRole: 'member',
      executivePosition: null,
      status: 'active',
      user: users.aisha._id
    },
    {
      club: clubs.debate._id,
      clubRole: 'member',
      executivePosition: null,
      status: 'active',
      user: users.omar._id
    },
    {
      club: clubs.volunteer._id,
      clubRole: 'member',
      executivePosition: null,
      status: 'pending',
      user: users.aisha._id
    }
  ] as const

  for (const row of rows) {
    await MembershipModel.findOneAndUpdate(
      { club: row.club, user: row.user },
      {
        $set: {
          approvedAt: row.status === 'active' ? new Date('2026-07-01T10:00:00.000Z') : null,
          club: row.club,
          clubRole: row.clubRole,
          executivePosition: row.executivePosition,
          feeStatus: 'not_required',
          rejectedAt: null,
          requestedAt: new Date('2026-06-20T10:00:00.000Z'),
          reviewedBy: row.status === 'active' ? users.admin._id : null,
          status: row.status,
          user: row.user
        }
      },
      { new: true, setDefaultsOnInsert: true, upsert: true }
    )
  }
}

async function seedActivity(
  users: Record<UserKey, UserDocument>,
  clubs: Record<ClubKey, ClubDocument>
) {
  const roboticsWorkshop = await EventModel.findOneAndUpdate(
    { club: clubs.robotics._id, title: 'AI Robotics Workshop' },
    {
      $set: {
        capacity: 2,
        club: clubs.robotics._id,
        createdBy: users.nabila._id,
        deletedAt: null,
        description: 'Hands-on session covering autonomous navigation and embedded AI.',
        endsAt: new Date('2026-08-15T12:00:00.000Z'),
        registrationDeadline: new Date('2026-08-10T23:59:00.000Z'),
        startsAt: new Date('2026-08-15T09:00:00.000Z'),
        status: 'published',
        title: 'AI Robotics Workshop',
        venue: 'Engineering Lab 3',
        visibility: 'public'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  const debateTournament = await EventModel.findOneAndUpdate(
    { club: clubs.debate._id, title: 'Inter-University Debate Tournament' },
    {
      $set: {
        capacity: 80,
        club: clubs.debate._id,
        createdBy: users.rafi._id,
        deletedAt: null,
        description: 'Campus-wide tournament with preliminary rounds and finals.',
        endsAt: new Date('2026-08-22T18:00:00.000Z'),
        registrationDeadline: new Date('2026-08-18T23:59:00.000Z'),
        startsAt: new Date('2026-08-22T10:00:00.000Z'),
        status: 'published',
        title: 'Inter-University Debate Tournament',
        venue: 'Auditorium',
        visibility: 'public'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await EventRegistrationModel.findOneAndUpdate(
    { event: roboticsWorkshop!._id, user: users.aisha._id },
    {
      $set: {
        event: roboticsWorkshop!._id,
        registeredAt: new Date('2026-07-09T10:00:00.000Z'),
        status: 'registered',
        user: users.aisha._id,
        waitlistPosition: null
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await EventRegistrationModel.findOneAndUpdate(
    { event: roboticsWorkshop!._id, user: users.omar._id },
    {
      $set: {
        event: roboticsWorkshop!._id,
        registeredAt: new Date('2026-07-09T10:10:00.000Z'),
        status: 'waitlisted',
        user: users.omar._id,
        waitlistPosition: 1
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await AttendanceModel.findOneAndUpdate(
    { event: debateTournament!._id, user: users.omar._id },
    {
      $set: {
        checkedInAt: new Date('2026-07-01T10:05:00.000Z'),
        event: debateTournament!._id,
        method: 'qr',
        registration: null,
        user: users.omar._id,
        verifiedBy: users.rafi._id
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await PostModel.findOneAndUpdate(
    { club: clubs.robotics._id, title: 'Robotics Club opens AI workshop registration' },
    {
      $set: {
        author: users.nabila._id,
        body: 'Registration is now open for our AI Robotics Workshop. Seats are limited and waitlists are enabled.',
        club: clubs.robotics._id,
        highlighted: true,
        images: [],
        moderationStatus: 'visible',
        pinned: true,
        relatedEvent: roboticsWorkshop!._id,
        title: 'Robotics Club opens AI workshop registration',
        type: 'announcement',
        visibility: 'public'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  const poll = await PollModel.findOneAndUpdate(
    { club: clubs.robotics._id, question: 'Which robotics track should we run next?' },
    {
      $set: {
        closesAt: new Date('2026-08-01T23:59:00.000Z'),
        club: clubs.robotics._id,
        createdBy: users.nabila._id,
        deletedAt: null,
        options: [
          { id: 'autonomous-navigation', label: 'Autonomous navigation', voteCount: 1 },
          { id: 'robotic-arm', label: 'Robotic arm design', voteCount: 0 },
          { id: 'vision-systems', label: 'Vision systems', voteCount: 0 }
        ],
        question: 'Which robotics track should we run next?',
        status: 'open',
        totalVotes: 1,
        type: 'single_choice',
        visibility: 'public'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await PollVoteModel.findOneAndUpdate(
    { poll: poll!._id, user: users.aisha._id },
    {
      $set: {
        poll: poll!._id,
        selectedOptionIds: ['autonomous-navigation'],
        user: users.aisha._id
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await ChatMessageModel.findOneAndUpdate(
    {
      author: users.nabila._id,
      body: 'Welcome to the Robotics Club channel!',
      club: clubs.robotics._id
    },
    {
      $set: {
        attachments: [],
        author: users.nabila._id,
        body: 'Welcome to the Robotics Club channel!',
        club: clubs.robotics._id,
        deletedAt: null,
        parentMessage: null,
        pinned: true,
        seenBy: [{ seenAt: new Date('2026-07-09T10:30:00.000Z'), user: users.aisha._id }]
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )
}

async function seedNotificationsBadgesAndRequests(
  users: Record<UserKey, UserDocument>,
  clubs: Record<ClubKey, ClubDocument>
) {
  await NotificationModel.findOneAndUpdate(
    { recipient: users.aisha._id, title: 'Membership approved' },
    {
      $set: {
        body: 'Your Robotics Club membership has been approved.',
        link: '/clubs/robotics-club',
        metadata: { clubSlug: 'robotics-club' },
        readAt: null,
        recipient: users.aisha._id,
        title: 'Membership approved',
        type: 'membership_approved'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await BadgeModel.findOneAndUpdate(
    { badgeType: 'first_club_joined', sourceActivityId: 'robotics-club', user: users.aisha._id },
    {
      $set: {
        badgeType: 'first_club_joined',
        description: 'Awarded for joining the first campus club.',
        earnedAt: new Date('2026-07-01T10:00:00.000Z'),
        icon: 'badge-check',
        metadata: { clubSlug: 'robotics-club' },
        sourceActivityId: 'robotics-club',
        title: 'First Club Joined',
        user: users.aisha._id
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await ResourceRequestModel.findOneAndUpdate(
    { club: clubs.cultural._id, 'details.title': 'Main auditorium booking' },
    {
      $set: {
        club: clubs.cultural._id,
        details: {
          description: 'Room booking for the fall cultural showcase rehearsal.',
          requestedDate: new Date('2026-08-05T15:00:00.000Z'),
          room: 'Main Auditorium',
          title: 'Main auditorium booking'
        },
        requestedBy: users.nabila._id,
        reviewedAt: null,
        reviewer: null,
        status: 'pending',
        type: 'room_booking'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )

  await ResourceRequestModel.findOneAndUpdate(
    { club: clubs.robotics._id, 'details.title': 'Sensor kit funding' },
    {
      $set: {
        club: clubs.robotics._id,
        details: {
          amount: 1200,
          description: 'Funding request for shared sensors and microcontroller kits.',
          title: 'Sensor kit funding'
        },
        remarks: 'Approved for the fall project cycle.',
        requestedBy: users.nabila._id,
        reviewedAt: new Date('2026-07-05T12:00:00.000Z'),
        reviewer: users.admin._id,
        status: 'approved',
        type: 'funding'
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  )
}

export async function seedDemoData() {
  await runMigrations()
  const users = await seedUsers()
  const clubs = await seedClubs(users)
  await seedMemberships(users, clubs)
  await seedActivity(users, clubs)
  await seedNotificationsBadgesAndRequests(users, clubs)

  console.log('Demo data ready.')
  console.log('Student: aisha.student@example.edu / DemoStudent123!')
  console.log('Executive: nabila.executive@example.edu / DemoExecutive123!')
  console.log('Admin: farhana.admin@example.edu / DemoAdmin123!')
}

async function main() {
  await connectDatabase()
  await seedDemoData()
  await disconnectDatabase()
}

main().catch(async error => {
  console.error(error)
  await disconnectDatabase()
  process.exit(1)
})
