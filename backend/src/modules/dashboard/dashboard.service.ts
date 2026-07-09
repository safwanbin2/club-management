import { Types } from 'mongoose'

import { USER_ROLES } from '../../constants/roles.js'
import { AttendanceModel } from '../attendance/attendance.model.js'
import { BadgeModel } from '../badge/badge.model.js'
import { ClubModel } from '../club/club.model.js'
import { EventModel } from '../event/event.model.js'
import { EventRegistrationModel } from '../event/event-registration.model.js'
import { PostModel } from '../feed/post.model.js'
import { MembershipModel } from '../membership/membership.model.js'
import { NotificationModel } from '../notification/notification.model.js'
import { PollModel } from '../poll/poll.model.js'
import { ResourceRequestModel } from '../resource-request/resource-request.model.js'
import type { UserDto } from '../user/user.types.js'
import type { DashboardListItem, DashboardPanel, DashboardSummary } from './dashboard.types.js'

function toObjectId(id: string) {
  return new Types.ObjectId(id)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return '0%'
  }

  return `${Math.round((numerator / denominator) * 100)}%`
}

function createPanel(
  id: string,
  title: string,
  emptyTitle: string,
  emptyDescription: string,
  items: DashboardListItem[]
): DashboardPanel {
  return {
    emptyDescription,
    emptyTitle,
    id,
    items,
    title
  }
}

export function getDashboardSummarySkeleton(user: UserDto): DashboardSummary {
  if (user.role === USER_ROLES.clubExecutive) {
    return {
      actions: [
        { id: 'members', label: 'Review Members', path: '/clubs', tone: 'primary' },
        { id: 'broadcast', label: 'Broadcast News', path: '/feed', tone: 'secondary' }
      ],
      generatedAt: new Date().toISOString(),
      hero: {
        eyebrow: 'Club Executive Workspace',
        subtitle:
          'Manage club membership, announcements, events, polls, attendance, and engagement from one place.',
        title: `Welcome back, ${user.name}`
      },
      metrics: [
        {
          change: 'No managed clubs yet',
          id: 'managedClubs',
          label: 'Managed Clubs',
          tone: 'primary',
          value: '0'
        },
        {
          change: 'No waiting requests',
          id: 'pendingRequests',
          label: 'Pending Requests',
          tone: 'warning',
          value: '0'
        },
        {
          change: 'No upcoming events',
          id: 'events',
          label: 'Upcoming Events',
          tone: 'info',
          value: '0'
        },
        {
          change: 'No check-ins yet',
          id: 'attendance',
          label: 'Attendance Rate',
          tone: 'success',
          value: '0%'
        }
      ],
      panels: [
        createPanel(
          'requests',
          'Membership Queue',
          'No pending membership requests',
          'New membership requests for clubs you manage will appear here.',
          []
        ),
        createPanel(
          'events',
          'Managed Events',
          'No managed events yet',
          'Upcoming events for your clubs will appear here.',
          []
        )
      ],
      role: user.role,
      user
    }
  }

  if (user.role === USER_ROLES.universityAdmin) {
    return {
      actions: [
        {
          id: 'approvals',
          label: 'Open Approval Queue',
          path: '/admin/approvals',
          tone: 'primary'
        },
        { id: 'clubs', label: 'Manage Clubs', path: '/clubs', tone: 'secondary' }
      ],
      generatedAt: new Date().toISOString(),
      hero: {
        eyebrow: 'University Administration',
        subtitle:
          'Monitor clubs, students, approvals, moderation, resource requests, and university-wide activity.',
        title: `System oversight for ${user.name}`
      },
      metrics: [
        { change: 'No clubs yet', id: 'clubs', label: 'Total Clubs', tone: 'primary', value: '0' },
        {
          change: 'No active students',
          id: 'students',
          label: 'Active Students',
          tone: 'info',
          value: '0'
        },
        {
          change: 'No approvals waiting',
          id: 'approvals',
          label: 'Pending Approvals',
          tone: 'warning',
          value: '0'
        },
        {
          change: 'No activity this month',
          id: 'engagement',
          label: 'Monthly Engagement',
          tone: 'success',
          value: '0'
        }
      ],
      panels: [
        createPanel(
          'approvals',
          'Approval Queue',
          'No approvals waiting',
          'Club creation and resource approvals will appear here.',
          []
        ),
        createPanel(
          'clubs',
          'Club Status',
          'No clubs created yet',
          'Registered clubs and standing will appear here.',
          []
        )
      ],
      role: user.role,
      user
    }
  }

  return {
    actions: [
      { id: 'clubs', label: 'Explore Clubs', path: '/clubs', tone: 'primary' },
      { id: 'profile', label: 'Complete Profile', path: '/profile', tone: 'secondary' }
    ],
    generatedAt: new Date().toISOString(),
    hero: {
      eyebrow: 'Student Workspace',
      subtitle:
        'Track club membership, upcoming events, attendance, notifications, badges, and campus activity.',
      title: `Welcome back, ${user.name}`
    },
    metrics: [
      {
        change: 'Join a club to start',
        id: 'clubs',
        label: 'Joined Clubs',
        tone: 'primary',
        value: '0'
      },
      {
        change: 'No registrations',
        id: 'events',
        label: 'Upcoming Events',
        tone: 'info',
        value: '0'
      },
      {
        change: 'Inbox clear',
        id: 'notifications',
        label: 'Unread Notifications',
        tone: 'warning',
        value: '0'
      },
      {
        change: 'No check-ins yet',
        id: 'attendance',
        label: 'Attendance',
        tone: 'success',
        value: '0%'
      }
    ],
    panels: [
      createPanel(
        'clubs',
        'My Clubs',
        'No joined clubs yet',
        'Join your first club to see committee updates, events, and attendance here.',
        []
      ),
      createPanel(
        'events',
        'Upcoming Events',
        'No upcoming registrations',
        'Event registrations and waitlists will appear here.',
        []
      )
    ],
    role: user.role,
    user
  }
}

