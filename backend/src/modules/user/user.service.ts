import type { Types } from 'mongoose'
import mongoose from 'mongoose'

import { USER_ROLES } from '../../constants/roles.js'
import { ApplicationError } from '../../utils/application-error.js'
import { hashPassword, verifyPassword } from '../auth/password.service.js'
import { AttendanceModel } from '../attendance/attendance.model.js'
import { BadgeModel } from '../badge/badge.model.js'
import type { Badge } from '../badge/badge.types.js'
import { ClubModel } from '../club/club.model.js'
import type { Club } from '../club/club.types.js'
import { EventRegistrationModel } from '../event/event-registration.model.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import { NotificationModel } from '../notification/notification.model.js'
import type { Notification } from '../notification/notification.types.js'
import { UserModel, toUserDto, type User, type UserDocument } from './user.model.js'
import type { UserDto } from './user.types.js'
import type {
  AccountSettingsDto,
  BadgePlan,
  BadgeRuleStats,
  ProfileActivityDto,
  ProfileBadgeDto,
  ProfileClubDto,
  UserProfileDto
} from './user-profile.types.js'
import type {
  ChangePasswordInput,
  UpdateAccountSettingsInput,
  UpdateOwnProfileInput
} from './user.validation.js'

type BadgeLean = Badge & {
  _id: Types.ObjectId
}

type ClubLean = Club & {
  _id: Types.ObjectId
}

type MembershipLean = Membership & {
  _id: Types.ObjectId
}

type NotificationLean = Notification & {
  _id: Types.ObjectId
}

type UserLean = User & {
  _id: Types.ObjectId
}

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value)
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

function toProfileBadgeDto(badge: BadgeLean): ProfileBadgeDto {
  return {
    badgeType: badge.badgeType,
    description: badge.description,
    earnedAt: badge.earnedAt.toISOString(),
    icon: badge.icon,
    id: badge._id.toString(),
    title: badge.title
  }
}

function toProfileClubDto(membership: MembershipLean, club: ClubLean): ProfileClubDto {
  return {
    category: club.category,
    clubRole: membership.clubRole,
    executivePosition: membership.executivePosition ?? null,
    id: club._id.toString(),
    logoUrl: club.logoUrl ?? null,
    name: club.name,
    slug: club.slug
  }
}

export function getBadgePlans(stats: BadgeRuleStats): BadgePlan[] {
  const plans: BadgePlan[] = []

  if (stats.activeMemberships > 0) {
    plans.push({
      badgeType: 'first_club_joined',
      description: 'Awarded for joining the first campus club.',
      icon: 'badge-check',
      sourceActivityId: 'first-active-membership',
      title: 'First Club Joined'
    })
  }

  if (stats.attendanceCount > 0) {
    plans.push({
      badgeType: 'event_explorer',
      description: 'Awarded for checking in to a campus event.',
      icon: 'calendar-check',
      sourceActivityId: 'first-attendance',
      title: 'Event Explorer'
    })
  }

  if (stats.executiveMemberships > 0) {
    plans.push({
      badgeType: 'executive_member',
      description: 'Awarded for serving in a club leadership role.',
      icon: 'shield-star',
      sourceActivityId: 'executive-membership',
      title: 'Executive Member'
    })
  }

  if (stats.communityMemberships > 0) {
    plans.push({
      badgeType: 'volunteer',
      description: 'Awarded for joining a community service organization.',
      icon: 'hand-heart',
      sourceActivityId: 'community-service-membership',
      title: 'Volunteer'
    })
  }

  if (stats.registeredEvents > 0 && stats.attendanceCount >= stats.registeredEvents) {
    plans.push({
      badgeType: 'perfect_attendance',
      description: 'Awarded for attending every registered event so far.',
      icon: 'award',
      sourceActivityId: 'registered-attendance-ratio',
      title: 'Perfect Attendance'
    })
  }

  if (stats.executiveMemberships > 0 && stats.attendanceCount > 0 && stats.activeMemberships > 1) {
    plans.push({
      badgeType: 'community_leader',
      description: 'Awarded for leadership with sustained campus participation.',
      icon: 'users-round',
      sourceActivityId: 'leadership-participation',
      title: 'Community Leader'
    })
  }

  return plans
}

