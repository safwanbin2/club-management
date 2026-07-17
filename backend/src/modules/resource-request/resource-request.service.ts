import { Types } from 'mongoose'

import { CAPABILITIES, roleHasCapability } from '../../constants/capabilities.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import type { Club } from '../club/club.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { NotificationType } from '../notification/notification.types.js'
import { NotificationModel } from '../notification/notification.model.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { ResourceRequestModel } from './resource-request.model.js'
import type { ResourceRequest } from './resource-request.types.js'
import type {
  CreateResourceRequestInput,
  ResourceRequestListQuery,
  ReviewResourceRequestInput
} from './resource-request.validation.js'
import type {
  ResourceRequestAnalytics,
  ResourceRequestDto,
  ResourceRequestListResult
} from './resource-request.dto.types.js'

type ClubLean = Club & { _id: Types.ObjectId }
type ResourceRequestLean = ResourceRequest & { _id: Types.ObjectId }
type UserLean = User & { _id: Types.ObjectId }

const defaultPagination = {
  currentPage: 1,
  currentTotal: 0,
  data: [],
  lastPage: 1,
  perPage: 10,
  total: 0
} satisfies PaginatedResult<unknown>

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

function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApplicationError('Invalid identifier.', 400, 'INVALID_ID')
  }

  return new Types.ObjectId(id)
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

function normalizeOptionalText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeRequestDetails(input: CreateResourceRequestInput) {
  return {
    amount: input.type === 'funding' ? input.details.amount : undefined,
    description: input.details.description.trim(),
    requestedDate:
      input.type === 'room_booking' && input.details.requestedDate
        ? new Date(input.details.requestedDate)
        : undefined,
    room: input.type === 'room_booking' ? input.details.room?.trim() : undefined,
    title: input.details.title.trim()
  }
}

function getReviewNotificationType(status: 'approved' | 'rejected'): NotificationType {
  return status === 'approved' ? 'resource_request_approved' : 'resource_request_rejected'
}

export function assertResourceRequestDetails(input: CreateResourceRequestInput) {
  if (input.type === 'funding' && (!input.details.amount || input.details.amount <= 0)) {
    throw new ApplicationError('Funding amount is required.', 422, 'VALIDATION')
  }

  if (input.type === 'room_booking') {
    if (!input.details.room?.trim()) {
      throw new ApplicationError('Room is required for room booking requests.', 422, 'VALIDATION')
    }

    if (!input.details.requestedDate) {
      throw new ApplicationError(
        'Requested date is required for room booking requests.',
        422,
        'VALIDATION'
      )
    }
  }
}

async function getManagedClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    const clubs = (await ClubModel.find({ deletedAt: null, status: 'active' }).lean()) as ClubLean[]
    return clubs.map(club => club._id)
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.resourceRequestsCreateClub)) {
    return []
  }

  const memberships = await MembershipModel.find({
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()

  return memberships.map(membership => membership.club)
}

async function canActorManageClub(actor: UserDto, clubId: Types.ObjectId) {
  if (isUniversityAdmin(actor)) {
    return true
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.resourceRequestsCreateClub)) {
    return false
  }

  return Boolean(
    await MembershipModel.exists({
      club: clubId,
      clubRole: { $in: ['advisor', 'executive'] },
      status: 'active',
      user: toObjectId(actor.id)
    })
  )
}