async function getStudentDashboardSummary(user: UserDto): Promise<DashboardSummary> {
  const summary = getDashboardSummarySkeleton(user)
  const userId = toObjectId(user.id)

  const [
    joinedClubCount,
    registrationCount,
    unreadCount,
    attendanceCount,
    badgeCount,
    memberships,
    registrations
  ] = await Promise.all([
    MembershipModel.countDocuments({ status: 'active', user: userId }),
    EventRegistrationModel.countDocuments({ status: { $ne: 'cancelled' }, user: userId }),
    NotificationModel.countDocuments({ readAt: null, recipient: userId }),
    AttendanceModel.countDocuments({ user: userId }),
    BadgeModel.countDocuments({ user: userId }),
    MembershipModel.find({ status: 'active', user: userId })
      .sort({ approvedAt: -1 })
      .limit(4)
      .lean(),
    EventRegistrationModel.find({ status: { $in: ['registered', 'waitlisted'] }, user: userId })
      .sort({ registeredAt: -1 })
      .limit(4)
      .lean()
  ])

  const clubs = await ClubModel.find({
    _id: { $in: memberships.map(membership => membership.club) }
  }).lean()
  const clubMap = new Map(clubs.map(club => [club._id.toString(), club]))
  const events = await EventModel.find({
    _id: { $in: registrations.map(registration => registration.event) }
  }).lean()
  const eventMap = new Map(events.map(event => [event._id.toString(), event]))

  summary.metrics = [
    {
      change:
        badgeCount > 0
          ? `${formatNumber(badgeCount)} badge${badgeCount === 1 ? '' : 's'} earned`
          : 'Keep exploring',
      id: 'clubs',
      label: 'Joined Clubs',
      tone: 'primary',
      value: formatNumber(joinedClubCount)
    },
    {
      change: registrationCount > 0 ? 'Registered or waitlisted' : 'No registrations',
      id: 'events',
      label: 'Upcoming Events',
      tone: 'info',
      value: formatNumber(registrationCount)
    },
    {
      change: unreadCount > 0 ? 'Needs attention' : 'Inbox clear',
      id: 'notifications',
      label: 'Unread Notifications',
      tone: unreadCount > 0 ? 'warning' : 'success',
      value: formatNumber(unreadCount)
    },
    {
      change:
        attendanceCount > 0
          ? `${formatNumber(attendanceCount)} check-in${attendanceCount === 1 ? '' : 's'}`
          : 'No check-ins yet',
      id: 'attendance',
      label: 'Attendance',
      tone: 'success',
      value: formatPercent(attendanceCount, registrationCount)
    }
  ]

  summary.panels = [
    createPanel(
      'clubs',
      'My Clubs',
      'No joined clubs yet',
      'Join your first club to see committee updates, events, and attendance here.',
      memberships.map(membership => {
        const club = clubMap.get(membership.club.toString())
        return {
          description: membership.executivePosition ?? `${membership.clubRole} membership`,
          id: membership._id.toString(),
          meta: membership.approvedAt
            ? `Approved ${membership.approvedAt.toDateString()}`
            : 'Active member',
          status: membership.clubRole,
          title: club?.name ?? 'Club',
          tone: membership.clubRole === 'executive' ? 'primary' : 'success'
        }
      })
    ),
    createPanel(
      'events',
      'Upcoming Events',
      'No upcoming registrations',
      'Event registrations and waitlists will appear here.',
      registrations.map(registration => {
        const event = eventMap.get(registration.event.toString())
        return {
          description: event?.venue ?? 'Venue pending',
          id: registration._id.toString(),
          meta: event ? event.startsAt.toDateString() : 'Scheduled event',
          status: registration.status,
          title: event?.title ?? 'Event',
          tone: registration.status === 'waitlisted' ? 'warning' : 'info'
        }
      })
    )
  ]

  return summary
}

