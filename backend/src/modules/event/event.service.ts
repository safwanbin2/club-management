import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import { CAPABILITIES, roleHasCapability } from '../../constants/capabilities.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import { canActorManageClub } from '../club/club.service.js'
import type { Club } from '../club/club.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import { NotificationModel } from '../notification/notification.model.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { EventRegistrationModel } from './event-registration.model.js'
import type { EventRegistration, EventRegistrationStatus } from './event-registration.types.js'
import { EventModel } from './event.model.js'
import type { Event } from './event.types.js'
import type {
  CancelRegistrationInput,
  CreateEventInput,
  EventListQuery,
  EventRegistrationsQuery,
  RegisterEventInput,
  ReviewEventRegistrationInput,
  UpdateEventInput
} from './event.validation.js'
import type {
  EventClubDto,
  EventDto,
  EventListResult,
  EventRegistrationDto,
  EventRegistrationListItemDto,
  EventRegistrationListResult,
  EventUserDto
} from './event.dto.types.js'

type ClubLean = Club & {
  _id: Types.ObjectId
}

type EventLean = Event & {
  _id: Types.ObjectId
}

type EventRegistrationLean = EventRegistration & {
  _id: Types.ObjectId
}

type MembershipLean = Membership & {
  _id: Types.ObjectId
}

type UserLean = User & {
  _id: Types.ObjectId
}

type RegistrationPlacement = {
  status: Extract<EventRegistrationStatus, 'registered' | 'waitlisted'>
  waitlistPosition: null | number
}

type InitialRegistrationPlacement = {
  status: Extract<EventRegistrationStatus, 'pending' | 'registered' | 'waitlisted'>
  waitlistPosition: null | number
}

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

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString() : null
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

function toClubDto(club: ClubLean): EventClubDto {
  return {
    category: club.category,
    id: club._id.toString(),
    logoUrl: club.logoUrl ?? null,
    name: club.name,
    slug: club.slug
  }
}

function toUserDto(user: UserLean): EventUserDto {
  return {
    avatarUrl: user.avatarUrl ?? null,
    department: user.department ?? null,
    email: user.email,
    id: user._id.toString(),
    name: user.name,
    studentId: user.studentId ?? null
  }
}

function toRegistrationDto(registration: EventRegistrationLean): EventRegistrationDto {
  return {
    cancellationReason: registration.cancellationReason ?? null,
    cancelledAt: formatDate(registration.cancelledAt),
    eventId: registration.event.toString(),
    id: registration._id.toString(),
    paymentMethod: registration.paymentMethod ?? null,
    paymentReviewedAt: formatDate(registration.paymentReviewedAt),
    paymentReviewedBy: registration.paymentReviewedBy ? registration.paymentReviewedBy.toString() : null,
    paymentReviewRemarks: registration.paymentReviewRemarks ?? null,
    paymentSubmittedAt: formatDate(registration.paymentSubmittedAt),
    paymentTransactionId: registration.paymentTransactionId ?? null,
    promotedAt: formatDate(registration.promotedAt),
    registeredAt: registration.registeredAt.toISOString(),
    status: registration.status,
    userId: registration.user.toString(),
    waitlistPosition: registration.waitlistPosition ?? null
  }
}

function mapCounts(rows: { _id: Types.ObjectId; count: number }[]) {
  return new Map(rows.map(row => [row._id.toString(), row.count]))
}

export function getRegistrationPlacement(
  registeredCount: number,
  capacity: number,
  waitlistedCount: number
): RegistrationPlacement {
  if (registeredCount < capacity) {
    return {
      status: 'registered',
      waitlistPosition: null
    }
  }

  return {
    status: 'waitlisted',
    waitlistPosition: waitlistedCount + 1
  }
}

