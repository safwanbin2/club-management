import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import { CAPABILITIES, roleHasCapability } from '../../constants/capabilities.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { EventModel } from '../event/event.model.js'
import type { Event } from '../event/event.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { ClubModel } from './club.model.js'
import type {
  Club,
  ClubDetailDto,
  ClubListItemDto,
  ClubListResult,
  ClubMemberDto,
  ClubMemberListResult,
  ClubMemberUserDto,
  ClubMembershipDto,
  ClubMembershipRequestDto,
  ClubMembershipRequestListResult
} from './club.types.js'
import type {
  ClubListQuery,
  ClubMembersQuery,
  ClubMembershipRequestsQuery,
  CreateClubInput,
  ReviewMembershipInput,
  UpdateClubInput,
  UpdateMembershipRoleInput
} from './club.validation.js'

type ClubLean = Club & {
  _id: Types.ObjectId
}

type MembershipLean = Membership & {
  _id: Types.ObjectId
}

type UserLean = User & {
  _id: Types.ObjectId
}

type EventLean = Event & {
  _id: Types.ObjectId
}

type MembershipRequestPlan =
  | {
      kind: 'create-or-reopen'
      updates: Partial<Membership>
    }
  | {
      kind: 'already-pending'
    }

type ClubWriteInput = Omit<CreateClubInput, 'status'> | Omit<UpdateClubInput, 'status'>

const defaultPagination = {
  currentPage: 1,
  currentTotal: 0,
  data: [],
  lastPage: 1,
  perPage: 10,
  total: 0
} satisfies PaginatedResult<unknown>

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value)
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeNullableText(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeStringList(values: (string | undefined)[] | undefined) {
  return values?.map(value => value?.trim() ?? '').filter(Boolean) ?? []
}

function normalizeSocialLinks(input: ClubWriteInput['socialLinks']) {
  const socialLinks: Club['socialLinks'] = {}

  if (!input) {
    return socialLinks
  }

  for (const key of ['facebook', 'instagram', 'linkedin', 'website'] as const) {
    const value = normalizeOptionalText(input[key])

    if (value) {
      socialLinks[key] = value
    }
  }

  return socialLinks
}

function getPagination<TItem>(
  data: TItem[],
  total: number,
  page: number,
  perPage: number
): PaginatedResult<TItem> {
  return {
    currentPage: page,
    currentTotal: data.length,
    data,
    lastPage: Math.max(Math.ceil(total / perPage), 1),
    perPage,
    total
  }
}

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString() : null
}

function toMembershipDto(membership: MembershipLean): ClubMembershipDto {
  return {
    approvedAt: formatDate(membership.approvedAt),
    clubId: membership.club.toString(),
    clubRole: membership.clubRole,
    executivePosition: membership.executivePosition ?? null,
    feeStatus: membership.feeStatus,
    id: membership._id.toString(),
    leftAt: formatDate(membership.leftAt),
    rejectedAt: formatDate(membership.rejectedAt),
    remarks: membership.remarks ?? null,
    requestedAt: membership.requestedAt.toISOString(),
    reviewedBy: membership.reviewedBy ? membership.reviewedBy.toString() : null,
    status: membership.status,
    userId: membership.user.toString()
  }
}

function toMemberUserDto(user: UserLean): ClubMemberUserDto {
  return {
    avatarUrl: user.avatarUrl ?? null,
    department: user.department ?? null,
    email: user.email,
    id: user._id.toString(),
    name: user.name,
    studentId: user.studentId ?? null
  }
}

function toEventPreviewDto(event: EventLean) {
  return {
    endsAt: event.endsAt.toISOString(),
    id: event._id.toString(),
    registrationDeadline: event.registrationDeadline.toISOString(),
    startsAt: event.startsAt.toISOString(),
    status: event.status,
    title: event.title,
    venue: event.venue
  }
}

export function createClubSlug(value: string) {
  const slug = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'club'
}