async function ensureBadges(userId: Types.ObjectId, stats: BadgeRuleStats) {
  for (const plan of getBadgePlans(stats)) {
    const existingBadge = await BadgeModel.exists({
      badgeType: plan.badgeType,
      sourceActivityId: plan.sourceActivityId,
      user: userId
    })

    if (existingBadge) {
      continue
    }

    await BadgeModel.create({
      badgeType: plan.badgeType,
      description: plan.description,
      earnedAt: new Date(),
      icon: plan.icon,
      metadata: {},
      sourceActivityId: plan.sourceActivityId,
      title: plan.title,
      user: userId
    })

    await NotificationModel.create({
      body: `You earned the ${plan.title} badge.`,
      link: '/profile',
      metadata: {
        badgeType: plan.badgeType
      },
      readAt: null,
      recipient: userId,
      title: 'Badge earned',
      type: 'badge_earned'
    })
  }
}

async function findUser(userId: string) {
  if (!isObjectId(userId)) {
    throw new ApplicationError('User not found.', 404, 'USER_NOT_FOUND')
  }

  const user = (await UserModel.findOne({
    _id: toObjectId(userId),
    deletedAt: null,
    status: 'active'
  }).lean()) as UserLean | null

  if (!user) {
    throw new ApplicationError('User not found.', 404, 'USER_NOT_FOUND')
  }

  return user
}

async function getProfileStats(userId: Types.ObjectId, memberships: MembershipLean[]) {
  const activeMemberships = memberships.filter(membership => membership.status === 'active')
  const [registeredEvents, attendanceCount] = await Promise.all([
    EventRegistrationModel.countDocuments({
      status: 'registered',
      user: userId
    }),
    AttendanceModel.countDocuments({
      user: userId
    })
  ])
  const clubRows = (await ClubModel.find({
    _id: { $in: activeMemberships.map(membership => membership.club) },
    deletedAt: null
  }).lean()) as ClubLean[]
  const clubsById = new Map(clubRows.map(club => [club._id.toString(), club]))

  return {
    activeMemberships: activeMemberships.length,
    attendanceCount,
    clubsById,
    communityMemberships: activeMemberships.filter(membership => {
      const club = clubsById.get(membership.club.toString())
      return club?.category === 'community_service'
    }).length,
    executiveMemberships: activeMemberships.filter(membership =>
      ['advisor', 'executive'].includes(membership.clubRole)
    ).length,
    registeredEvents
  }
}

async function createActivityTimeline(userId: Types.ObjectId): Promise<ProfileActivityDto[]> {
  const [badges, notifications] = await Promise.all([
    BadgeModel.find({ user: userId }).sort({ earnedAt: -1 }).limit(5).lean(),
    NotificationModel.find({ recipient: userId }).sort({ createdAt: -1 }).limit(5).lean()
  ])

  return [
    ...(badges as BadgeLean[]).map(badge => ({
      at: badge.earnedAt.toISOString(),
      description: badge.description,
      id: `badge-${badge._id.toString()}`,
      title: badge.title,
      type: 'badge' as const
    })),
    ...(notifications as NotificationLean[]).map(notification => ({
      at: notification.createdAt.toISOString(),
      description: notification.body,
      id: `notification-${notification._id.toString()}`,
      title: notification.title,
      type: 'notification' as const
    }))
  ]
    .sort((first, second) => new Date(second.at).getTime() - new Date(first.at).getTime())
    .slice(0, 10)
}