export function getInitialRegistrationPlacement(input: {
  capacity: number
  feeAmount: number
  registeredCount: number
  waitlistedCount: number
}): InitialRegistrationPlacement {
  if (input.feeAmount > 0) {
    return {
      status: 'pending',
      waitlistPosition: null
    }
  }

  return getRegistrationPlacement(input.registeredCount, input.capacity, input.waitlistedCount)
}

export function getReviewedRegistrationPlacement(
  registeredCount: number,
  capacity: number,
  waitlistedCount: number
): RegistrationPlacement {
  return getRegistrationPlacement(registeredCount, capacity, waitlistedCount)
}

export function shouldPromoteFromWaitlist(cancelledStatus: EventRegistrationStatus) {
  return cancelledStatus === 'registered'
}

async function getActiveMembershipClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    return null
  }

  const memberships = (await MembershipModel.find({
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return memberships.map(membership => membership.club)
}

async function getManagedClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    const clubs = (await ClubModel.find({ deletedAt: null, status: 'active' }).lean()) as ClubLean[]
    return clubs.map(club => club._id)
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.eventsManageClub)) {
    return []
  }

  const memberships = (await MembershipModel.find({
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return memberships.map(membership => membership.club)
}

async function getManageableClubIdSet(actor: UserDto, clubIds: Types.ObjectId[]) {
  if (clubIds.length === 0) {
    return new Set<string>()
  }

  if (isUniversityAdmin(actor)) {
    return new Set(clubIds.map(clubId => clubId.toString()))
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.eventsManageClub)) {
    return new Set<string>()
  }

  const memberships = (await MembershipModel.find({
    club: { $in: clubIds },
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return new Set(memberships.map(membership => membership.club.toString()))
}

async function findActiveClub(identifier: string) {
  const club = (await ClubModel.findOne({
    deletedAt: null,
    status: 'active',
    ...(isObjectId(identifier) ? { _id: toObjectId(identifier) } : { slug: identifier })
  }).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

async function findEventById(eventId: string, actor: UserDto, includeDraftForManagers = false) {
  if (!isObjectId(eventId)) {
    throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
  }

  const event = (await EventModel.findOne({
    _id: toObjectId(eventId),
    deletedAt: null
  }).lean()) as EventLean | null

  if (!event) {
    throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
  }

  if (includeDraftForManagers && (await canActorManageClub(actor, event.club))) {
    return event
  }

  if (event.status === 'draft') {
    throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
  }

  if (event.visibility === 'members' && !isUniversityAdmin(actor)) {
    const membership = await MembershipModel.exists({
      club: event.club,
      status: 'active',
      user: toObjectId(actor.id)
    })

    if (!membership) {
      throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
    }
  }

  return event
}

async function assertActorCanManageEvent(actor: UserDto, event: EventLean) {
  if (await canActorManageClub(actor, event.club)) {
    return
  }

  throw new ApplicationError('You cannot manage this event.', 403, 'FORBIDDEN')
}

async function buildVisibilityClause(actor: UserDto): Promise<FilterQuery<Event> | null> {
  if (isUniversityAdmin(actor)) {
    return null
  }

  const activeClubIds = await getActiveMembershipClubIds(actor)

  return {
    $or: [{ visibility: 'public' }, { club: { $in: activeClubIds ?? [] }, visibility: 'members' }]
  }
}

async function buildEventFilter(
  query: EventListQuery,
  actor: UserDto
): Promise<FilterQuery<Event>> {
  const now = new Date()
  const filter: FilterQuery<Event> = {
    deletedAt: null
  }
  const clauses: FilterQuery<Event>[] = []

  if (query.status) {
    filter.status = query.status
  } else if (!isUniversityAdmin(actor)) {
    clauses.push({
      $or: [{ status: 'published' }, { status: 'completed' }, { status: 'cancelled' }]
    })
  }

  if (query.timeframe === 'upcoming') {
    filter.startsAt = { $gte: now }
  }

  if (query.timeframe === 'past') {
    filter.startsAt = { $lt: now }
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i')
    clauses.push({
      $or: [{ title: regex }, { description: regex }, { venue: regex }]
    })
  }

  if (query.scope === 'myClubs') {
    const activeClubIds = await getActiveMembershipClubIds(actor)
    filter.club = { $in: activeClubIds ?? [] }
  }

  if (query.scope === 'managed') {
    filter.club = { $in: await getManagedClubIds(actor) }
  }

  if (query.scope === 'registered') {
    const registrations = (await EventRegistrationModel.find({
      status: { $in: ['pending', 'registered', 'waitlisted'] },
      user: toObjectId(actor.id)
    }).lean()) as EventRegistrationLean[]

    filter._id = { $in: registrations.map(registration => registration.event) }
  }

  const visibilityClause = await buildVisibilityClause(actor)

  if (visibilityClause) {
    clauses.push(visibilityClause)
  }

  if (clauses.length > 0) {
    filter.$and = clauses
  }

  return filter
}

async function createEventDtos(events: EventLean[], actor: UserDto): Promise<EventDto[]> {
  if (events.length === 0) {
    return []
  }

  const eventIds = events.map(event => event._id)
  const clubIds = [...new Map(events.map(event => [event.club.toString(), event.club])).values()]
  const [clubs, registeredCounts, waitlistedCounts, currentRegistrations, manageableClubIds] =
    await Promise.all([
      ClubModel.find({ _id: { $in: clubIds }, deletedAt: null }).lean(),
      EventRegistrationModel.aggregate([
        { $match: { event: { $in: eventIds }, status: 'registered' } },
        { $group: { _id: '$event', count: { $sum: 1 } } }
      ]),
      EventRegistrationModel.aggregate([
        { $match: { event: { $in: eventIds }, status: 'waitlisted' } },
        { $group: { _id: '$event', count: { $sum: 1 } } }
      ]),
      EventRegistrationModel.find({
        event: { $in: eventIds },
        user: toObjectId(actor.id)
      }).lean(),
      getManageableClubIdSet(actor, clubIds)
    ])

  const clubsById = new Map((clubs as ClubLean[]).map(club => [club._id.toString(), club]))
  const registeredCountsByEventId = mapCounts(
    registeredCounts as { _id: Types.ObjectId; count: number }[]
  )
  const waitlistedCountsByEventId = mapCounts(
    waitlistedCounts as { _id: Types.ObjectId; count: number }[]
  )
  const registrationsByEventId = new Map(
    (currentRegistrations as EventRegistrationLean[]).map(registration => [
      registration.event.toString(),
      registration
    ])
  )

  return events
    .map(event => {
      const club = clubsById.get(event.club.toString())

      if (!club) {
        return null
      }

      const registeredCount = registeredCountsByEventId.get(event._id.toString()) ?? 0
      const waitlistedCount = waitlistedCountsByEventId.get(event._id.toString()) ?? 0

      return {
        availableSpots: Math.max(event.capacity - registeredCount, 0),
        bannerUrl: event.bannerUrl ?? null,
        bkashNumber: event.bkashNumber ?? null,
        canManage: manageableClubIds.has(event.club.toString()),
        capacity: event.capacity,
        club: toClubDto(club),
        createdAt: event.createdAt.toISOString(),
        currentUserRegistration: registrationsByEventId.get(event._id.toString())
          ? toRegistrationDto(registrationsByEventId.get(event._id.toString())!)
          : null,
        description: event.description,
        endsAt: event.endsAt.toISOString(),
        feeAmount: event.feeAmount ?? 0,
        id: event._id.toString(),
        paymentMethod: event.paymentMethod ?? 'none',
        registrationDeadline: event.registrationDeadline.toISOString(),
        registeredCount,
        startsAt: event.startsAt.toISOString(),
        status: event.status,
        title: event.title,
        updatedAt: event.updatedAt.toISOString(),
        venue: event.venue,
        visibility: event.visibility,
        waitlistedCount
      }
    })
    .filter((event): event is EventDto => Boolean(event))
}

async function createRegistrationNotification(
  recipient: Types.ObjectId,
  event: EventLean,
  status: Extract<EventRegistrationStatus, 'registered' | 'waitlisted'>
) {
  await NotificationModel.create({
    body:
      status === 'registered'
        ? `Your registration for ${event.title} is confirmed.`
        : `You have been added to the waitlist for ${event.title}.`,
    link: `/events?event=${event._id.toString()}`,
    metadata: {
      eventId: event._id.toString(),
      status
    },
    readAt: null,
    recipient,
    title: status === 'registered' ? 'Registration confirmed' : 'Added to waitlist',
    type: 'registration_confirmed'
  })
}

async function createWaitlistPromotionNotification(recipient: Types.ObjectId, event: EventLean) {
  await NotificationModel.create({
    body: `A spot opened for ${event.title}. You have been moved from the waitlist to registered.`,
    link: `/events?event=${event._id.toString()}`,
    metadata: {
      eventId: event._id.toString()
    },
    readAt: null,
    recipient,
    title: 'Waitlist spot confirmed',
    type: 'waitlist_promoted'
  })
}

async function normalizeWaitlistPositions(eventId: Types.ObjectId) {
  const waitlisted = (await EventRegistrationModel.find({
    event: eventId,
    status: 'waitlisted'
  })
    .sort({ waitlistPosition: 1, registeredAt: 1 })
    .lean()) as EventRegistrationLean[]

  await Promise.all(
    waitlisted.map((registration, index) =>
      EventRegistrationModel.updateOne(
        { _id: registration._id },
        { $set: { waitlistPosition: index + 1 } }
      )
    )
  )
}

async function promoteFirstWaitlisted(event: EventLean) {
  const firstWaitlisted = (await EventRegistrationModel.findOne({
    event: event._id,
    status: 'waitlisted'
  })
    .sort({ waitlistPosition: 1, registeredAt: 1 })
    .lean()) as EventRegistrationLean | null

  if (!firstWaitlisted) {
    return null
  }

  const promoted = (await EventRegistrationModel.findByIdAndUpdate(
    firstWaitlisted._id,
    {
      $set: {
        promotedAt: new Date(),
        status: 'registered',
        waitlistPosition: null
      }
    },
    { new: true }
  ).lean()) as EventRegistrationLean

  await normalizeWaitlistPositions(event._id)
  await createWaitlistPromotionNotification(promoted.user, event)

  return promoted
}

export async function listEvents(query: EventListQuery, actor: UserDto): Promise<EventListResult> {
  const filter = await buildEventFilter(query, actor)
  const sort: Record<string, 1 | -1> =
    query.sort === 'latest' ? { createdAt: -1, startsAt: 1 } : { startsAt: 1, createdAt: -1 }
  const skip = (query.page - 1) * query.perPage
  const [total, events] = await Promise.all([
    EventModel.countDocuments(filter),
    EventModel.find(filter).sort(sort).skip(skip).limit(query.perPage).lean()
  ])
  const eventRows = events as EventLean[]

  if (eventRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as EventListResult
  }

  return getPagination(await createEventDtos(eventRows, actor), total, query.page, query.perPage)
}

export async function getEventDetail(eventId: string, actor: UserDto) {
  const event = await findEventById(eventId, actor, true)
  const [dto] = await createEventDtos([event], actor)
  return dto
}

export async function listManageableEventClubs(actor: UserDto) {
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

export async function createEvent(input: CreateEventInput, actor: UserDto) {
  const club = await findActiveClub(input.clubId)

  if (!(await canActorManageClub(actor, club._id))) {
    throw new ApplicationError('You cannot create events for this club.', 403, 'FORBIDDEN')
  }

  const feeAmount = input.feeAmount ?? 0
  const event = await EventModel.create({
    bannerUrl: input.bannerUrl ?? null,
    bkashNumber: feeAmount > 0 ? (input.bkashNumber ?? null) : null,
    capacity: input.capacity,
    club: club._id,
    createdBy: toObjectId(actor.id),
    deletedAt: null,
    description: input.description,
    endsAt: new Date(input.endsAt),
    feeAmount,
    paymentMethod: feeAmount > 0 ? 'bkash_send_money' : 'none',
    registrationDeadline: new Date(input.registrationDeadline),
    startsAt: new Date(input.startsAt),
    status: input.status,
    title: input.title,
    venue: input.venue,
    visibility: input.visibility
  })

  const [dto] = await createEventDtos([event.toObject() as EventLean], actor)
  return dto
}

export async function updateEvent(eventId: string, input: UpdateEventInput, actor: UserDto) {
  const event = await findEventById(eventId, actor, true)
  await assertActorCanManageEvent(actor, event)

  const update: Partial<Event> = {}
  const nextFeeAmount = input.feeAmount ?? event.feeAmount ?? 0

  if (input.bannerUrl !== undefined) update.bannerUrl = input.bannerUrl ?? null
  if (input.feeAmount !== undefined) update.feeAmount = input.feeAmount
  if (input.capacity !== undefined) update.capacity = input.capacity
  if (input.description !== undefined) update.description = input.description
  if (input.endsAt !== undefined) update.endsAt = new Date(input.endsAt)
  if (input.registrationDeadline !== undefined) {
    update.registrationDeadline = new Date(input.registrationDeadline)
  }
  if (input.startsAt !== undefined) update.startsAt = new Date(input.startsAt)
  if (input.status !== undefined) update.status = input.status
  if (input.title !== undefined) update.title = input.title
  if (input.venue !== undefined) update.venue = input.venue
  if (input.visibility !== undefined) update.visibility = input.visibility

  if (nextFeeAmount > 0) {
    const bkashNumber = input.bkashNumber ?? event.bkashNumber

    if (!bkashNumber) {
      throw new ApplicationError(
        'bKash number is required when the event has a fee.',
        422,
        'EVENT_PAYMENT_REQUIRED'
      )
    }

    update.bkashNumber = bkashNumber
    update.paymentMethod = 'bkash_send_money'
  } else if (input.feeAmount !== undefined || input.bkashNumber !== undefined) {
    update.bkashNumber = null
    update.paymentMethod = 'none'
  }

  const updatedEvent = (await EventModel.findByIdAndUpdate(
    event._id,
    { $set: update },
    { new: true }
  ).lean()) as EventLean | null

  if (!updatedEvent) {
    throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
  }

  const [dto] = await createEventDtos([updatedEvent], actor)
  return dto
}

export async function deleteEvent(eventId: string, actor: UserDto) {
  const event = await findEventById(eventId, actor, true)
  await assertActorCanManageEvent(actor, event)

  const deletedEvent = (await EventModel.findByIdAndUpdate(
    event._id,
    {
      $set: {
        deletedAt: new Date(),
        status: 'cancelled'
      }
    },
    { new: true }
  ).lean()) as EventLean | null

  if (!deletedEvent) {
    throw new ApplicationError('Event not found.', 404, 'EVENT_NOT_FOUND')
  }

  const [dto] = await createEventDtos([deletedEvent], actor)
  return dto
}

export async function registerForEvent(
  eventId: string,
  input: RegisterEventInput,
  actor: UserDto
) {
  const event = await findEventById(eventId, actor)
  const now = new Date()

  if (event.status !== 'published') {
    throw new ApplicationError(
      'Registration is only open for published events.',
      409,
      'EVENT_CLOSED'
    )
  }

  if (event.startsAt <= now || event.registrationDeadline < now) {
    throw new ApplicationError('Registration deadline has passed.', 409, 'REGISTRATION_CLOSED')
  }

  const userId = toObjectId(actor.id)
  const feeAmount = event.feeAmount ?? 0

  if (feeAmount > 0 && !input.paymentTransactionId) {
    throw new ApplicationError(
      'Transaction ID is required for paid event registration.',
      422,
      'PAYMENT_TRANSACTION_REQUIRED'
    )
  }

  const existingRegistration = (await EventRegistrationModel.findOne({
    event: event._id,
    user: userId
  }).lean()) as EventRegistrationLean | null

  if (
    existingRegistration &&
    ['pending', 'registered', 'waitlisted'].includes(existingRegistration.status)
  ) {
    return toRegistrationDto(existingRegistration)
  }

  const [registeredCount, waitlistedCount] = await Promise.all([
    EventRegistrationModel.countDocuments({ event: event._id, status: 'registered' }),
    EventRegistrationModel.countDocuments({ event: event._id, status: 'waitlisted' })
  ])
  const placement = getInitialRegistrationPlacement({
    capacity: event.capacity,
    feeAmount,
    registeredCount,
    waitlistedCount
  })
  const registration = (await EventRegistrationModel.findOneAndUpdate(
    { event: event._id, user: userId },
    {
      $set: {
        cancellationReason: null,
        cancelledAt: null,
        event: event._id,
        paymentMethod: feeAmount > 0 ? 'bkash_send_money' : null,
        paymentReviewedAt: null,
        paymentReviewedBy: null,
        paymentReviewRemarks: null,
        paymentSubmittedAt: feeAmount > 0 ? now : null,
        paymentTransactionId: feeAmount > 0 ? (input.paymentTransactionId ?? null) : null,
        promotedAt: null,
        registeredAt: now,
        status: placement.status,
        user: userId,
        waitlistPosition: placement.waitlistPosition
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  ).lean()) as EventRegistrationLean

  if (placement.status !== 'pending') {
    await createRegistrationNotification(userId, event, placement.status)
  }

  return toRegistrationDto(registration)
}

export async function cancelEventRegistration(
  eventId: string,
  input: CancelRegistrationInput,
  actor: UserDto
) {
  const event = await findEventById(eventId, actor)
  const registration = (await EventRegistrationModel.findOne({
    event: event._id,
    user: toObjectId(actor.id)
  }).lean()) as EventRegistrationLean | null

  if (!registration || ['cancelled', 'declined'].includes(registration.status)) {
    throw new ApplicationError(
      'Active event registration not found.',
      404,
      'REGISTRATION_NOT_FOUND'
    )
  }

  const cancelledRegistration = (await EventRegistrationModel.findByIdAndUpdate(
    registration._id,
    {
      $set: {
        cancellationReason: input.reason ?? null,
        cancelledAt: new Date(),
        status: 'cancelled',
        waitlistPosition: null
      }
    },
    { new: true }
  ).lean()) as EventRegistrationLean

  if (registration.status === 'waitlisted') {
    await normalizeWaitlistPositions(event._id)
  }

  if (shouldPromoteFromWaitlist(registration.status)) {
    await promoteFirstWaitlisted(event)
  }

  return toRegistrationDto(cancelledRegistration)
}

function createEventRegistrationListItemDto(
  registration: EventRegistrationLean,
  usersById: Map<string, UserLean>
): EventRegistrationListItemDto | null {
  const user = usersById.get(registration.user.toString())

  if (!user) {
    return null
  }

  return {
    ...toRegistrationDto(registration),
    user: toUserDto(user)
  }
}

export async function listEventRegistrations(
  eventId: string,
  query: EventRegistrationsQuery,
  actor: UserDto
): Promise<EventRegistrationListResult> {
  const event = await findEventById(eventId, actor, true)
  await assertActorCanManageEvent(actor, event)

  const filter: FilterQuery<EventRegistration> = {
    event: event._id,
    status: query.status
  }
  const skip = (query.page - 1) * query.perPage
  const [total, registrations] = await Promise.all([
    EventRegistrationModel.countDocuments(filter),
    EventRegistrationModel.find(filter)
      .sort({ waitlistPosition: 1, registeredAt: 1 })
      .skip(skip)
      .limit(query.perPage)
      .lean()
  ])
  const registrationRows = registrations as EventRegistrationLean[]

  if (registrationRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as EventRegistrationListResult
  }

  const users = (await UserModel.find({
    _id: { $in: registrationRows.map(registration => registration.user) },
    deletedAt: null
  }).lean()) as UserLean[]
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return getPagination(
    registrationRows
      .map(registration => createEventRegistrationListItemDto(registration, usersById))
      .filter((registration): registration is EventRegistrationListItemDto =>
        Boolean(registration)
      ),
    total,
    query.page,
    query.perPage
  )
}

export async function reviewEventRegistration(
  eventId: string,
  registrationId: string,
  input: ReviewEventRegistrationInput,
  actor: UserDto
) {
  const event = await findEventById(eventId, actor, true)
  await assertActorCanManageEvent(actor, event)

  if (!isObjectId(registrationId)) {
    throw new ApplicationError('Event registration not found.', 404, 'REGISTRATION_NOT_FOUND')
  }

  const registration = (await EventRegistrationModel.findOne({
    _id: toObjectId(registrationId),
    event: event._id
  }).lean()) as EventRegistrationLean | null

  if (!registration) {
    throw new ApplicationError('Event registration not found.', 404, 'REGISTRATION_NOT_FOUND')
  }

  if (registration.status !== 'pending') {
    throw new ApplicationError(
      'Only pending paid registrations can be reviewed.',
      409,
      'REGISTRATION_NOT_PENDING'
    )
  }

  const now = new Date()
  const reviewerId = toObjectId(actor.id)

  if (input.action === 'decline') {
    const declinedRegistration = (await EventRegistrationModel.findByIdAndUpdate(
      registration._id,
      {
        $set: {
          paymentReviewedAt: now,
          paymentReviewedBy: reviewerId,
          paymentReviewRemarks: input.remarks ?? null,
          status: 'declined',
          waitlistPosition: null
        }
      },
      { new: true }
    ).lean()) as EventRegistrationLean
    const user = (await UserModel.findById(declinedRegistration.user).lean()) as UserLean | null

    if (!user) {
      throw new ApplicationError('Registration user not found.', 404, 'USER_NOT_FOUND')
    }

    return createEventRegistrationListItemDto(
      declinedRegistration,
      new Map([[user._id.toString(), user]])
    )
  }

  const [registeredCount, waitlistedCount] = await Promise.all([
    EventRegistrationModel.countDocuments({ event: event._id, status: 'registered' }),
    EventRegistrationModel.countDocuments({ event: event._id, status: 'waitlisted' })
  ])
  const placement = getReviewedRegistrationPlacement(
    registeredCount,
    event.capacity,
    waitlistedCount
  )
  const approvedRegistration = (await EventRegistrationModel.findByIdAndUpdate(
    registration._id,
    {
      $set: {
        paymentReviewedAt: now,
        paymentReviewedBy: reviewerId,
        paymentReviewRemarks: input.remarks ?? null,
        status: placement.status,
        waitlistPosition: placement.waitlistPosition
      }
    },
    { new: true }
  ).lean()) as EventRegistrationLean
  const user = (await UserModel.findById(approvedRegistration.user).lean()) as UserLean | null

  if (!user) {
    throw new ApplicationError('Registration user not found.', 404, 'USER_NOT_FOUND')
  }

  await createRegistrationNotification(approvedRegistration.user, event, placement.status)

  return createEventRegistrationListItemDto(
    approvedRegistration,
    new Map([[user._id.toString(), user]])
  )
}