async function findActiveClub(identifier: string) {
  const club = (await ClubModel.findOne({
    deletedAt: null,
    status: 'active',
    ...(Types.ObjectId.isValid(identifier)
      ? { _id: new Types.ObjectId(identifier) }
      : { slug: identifier })
  }).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club was not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

function toClubDto(club: ClubLean) {
  return {
    category: club.category,
    id: club._id.toString(),
    name: club.name,
    slug: club.slug
  }
}

function toUserDto(user: UserLean | undefined, fallbackId: Types.ObjectId) {
  return {
    email: user?.email ?? '',
    id: user?._id.toString() ?? fallbackId.toString(),
    name: user?.name ?? 'Unknown user'
  }
}

async function createResourceRequestDtos(rows: ResourceRequestLean[], actor: UserDto) {
  const clubIds = [...new Set(rows.map(row => row.club.toString()))].map(
    id => new Types.ObjectId(id)
  )
  const userIds = [
    ...new Set(
      rows.flatMap(row => [row.requestedBy.toString(), row.reviewer?.toString()].filter(Boolean))
    )
  ].map(id => new Types.ObjectId(id))

  const [clubs, users] = await Promise.all([
    ClubModel.find({ _id: { $in: clubIds } }).lean() as Promise<ClubLean[]>,
    UserModel.find({ _id: { $in: userIds } }).lean() as Promise<UserLean[]>
  ])
  const clubsById = new Map(clubs.map(club => [club._id.toString(), club]))
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return rows.map<ResourceRequestDto>(row => {
    const club = clubsById.get(row.club.toString())
    const requestedBy = usersById.get(row.requestedBy.toString())
    const reviewer = row.reviewer ? usersById.get(row.reviewer.toString()) : undefined

    return {
      canReview: isUniversityAdmin(actor),
      club: club
        ? toClubDto(club)
        : {
            category: 'academic',
            id: row.club.toString(),
            name: 'Unknown club',
            slug: row.club.toString()
          },
      createdAt: row.createdAt.toISOString(),
      details: {
        amount: row.details.amount ?? null,
        description: row.details.description,
        requestedDate: row.details.requestedDate?.toISOString() ?? null,
        room: row.details.room ?? null,
        title: row.details.title
      },
      id: row._id.toString(),
      remarks: row.remarks,
      requestedBy: toUserDto(requestedBy, row.requestedBy),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewer: row.reviewer ? toUserDto(reviewer, row.reviewer) : null,
      status: row.status,
      type: row.type,
      updatedAt: row.updatedAt.toISOString()
    }
  })
}

async function getScopedRequestFilter(actor: UserDto, clubId?: string) {
  const selectedClubId = clubId ? toObjectId(clubId) : null

  if (isUniversityAdmin(actor)) {
    return selectedClubId ? { club: selectedClubId } : {}
  }

  const managedClubIds = await getManagedClubIds(actor)

  if (managedClubIds.length === 0) {
    return { club: { $in: [] } }
  }

  if (selectedClubId) {
    const canSeeSelectedClub = managedClubIds.some(
      managedClubId => managedClubId.toString() === selectedClubId.toString()
    )

    return canSeeSelectedClub ? { club: selectedClubId } : { club: { $in: [] } }
  }

  return { club: { $in: managedClubIds } }
}

function getRequestSearchFilter(search: string) {
  if (!search) {
    return {}
  }

  const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  return {
    $or: [
      { 'details.description': pattern },
      { 'details.room': pattern },
      { 'details.title': pattern },
      { remarks: pattern }
    ]
  }
}

export async function listManageableResourceClubs(actor: UserDto) {
  const managedClubIds = await getManagedClubIds(actor)

  if (managedClubIds.length === 0) {
    return []
  }

  const clubs = (await ClubModel.find({
    _id: { $in: managedClubIds },
    deletedAt: null,
    status: 'active'
  })
    .sort({ name: 1 })
    .lean()) as ClubLean[]

  return clubs.map(toClubDto)
}

export async function listResourceRequests(
  query: ResourceRequestListQuery,
  actor: UserDto
): Promise<ResourceRequestListResult> {
  const scopedFilter = await getScopedRequestFilter(actor, query.clubId)
  const filter = {
    ...scopedFilter,
    ...getRequestSearchFilter(query.search),
    ...(query.status === 'all' ? {} : { status: query.status }),
    ...(query.type === 'all' ? {} : { type: query.type })
  }
  const skip = (query.page - 1) * query.perPage
  const [total, rows] = await Promise.all([
    ResourceRequestModel.countDocuments(filter),
    ResourceRequestModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.perPage).lean()
  ])

  if (rows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as ResourceRequestListResult
  }

  return getPagination(
    await createResourceRequestDtos(rows as ResourceRequestLean[], actor),
    total,
    query.page,
    query.perPage
  )
}

export async function getResourceRequestAnalytics(
  actor: UserDto
): Promise<ResourceRequestAnalytics> {
  const scopedFilter = await getScopedRequestFilter(actor)
  const [managedClubIds, total, pending, approved, rejected, fundingPending, roomBookingsPending] =
    await Promise.all([
      getManagedClubIds(actor),
      ResourceRequestModel.countDocuments(scopedFilter),
      ResourceRequestModel.countDocuments({ ...scopedFilter, status: 'pending' }),
      ResourceRequestModel.countDocuments({ ...scopedFilter, status: 'approved' }),
      ResourceRequestModel.countDocuments({ ...scopedFilter, status: 'rejected' }),
      ResourceRequestModel.aggregate<{ total: number }>([
        { $match: { ...scopedFilter, status: 'pending', type: 'funding' } },
        { $group: { _id: null, total: { $sum: '$details.amount' } } }
      ]),
      ResourceRequestModel.countDocuments({
        ...scopedFilter,
        status: 'pending',
        type: 'room_booking'
      })
    ])

  return {
    amountPending: fundingPending[0]?.total ?? 0,
    approved,
    managedClubs: managedClubIds.length,
    pending,
    rejected,
    roomBookingsPending,
    total
  }
}

export async function createResourceRequest(input: CreateResourceRequestInput, actor: UserDto) {
  assertResourceRequestDetails(input)
  const club = await findActiveClub(input.clubId)

  if (!(await canActorManageClub(actor, club._id))) {
    throw new ApplicationError('You cannot submit requests for this club.', 403, 'FORBIDDEN')
  }

  const request = (await ResourceRequestModel.create({
    club: club._id,
    details: normalizeRequestDetails(input),
    remarks: null,
    requestedBy: toObjectId(actor.id),
    reviewedAt: null,
    reviewer: null,
    status: 'pending',
    type: input.type
  })) as ResourceRequestLean

  const admins = await UserModel.find({
    deletedAt: null,
    role: USER_ROLES.universityAdmin,
    status: 'active'
  }).lean()

  await NotificationModel.insertMany(
    admins.map(admin => ({
      body: `${actor.name} submitted ${input.type === 'funding' ? 'a funding' : 'a room booking'} request for ${club.name}.`,
      link: '/resources',
      metadata: {
        clubId: club._id.toString(),
        requestId: request._id.toString(),
        requestType: input.type
      },
      recipient: admin._id,
      title: 'Resource request submitted',
      type: 'resource_request_submitted'
    })),
    { ordered: false }
  )

  const [dto] = await createResourceRequestDtos([request], actor)
  return dto
}

export async function reviewResourceRequest(
  requestId: string,
  input: ReviewResourceRequestInput,
  actor: UserDto
) {
  const existing = (await ResourceRequestModel.findById(
    toObjectId(requestId)
  ).lean()) as ResourceRequestLean | null

  if (!existing) {
    throw new ApplicationError('Resource request was not found.', 404, 'REQUEST_NOT_FOUND')
  }

  const updated = (await ResourceRequestModel.findByIdAndUpdate(
    existing._id,
    {
      $set: {
        remarks: normalizeOptionalText(input.remarks),
        reviewedAt: new Date(),
        reviewer: toObjectId(actor.id),
        status: input.status
      }
    },
    { new: true }
  ).lean()) as ResourceRequestLean | null

  if (!updated) {
    throw new ApplicationError('Resource request was not found.', 404, 'REQUEST_NOT_FOUND')
  }

  await NotificationModel.create({
    body: `Your ${existing.type === 'funding' ? 'funding' : 'room booking'} request "${existing.details.title}" was ${input.status}.`,
    link: '/resources',
    metadata: {
      requestId: updated._id.toString(),
      requestType: existing.type,
      status: input.status
    },
    recipient: updated.requestedBy,
    title: `Resource request ${input.status}`,
    type: getReviewNotificationType(input.status)
  })

  const [dto] = await createResourceRequestDtos([updated], actor)
  return dto
}