export function buildClubWritePayload(input: ClubWriteInput): Partial<Club> {
  const payload: Partial<Club> = {}

  if (input.name !== undefined) {
    payload.name = input.name.trim()
  }

  if (input.description !== undefined) {
    payload.description = input.description.trim()
  }

  if (input.category !== undefined) {
    payload.category = input.category
  }

  if (input.facultyAdvisor !== undefined) {
    payload.facultyAdvisor = {
      name: input.facultyAdvisor.name.trim()
    }

    const department = normalizeOptionalText(input.facultyAdvisor.department)
    const email = normalizeOptionalText(input.facultyAdvisor.email)

    if (department) {
      payload.facultyAdvisor.department = department
    }

    if (email) {
      payload.facultyAdvisor.email = email
    }
  }

  if (input.contactEmail !== undefined) {
    payload.contactEmail = normalizeNullableText(input.contactEmail)
  }

  if (input.contactPhone !== undefined) {
    payload.contactPhone = normalizeNullableText(input.contactPhone)
  }

  if (input.logoUrl !== undefined) {
    payload.logoUrl = normalizeNullableText(input.logoUrl)
  }

  if (input.coverImageUrl !== undefined) {
    payload.coverImageUrl = normalizeNullableText(input.coverImageUrl)
  }

  if (input.gallery !== undefined) {
    payload.gallery = normalizeStringList(input.gallery)
  }

  if (input.socialLinks !== undefined) {
    payload.socialLinks = normalizeSocialLinks(input.socialLinks)
  }

  return payload
}