export async function getUserProfile(userId: string, actor: UserDto): Promise<UserProfileDto> {
  const user = await findUser(userId)
  const isOwnProfile = user._id.toString() === actor.id

  if (!isOwnProfile && user.profileVisibility === 'private' && !isUniversityAdmin(actor)) {
    throw new ApplicationError('Profile is private.', 403, 'PROFILE_PRIVATE')
  }

  const memberships = (await MembershipModel.find({
    status: 'active',
    user: user._id
  }).lean()) as MembershipLean[]
  const stats = await getProfileStats(user._id, memberships)

  if (isOwnProfile) {
    await ensureBadges(user._id, stats)
  }

  const [badges, timeline] = await Promise.all([
    BadgeModel.find({ user: user._id }).sort({ earnedAt: -1 }).lean(),
    createActivityTimeline(user._id)
  ])

  const clubs = memberships
    .map(membership => {
      const club = stats.clubsById.get(membership.club.toString())
      return club ? toProfileClubDto(membership, club) : null
    })
    .filter((club): club is ProfileClubDto => Boolean(club))

  return {
    activityTimeline: timeline,
    attendance: {
      attended: stats.attendanceCount,
      percentage:
        stats.registeredEvents > 0
          ? Math.round((stats.attendanceCount / stats.registeredEvents) * 100)
          : 0,
      registered: stats.registeredEvents
    },
    badges: (badges as BadgeLean[]).map(toProfileBadgeDto),
    clubs,
    executivePositions: clubs.filter(club => ['advisor', 'executive'].includes(club.clubRole)),
    isOwnProfile,
    user: {
      avatarUrl: user.avatarUrl ?? null,
      department: user.department ?? null,
      email: isOwnProfile ? user.email : null,
      id: user._id.toString(),
      name: user.name,
      profileVisibility: user.profileVisibility,
      role: user.role,
      status: user.status,
      studentId: user.studentId ?? null
    }
  }
}

export async function getOwnProfile(actor: UserDto) {
  return getUserProfile(actor.id, actor)
}

export async function updateOwnProfile(input: UpdateOwnProfileInput, actor: UserDto) {
  const updatedUser = (await UserModel.findByIdAndUpdate(
    actor.id,
    {
      $set: {
        avatarUrl: input.avatarUrl ?? null,
        department: input.department ?? null,
        name: input.name,
        studentId: input.studentId ?? null
      }
    },
    { new: true }
  )) as UserDocument | null

  if (!updatedUser) {
    throw new ApplicationError('User not found.', 404, 'USER_NOT_FOUND')
  }

  return toUserDto(updatedUser)
}

export async function getAccountSettings(actor: UserDto): Promise<AccountSettingsDto> {
  const user = await findUser(actor.id)
  const notificationPreferences = user.notificationPreferences ?? {
    emailDigest: true,
    eventReminders: true,
    inApp: true,
    membershipUpdates: true
  }

  return {
    email: user.email,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    notificationPreferences,
    profileVisibility: user.profileVisibility
  }
}

export async function updateAccountSettings(input: UpdateAccountSettingsInput, actor: UserDto) {
  const updatedUser = (await UserModel.findByIdAndUpdate(
    actor.id,
    {
      $set: {
        notificationPreferences: input.notificationPreferences,
        profileVisibility: input.profileVisibility
      }
    },
    { new: true }
  )) as UserDocument | null

  if (!updatedUser) {
    throw new ApplicationError('User not found.', 404, 'USER_NOT_FOUND')
  }

  return toUserDto(updatedUser)
}

export async function changePassword(input: ChangePasswordInput, actor: UserDto) {
  const user = (await UserModel.findOne({ _id: actor.id }).select(
    '+passwordHash'
  )) as UserDocument | null

  if (!user) {
    throw new ApplicationError('User not found.', 404, 'USER_NOT_FOUND')
  }

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new ApplicationError('Current password is incorrect.', 422, 'INVALID_PASSWORD')
  }

  user.passwordHash = await hashPassword(input.newPassword)
  await user.save()

  return {
    changed: true
  }
}