async function getExecutiveDashboardSummary(user: UserDto): Promise<DashboardSummary> {
  const summary = getDashboardSummarySkeleton(user)
  const userId = toObjectId(user.id)
  const managedMemberships = await MembershipModel.find({
    clubRole: 'executive',
    status: 'active',
    user: userId
  }).lean()
  const managedClubIds = managedMemberships.map(membership => membership.club)

  const managedEvents = await EventModel.find({
    club: { $in: managedClubIds },
    deletedAt: null,
    status: { $in: ['draft', 'published'] }
  })
    .sort({ startsAt: 1 })
    .limit(4)
    .lean()

  const [pendingRequests, openPolls, eventRegistrationCount, attendanceCount, pendingMemberships] =
    await Promise.all([
      MembershipModel.countDocuments({ club: { $in: managedClubIds }, status: 'pending' }),
      PollModel.countDocuments({ club: { $in: managedClubIds }, status: 'open' }),
      EventRegistrationModel.countDocuments({
        event: { $in: managedEvents.map(event => event._id) },
        status: 'registered'
      }),
      AttendanceModel.countDocuments({ event: { $in: managedEvents.map(event => event._id) } }),
      MembershipModel.find({ club: { $in: managedClubIds }, status: 'pending' })
        .sort({ requestedAt: -1 })
        .limit(4)
        .lean()
    ])

  summary.metrics = [
    {
      change: managedClubIds.length > 0 ? 'Executive scope' : 'No executive assignment',
      id: 'managedClubs',
      label: 'Managed Clubs',
      tone: 'primary',
      value: formatNumber(managedClubIds.length)
    },
    {
      change: pendingRequests > 0 ? 'Review queue open' : 'No waiting requests',
      id: 'pendingRequests',
      label: 'Pending Requests',
      tone: pendingRequests > 0 ? 'warning' : 'success',
      value: formatNumber(pendingRequests)
    },
    {
      change:
        openPolls > 0
          ? `${formatNumber(openPolls)} open poll${openPolls === 1 ? '' : 's'}`
          : 'No open polls',
      id: 'events',
      label: 'Upcoming Events',
      tone: 'info',
      value: formatNumber(managedEvents.length)
    },
    {
      change: attendanceCount > 0 ? 'Attendance captured' : 'No check-ins yet',
      id: 'attendance',
      label: 'Attendance Rate',
      tone: 'success',
      value: formatPercent(attendanceCount, eventRegistrationCount)
    }
  ]

  summary.panels = [
    createPanel(
      'requests',
      'Membership Queue',
      'No pending membership requests',
      'New membership requests for clubs you manage will appear here.',
      pendingMemberships.map(membership => ({
        description: membership.remarks ?? 'Awaiting executive review',
        id: membership._id.toString(),
        meta: membership.requestedAt.toDateString(),
        status: 'pending',
        title: `Membership request ${membership._id.toString().slice(-6)}`,
        tone: 'warning'
      }))
    ),
    createPanel(
      'events',
      'Managed Events',
      'No managed events yet',
      'Upcoming events for your clubs will appear here.',
      managedEvents.map(event => ({
        description: event.venue,
        id: event._id.toString(),
        meta: event.startsAt.toDateString(),
        status: event.status,
        title: event.title,
        tone: event.status === 'published' ? 'info' : 'warning'
      }))
    )
  ]

  return summary
}

