import { USER_ROLES, type UserRole } from './roles.js'

export const CAPABILITIES = {
  assistantChat: 'assistant:chat',
  analyticsClubView: 'analytics:club:view',
  analyticsUniversityView: 'analytics:university:view',
  attendanceCheckIn: 'attendance:check-in',
  attendanceManage: 'attendance:manage',
  attendanceViewOwn: 'attendance:view-own',
  badgesViewOwn: 'badges:view-own',
  chatAccessClub: 'chat:access-club',
  chatModerateClub: 'chat:moderate-club',
  clubsBrowse: 'clubs:browse',
  clubsCreate: 'clubs:create',
  clubsDisable: 'clubs:disable',
  clubsJoin: 'clubs:join',
  clubsLeave: 'clubs:leave',
  clubsManageOwn: 'clubs:manage-own',
  commentsCreate: 'comments:create',
  commentsModerateClub: 'comments:moderate-club',
  eventsManageClub: 'events:manage-club',
  eventsRegister: 'events:register',
  eventsView: 'events:view',
  feedCreateClub: 'feed:create-club',
  feedLike: 'feed:like',
  feedModerateClub: 'feed:moderate-club',
  feedView: 'feed:view',
  membershipsApproveClub: 'memberships:approve-club',
  membershipsViewClub: 'memberships:view-club',
  notificationsViewOwn: 'notifications:view-own',
  pollsCreateClub: 'polls:create-club',
  pollsVote: 'polls:vote',
  profileManageOwn: 'profile:manage-own',
  profilesViewPublic: 'profiles:view-public',
  resourceRequestsApprove: 'resource-requests:approve',
  resourceRequestsCreateClub: 'resource-requests:create-club',
  searchGlobal: 'search:global',
  usersManage: 'users:manage'
} as const

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES]

const studentCapabilities = [
  CAPABILITIES.assistantChat,
  CAPABILITIES.attendanceCheckIn,
  CAPABILITIES.attendanceViewOwn,
  CAPABILITIES.badgesViewOwn,
  CAPABILITIES.chatAccessClub,
  CAPABILITIES.clubsBrowse,
  CAPABILITIES.clubsJoin,
  CAPABILITIES.clubsLeave,
  CAPABILITIES.commentsCreate,
  CAPABILITIES.eventsRegister,
  CAPABILITIES.eventsView,
  CAPABILITIES.feedLike,
  CAPABILITIES.feedView,
  CAPABILITIES.notificationsViewOwn,
  CAPABILITIES.pollsVote,
  CAPABILITIES.profileManageOwn,
  CAPABILITIES.profilesViewPublic,
  CAPABILITIES.searchGlobal
] satisfies Capability[]

const executiveCapabilities = [
  ...studentCapabilities,
  CAPABILITIES.analyticsClubView,
  CAPABILITIES.attendanceManage,
  CAPABILITIES.chatModerateClub,
  CAPABILITIES.clubsManageOwn,
  CAPABILITIES.commentsModerateClub,
  CAPABILITIES.eventsManageClub,
  CAPABILITIES.feedCreateClub,
  CAPABILITIES.feedModerateClub,
  CAPABILITIES.membershipsApproveClub,
  CAPABILITIES.membershipsViewClub,
  CAPABILITIES.pollsCreateClub,
  CAPABILITIES.resourceRequestsCreateClub
] satisfies Capability[]

export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  [USER_ROLES.clubExecutive]: executiveCapabilities,
  [USER_ROLES.student]: studentCapabilities,
  [USER_ROLES.universityAdmin]: [
    ...executiveCapabilities,
    CAPABILITIES.analyticsUniversityView,
    CAPABILITIES.clubsCreate,
    CAPABILITIES.clubsDisable,
    CAPABILITIES.resourceRequestsApprove,
    CAPABILITIES.usersManage
  ]
}

export function roleHasCapability(role: UserRole, capability: Capability) {
  return ROLE_CAPABILITIES[role].includes(capability)
}