async function createUniqueClubSlug(name: string) {
  const baseSlug = createClubSlug(name)
  let slug = baseSlug
  let suffix = 2

  while (await ClubModel.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

function createClubDto(input: {
  actorCanManage: boolean
  club: ClubLean
  currentMembership: MembershipLean | null
  memberCount: number
  pendingRequestCount: number
}): ClubListItemDto {
  return {
    canManage: input.actorCanManage,
    category: input.club.category,
    contactEmail: input.club.contactEmail ?? null,
    coverImageUrl: input.club.coverImageUrl ?? null,
    currentUserMembership: input.currentMembership
      ? toMembershipDto(input.currentMembership)
      : null,
    description: input.club.description,
    facultyAdvisor: input.club.facultyAdvisor,
    id: input.club._id.toString(),
    logoUrl: input.club.logoUrl ?? null,
    memberCount: input.memberCount,
    name: input.club.name,
    pendingRequestCount: input.pendingRequestCount,
    slug: input.club.slug,
    status: input.club.status
  }
}

function createClubDetailDto(input: {
  actorCanManage: boolean
  activeMemberCount: number
  club: ClubLean
  currentMembership: MembershipLean | null
  executiveMemberships: MembershipLean[]
  pendingRequestCount: number
  upcomingEvents: EventLean[]
  usersById: Map<string, UserLean>
}): ClubDetailDto {
  return {
    ...createClubDto({
      actorCanManage: input.actorCanManage,
      club: input.club,
      currentMembership: input.currentMembership,
      memberCount: input.activeMemberCount,
      pendingRequestCount: input.pendingRequestCount
    }),
    contactPhone: input.club.contactPhone ?? null,
    executiveCommittee: input.executiveMemberships
      .map(membership => {
        const user = input.usersById.get(membership.user.toString())

        if (!user) {
          return null
        }

        return {
          ...toMembershipDto(membership),
          user: toMemberUserDto(user)
        }
      })
      .filter((membership): membership is NonNullable<typeof membership> => Boolean(membership)),
    gallery: input.club.gallery,
    membershipSummary: {
      active: input.activeMemberCount,
      pending: input.pendingRequestCount
    },
    socialLinks: input.club.socialLinks,
    upcomingEvents: input.upcomingEvents.map(toEventPreviewDto)
  }
}

function mapCounts(rows: { _id: Types.ObjectId; count: number }[]) {
  return new Map(rows.map(row => [row._id.toString(), row.count]))
}

async function countMemberships(clubIds: Types.ObjectId[], status: Membership['status']) {
  if (clubIds.length === 0) {
    return new Map<string, number>()
  }

  const rows = (await MembershipModel.aggregate([
    {
      $match: {
        club: { $in: clubIds },
        status
      }
    },
    {
      $group: {
        _id: '$club',
        count: { $sum: 1 }
      }
    }
  ])) as { _id: Types.ObjectId; count: number }[]

  return mapCounts(rows)
}

async function getCurrentMemberships(actor: UserDto, clubIds: Types.ObjectId[]) {
  if (clubIds.length === 0) {
    return new Map<string, MembershipLean>()
  }

  const memberships = (await MembershipModel.find({
    club: { $in: clubIds },
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return new Map(memberships.map(membership => [membership.club.toString(), membership]))
}

async function getManageableClubIds(actor: UserDto, clubIds: Types.ObjectId[]) {
  if (clubIds.length === 0) {
    return new Set<string>()
  }

  if (isUniversityAdmin(actor)) {
    return new Set(clubIds.map(clubId => clubId.toString()))
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.membershipsApproveClub)) {
    return new Set<string>()
  }

  const managedMemberships = (await MembershipModel.find({
    club: { $in: clubIds },
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return new Set(managedMemberships.map(membership => membership.club.toString()))
}

async function applyMembershipStatusFilter(
  filter: FilterQuery<Club>,
  actor: UserDto,
  membershipStatus?: ClubListQuery['membershipStatus']
) {
  if (!membershipStatus) {
    return filter
  }

  const userMemberships = (await MembershipModel.find({ user: toObjectId(actor.id) }).lean()) as
    MembershipLean[] | []

  if (membershipStatus === 'none') {
    filter._id = {
      ...((typeof filter._id === 'object' && filter._id !== null ? filter._id : {}) as object),
      $nin: userMemberships.map(membership => membership.club)
    }
    return filter
  }

  filter._id = {
    ...((typeof filter._id === 'object' && filter._id !== null ? filter._id : {}) as object),
    $in: userMemberships
      .filter(membership => membership.status === membershipStatus)
      .map(membership => membership.club)
  }

  return filter
}

function buildClubFilter(query: ClubListQuery, actor: UserDto): FilterQuery<Club> {
  const filter: FilterQuery<Club> = {
    deletedAt: null
  }

  if (isUniversityAdmin(actor)) {
    if (query.status) {
      filter.status = query.status
    }
  } else {
    filter.status = 'active'
  }

  if (query.category) {
    filter.category = query.category
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i')
    filter.$or = [
      { name: regex },
      { description: regex },
      { 'facultyAdvisor.name': regex },
      { category: regex }
    ]
  }

  return filter
}

async function findVisibleClubByIdentifier(identifier: string, actor: UserDto) {
  const filter: FilterQuery<Club> = {
    deletedAt: null,
    ...(isObjectId(identifier) ? { _id: toObjectId(identifier) } : { slug: identifier })
  }

  if (!isUniversityAdmin(actor)) {
    filter.status = 'active'
  }

  const club = (await ClubModel.findOne(filter).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

export function getMembershipRequestPlan(
  existingMembership: Pick<Membership, 'clubRole' | 'status'> | null,
  requestedAt = new Date()
): MembershipRequestPlan {
  if (!existingMembership) {
    return {
      kind: 'create-or-reopen',
      updates: {
        approvedAt: null,
        clubRole: 'member',
        executivePosition: null,
        feeStatus: 'not_required',
        leftAt: null,
        rejectedAt: null,
        remarks: null,
        requestedAt,
        reviewedBy: null,
        status: 'pending'
      }
    }
  }

  if (existingMembership.status === 'pending') {
    return {
      kind: 'already-pending'
    }
  }

  if (existingMembership.status === 'active') {
    throw new ApplicationError('You are already a member of this club.', 409, 'ALREADY_MEMBER')
  }

  return {
    kind: 'create-or-reopen',
    updates: {
      approvedAt: null,
      clubRole: 'member',
      executivePosition: null,
      feeStatus: 'not_required',
      leftAt: null,
      rejectedAt: null,
      remarks: null,
      requestedAt,
      reviewedBy: null,
      status: 'pending'
    }
  }
}

export function assertMembershipCanLeave(membership: Pick<Membership, 'clubRole' | 'status'>) {
  if (!['active', 'pending'].includes(membership.status)) {
    throw new ApplicationError('There is no active membership request to leave.', 409, 'NOT_MEMBER')
  }

  if (membership.status === 'active' && ['advisor', 'executive'].includes(membership.clubRole)) {
    throw new ApplicationError(
      'Executive assignments must be transferred before leaving this club.',
      409,
      'EXECUTIVE_ASSIGNMENT_REQUIRED'
    )
  }
}

export function getMembershipRoleUpdatePlan(
  membership: Pick<Membership, 'clubRole' | 'executivePosition' | 'status'>,
  input: UpdateMembershipRoleInput
): Pick<Membership, 'clubRole' | 'executivePosition'> {
  if (membership.status !== 'active') {
    throw new ApplicationError(
      'Only active club members can receive role changes.',
      409,
      'MEMBERSHIP_NOT_ACTIVE'
    )
  }

  if (input.clubRole === 'member') {
    return {
      clubRole: 'member',
      executivePosition: null
    }
  }

  const executivePosition = input.executivePosition?.trim()

  if (!executivePosition) {
    throw new ApplicationError(
      'Executive position is required for club leadership roles.',
      422,
      'EXECUTIVE_POSITION_REQUIRED'
    )
  }

  return {
    clubRole: input.clubRole,
    executivePosition
  }
}

export async function canActorManageClub(actor: UserDto, clubId: Types.ObjectId) {
  if (isUniversityAdmin(actor)) {
    return true
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.membershipsApproveClub)) {
    return false
  }

  const membership = await MembershipModel.exists({
    club: clubId,
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  })

  return Boolean(membership)
}

async function assertActorCanManageClub(actor: UserDto, clubId: Types.ObjectId) {
  if (await canActorManageClub(actor, clubId)) {
    return
  }

  throw new ApplicationError('You cannot manage membership for this club.', 403, 'FORBIDDEN')
}

export async function createClub(input: CreateClubInput, actor: UserDto) {
  if (!roleHasCapability(actor.role, CAPABILITIES.clubsCreate)) {
    throw new ApplicationError('You cannot create clubs.', 403, 'FORBIDDEN')
  }

  const payload = buildClubWritePayload(input)
  const createdClub = await ClubModel.create({
    ...payload,
    createdBy: toObjectId(actor.id),
    deletedAt: null,
    disabledAt: input.status === 'disabled' ? new Date() : null,
    slug: await createUniqueClubSlug(input.name),
    status: input.status
  })

  return getClubDetail(createdClub._id.toString(), actor)
}

export async function updateClub(identifier: string, input: UpdateClubInput, actor: UserDto) {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  await assertActorCanManageClub(actor, club._id)

  if (input.status !== undefined && !isUniversityAdmin(actor)) {
    throw new ApplicationError(
      'Only university administrators can change club status.',
      403,
      'FORBIDDEN'
    )
  }

  const payload = buildClubWritePayload(input)

  if (input.status !== undefined) {
    payload.status = input.status
    payload.disabledAt = input.status === 'disabled' ? new Date() : null
  }

  const updatedClub = (await ClubModel.findByIdAndUpdate(
    club._id,
    {
      $set: payload
    },
    { new: true }
  ).lean()) as ClubLean | null

  if (!updatedClub) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return getClubDetail(updatedClub._id.toString(), actor)
}

export async function listClubs(query: ClubListQuery, actor: UserDto): Promise<ClubListResult> {
  const filter = await applyMembershipStatusFilter(
    buildClubFilter(query, actor),
    actor,
    query.membershipStatus
  )
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1
  const skip = (query.page - 1) * query.perPage

  const [total, clubs] = await Promise.all([
    ClubModel.countDocuments(filter),
    ClubModel.find(filter)
      .sort({ [query.sortBy]: sortDirection, _id: 1 })
      .skip(skip)
      .limit(query.perPage)
      .lean()
  ])

  const clubRows = clubs as ClubLean[]
  const clubIds = clubRows.map(club => club._id)

  if (clubRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as ClubListResult
  }

  const [activeCounts, pendingCounts, currentMemberships, manageableClubIds] = await Promise.all([
    countMemberships(clubIds, 'active'),
    countMemberships(clubIds, 'pending'),
    getCurrentMemberships(actor, clubIds),
    getManageableClubIds(actor, clubIds)
  ])

  return getPagination(
    clubRows.map(club =>
      createClubDto({
        actorCanManage: manageableClubIds.has(club._id.toString()),
        club,
        currentMembership: currentMemberships.get(club._id.toString()) ?? null,
        memberCount: activeCounts.get(club._id.toString()) ?? 0,
        pendingRequestCount: pendingCounts.get(club._id.toString()) ?? 0
      })
    ),
    total,
    query.page,
    query.perPage
  )
}

export async function getClubDetail(identifier: string, actor: UserDto): Promise<ClubDetailDto> {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  const clubId = club._id
  const now = new Date()

  const [
    activeMemberCount,
    pendingRequestCount,
    currentMembership,
    actorCanManage,
    executiveMemberships,
    upcomingEvents
  ] = await Promise.all([
    MembershipModel.countDocuments({ club: clubId, status: 'active' }),
    MembershipModel.countDocuments({ club: clubId, status: 'pending' }),
    MembershipModel.findOne({ club: clubId, user: toObjectId(actor.id) }).lean(),
    canActorManageClub(actor, clubId),
    MembershipModel.find({
      club: clubId,
      clubRole: { $in: ['advisor', 'executive'] },
      status: 'active'
    })
      .sort({ clubRole: 1, executivePosition: 1, approvedAt: 1 })
      .lean(),
    EventModel.find({
      club: clubId,
      deletedAt: null,
      startsAt: { $gte: now },
      status: 'published'
    })
      .sort({ startsAt: 1 })
      .limit(3)
      .lean()
  ])

  const executiveRows = executiveMemberships as MembershipLean[]
  const users = (await UserModel.find({
    _id: { $in: executiveRows.map(membership => membership.user) },
    deletedAt: null
  }).lean()) as UserLean[]
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return createClubDetailDto({
    actorCanManage,
    activeMemberCount,
    club,
    currentMembership: currentMembership as MembershipLean | null,
    executiveMemberships: executiveRows,
    pendingRequestCount,
    upcomingEvents: upcomingEvents as EventLean[],
    usersById
  })
}

async function assertActorCanViewClubMembers(actor: UserDto, clubId: Types.ObjectId) {
  if (await canActorManageClub(actor, clubId)) {
    return
  }

  const membership = await MembershipModel.exists({
    club: clubId,
    status: 'active',
    user: toObjectId(actor.id)
  })

  if (!membership) {
    throw new ApplicationError(
      'Only active club members can view this member list.',
      403,
      'FORBIDDEN'
    )
  }
}

function createClubMemberDto(
  membership: MembershipLean,
  usersById: Map<string, UserLean>
): ClubMemberDto | null {
  const user = usersById.get(membership.user.toString())

  if (!user) {
    return null
  }

  return {
    ...toMembershipDto(membership),
    user: toMemberUserDto(user)
  }
}

export async function listClubMembers(
  identifier: string,
  query: ClubMembersQuery,
  actor: UserDto
): Promise<ClubMemberListResult> {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  await assertActorCanViewClubMembers(actor, club._id)

  const filter: FilterQuery<Membership> = {
    club: club._id,
    status: 'active'
  }

  if (query.role) {
    filter.clubRole = query.role
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i')
    const matchingUsers = (await UserModel.find({
      deletedAt: null,
      $or: [{ name: regex }, { email: regex }, { studentId: regex }, { department: regex }]
    })
      .select('_id')
      .lean()) as UserLean[]

    if (matchingUsers.length === 0) {
      return {
        ...defaultPagination,
        currentPage: query.page,
        perPage: query.perPage
      } as ClubMemberListResult
    }

    filter.user = { $in: matchingUsers.map(user => user._id) }
  }

  const skip = (query.page - 1) * query.perPage
  const [total, memberships] = await Promise.all([
    MembershipModel.countDocuments(filter),
    MembershipModel.find(filter)
      .sort({ clubRole: 1, approvedAt: -1, _id: 1 })
      .skip(skip)
      .limit(query.perPage)
      .lean()
  ])
  const membershipRows = memberships as MembershipLean[]
  const users = (await UserModel.find({
    _id: { $in: membershipRows.map(membership => membership.user) },
    deletedAt: null
  }).lean()) as UserLean[]
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return getPagination(
    membershipRows
      .map(membership => createClubMemberDto(membership, usersById))
      .filter((membership): membership is ClubMemberDto => Boolean(membership)),
    total,
    query.page,
    query.perPage
  )
}

export async function requestMembership(identifier: string, actor: UserDto) {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  const userId = toObjectId(actor.id)
  const existingMembership = (await MembershipModel.findOne({
    club: club._id,
    user: userId
  }).lean()) as MembershipLean | null
  const plan = getMembershipRequestPlan(existingMembership)

  if (plan.kind === 'already-pending') {
    if (!existingMembership) {
      throw new ApplicationError('Membership request not found.', 404, 'MEMBERSHIP_NOT_FOUND')
    }

    return toMembershipDto(existingMembership)
  }

  const membership = (await MembershipModel.findOneAndUpdate(
    { club: club._id, user: userId },
    {
      $set: plan.updates,
      $setOnInsert: {
        club: club._id,
        user: userId
      }
    },
    {
      new: true,
      setDefaultsOnInsert: true,
      upsert: true
    }
  ).lean()) as MembershipLean

  return toMembershipDto(membership)
}

export async function leaveClub(identifier: string, actor: UserDto) {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  const membership = (await MembershipModel.findOne({
    club: club._id,
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean | null

  if (!membership) {
    throw new ApplicationError('There is no membership to leave.', 404, 'MEMBERSHIP_NOT_FOUND')
  }

  assertMembershipCanLeave(membership)

  const updatedMembership = (await MembershipModel.findByIdAndUpdate(
    membership._id,
    {
      $set: {
        leftAt: new Date(),
        status: 'left'
      }
    },
    { new: true }
  ).lean()) as MembershipLean

  return toMembershipDto(updatedMembership)
}

function createMembershipRequestDto(
  membership: MembershipLean,
  usersById: Map<string, UserLean>
): ClubMembershipRequestDto | null {
  const user = usersById.get(membership.user.toString())

  if (!user) {
    return null
  }

  return {
    ...toMembershipDto(membership),
    user: toMemberUserDto(user)
  }
}

export async function listMembershipRequests(
  identifier: string,
  query: ClubMembershipRequestsQuery,
  actor: UserDto
): Promise<ClubMembershipRequestListResult> {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  await assertActorCanManageClub(actor, club._id)

  const filter: FilterQuery<Membership> = {
    club: club._id,
    status: query.status
  }
  const skip = (query.page - 1) * query.perPage
  const [total, memberships] = await Promise.all([
    MembershipModel.countDocuments(filter),
    MembershipModel.find(filter)
      .sort({ requestedAt: -1, _id: 1 })
      .skip(skip)
      .limit(query.perPage)
      .lean()
  ])
  const membershipRows = memberships as MembershipLean[]
  const users = (await UserModel.find({
    _id: { $in: membershipRows.map(membership => membership.user) },
    deletedAt: null
  }).lean()) as UserLean[]
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return getPagination(
    membershipRows
      .map(membership => createMembershipRequestDto(membership, usersById))
      .filter((membership): membership is ClubMembershipRequestDto => Boolean(membership)),
    total,
    query.page,
    query.perPage
  )
}

export async function reviewMembershipRequest(
  identifier: string,
  membershipId: string,
  input: ReviewMembershipInput,
  actor: UserDto
) {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  await assertActorCanManageClub(actor, club._id)

  if (!isObjectId(membershipId)) {
    throw new ApplicationError('Membership request not found.', 404, 'MEMBERSHIP_NOT_FOUND')
  }

  const membership = (await MembershipModel.findOne({
    _id: toObjectId(membershipId),
    club: club._id
  }).lean()) as MembershipLean | null

  if (!membership) {
    throw new ApplicationError('Membership request not found.', 404, 'MEMBERSHIP_NOT_FOUND')
  }

  if (membership.status !== 'pending') {
    throw new ApplicationError(
      'Only pending membership requests can be reviewed.',
      409,
      'MEMBERSHIP_NOT_PENDING'
    )
  }

  const now = new Date()
  const updatedMembership = (await MembershipModel.findByIdAndUpdate(
    membership._id,
    {
      $set: {
        approvedAt: input.action === 'approve' ? now : null,
        clubRole: input.action === 'approve' ? 'member' : membership.clubRole,
        rejectedAt: input.action === 'reject' ? now : null,
        remarks: input.remarks ?? null,
        reviewedBy: toObjectId(actor.id),
        status: input.action === 'approve' ? 'active' : 'rejected'
      }
    },
    { new: true }
  ).lean()) as MembershipLean

  const user = (await UserModel.findById(updatedMembership.user).lean()) as UserLean | null

  if (!user) {
    throw new ApplicationError('Membership user not found.', 404, 'USER_NOT_FOUND')
  }

  return createMembershipRequestDto(updatedMembership, new Map([[user._id.toString(), user]]))
}

export async function updateMembershipRole(
  identifier: string,
  membershipId: string,
  input: UpdateMembershipRoleInput,
  actor: UserDto
) {
  const club = await findVisibleClubByIdentifier(identifier, actor)
  await assertActorCanManageClub(actor, club._id)

  if (!isObjectId(membershipId)) {
    throw new ApplicationError('Membership not found.', 404, 'MEMBERSHIP_NOT_FOUND')
  }

  const membership = (await MembershipModel.findOne({
    _id: toObjectId(membershipId),
    club: club._id
  }).lean()) as MembershipLean | null

  if (!membership) {
    throw new ApplicationError('Membership not found.', 404, 'MEMBERSHIP_NOT_FOUND')
  }

  const updates = getMembershipRoleUpdatePlan(membership, input)
  const updatedMembership = (await MembershipModel.findByIdAndUpdate(
    membership._id,
    { $set: updates },
    { new: true }
  ).lean()) as MembershipLean
  const user = (await UserModel.findById(updatedMembership.user).lean()) as UserLean | null

  if (!user) {
    throw new ApplicationError('Membership user not found.', 404, 'USER_NOT_FOUND')
  }

  return createClubMemberDto(updatedMembership, new Map([[user._id.toString(), user]]))
}