async function getAdminDashboardSummary(user: UserDto): Promise<DashboardSummary> {
  const summary = getDashboardSummarySkeleton(user)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [
    totalClubs,
    activeStudents,
    pendingResources,
    pendingClubs,
    monthlyMemberships,
    monthlyPosts,
    monthlyEvents,
    resourceQueue,
    clubs
  ] = await Promise.all([
    ClubModel.countDocuments({ deletedAt: null }),
    MembershipModel.distinct('user', { status: 'active' }).then(users => users.length),
    ResourceRequestModel.countDocuments({ status: 'pending' }),
    ClubModel.countDocuments({ status: 'pending' }),
    MembershipModel.countDocuments({ createdAt: { $gte: monthStart } }),
    PostModel.countDocuments({ createdAt: { $gte: monthStart }, moderationStatus: 'visible' }),
    EventModel.countDocuments({ createdAt: { $gte: monthStart }, deletedAt: null }),
    ResourceRequestModel.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(4).lean(),
    ClubModel.find({ deletedAt: null }).sort({ updatedAt: -1 }).limit(4).lean()
  ])

  const monthlyActivity = monthlyMemberships + monthlyPosts + monthlyEvents

  summary.metrics = [
    {
      change: `${formatNumber(clubs.filter(club => club.status === 'active').length)} recently listed`,
      id: 'clubs',
      label: 'Total Clubs',
      tone: 'primary',
      value: formatNumber(totalClubs)
    },
    {
      change: 'Active memberships',
      id: 'students',
      label: 'Active Students',
      tone: 'info',
      value: formatNumber(activeStudents)
    },
    {
      change: pendingResources + pendingClubs > 0 ? 'Needs review' : 'No approvals waiting',
      id: 'approvals',
      label: 'Pending Approvals',
      tone: pendingResources + pendingClubs > 0 ? 'warning' : 'success',
      value: formatNumber(pendingResources + pendingClubs)
    },
    {
      change: 'Memberships, posts, and events',
      id: 'engagement',
      label: 'Monthly Engagement',
      tone: 'success',
      value: formatNumber(monthlyActivity)
    }
  ]

  summary.panels = [
    createPanel(
      'approvals',
      'Approval Queue',
      'No approvals waiting',
      'Club creation and resource approvals will appear here.',
      resourceQueue.map(request => ({
        description: request.details.description,
        id: request._id.toString(),
        meta: request.createdAt.toDateString(),
        status: request.status,
        title: request.details.title,
        tone: request.type === 'funding' ? 'warning' : 'info'
      }))
    ),
    createPanel(
      'clubs',
      'Club Status',
      'No clubs created yet',
      'Registered clubs and standing will appear here.',
      clubs.map(club => ({
        description: club.category,
        id: club._id.toString(),
        meta: club.updatedAt.toDateString(),
        status: club.status,
        title: club.name,
        tone:
          club.status === 'active' ? 'success' : club.status === 'pending' ? 'warning' : 'danger'
      }))
    )
  ]

  return summary
}

export async function getDashboardSummary(user: UserDto): Promise<DashboardSummary> {
  if (user.role === USER_ROLES.clubExecutive) {
    return getExecutiveDashboardSummary(user)
  }

  if (user.role === USER_ROLES.universityAdmin) {
    return getAdminDashboardSummary(user)
  }

  return getStudentDashboardSummary(user)
}
