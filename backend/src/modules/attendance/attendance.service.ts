import crypto from 'node:crypto'

import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import { env } from '../../config/env.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import { canActorManageClub } from '../club/club.service.js'
import type { Club } from '../club/club.types.js'
import { EventRegistrationModel } from '../event/event-registration.model.js'
import type { EventRegistration } from '../event/event-registration.types.js'
import { EventModel } from '../event/event.model.js'
import type { Event } from '../event/event.types.js'
import type { EventClubDto, EventUserDto } from '../event/event.dto.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { AttendanceModel } from './attendance.model.js'
import type { Attendance } from './attendance.types.js'
import type {
  AttendanceEventDto,
  AttendanceHistoryResult,
  AttendanceRecordDto,
  AttendanceReportDto,
  AttendanceReportRowDto,
  AttendanceTokenDto
} from './attendance.dto.types.js'
import type {
  AttendanceHistoryQuery,
  AttendanceReportQuery,
  CheckInInput
} from './attendance.validation.js'

type AttendanceLean = Attendance & {
  _id: Types.ObjectId
}

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

type AttendanceTokenPayload = {
  eventId: string
  exp: number
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

function sign(value: string, secret = env.ACCESS_TOKEN_SECRET) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url')
}

export function createAttendanceToken(
  payload: AttendanceTokenPayload,
  secret = env.ACCESS_TOKEN_SECRET
) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encodedPayload}.${sign(encodedPayload, secret)}`
}

export function verifyAttendanceToken(token: string, secret = env.ACCESS_TOKEN_SECRET) {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    throw new ApplicationError('Invalid attendance token.', 422, 'INVALID_ATTENDANCE_TOKEN')
  }

  const expectedSignature = sign(encodedPayload, secret)
  const expectedBuffer = Buffer.from(expectedSignature)
  const actualBuffer = Buffer.from(signature)

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    throw new ApplicationError('Invalid attendance token.', 422, 'INVALID_ATTENDANCE_TOKEN')
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as
    AttendanceTokenPayload | undefined

  if (!payload?.eventId || !payload.exp || payload.exp < Date.now()) {
    throw new ApplicationError('Attendance token has expired.', 422, 'ATTENDANCE_TOKEN_EXPIRED')
  }

  return payload
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

function toAttendanceEventDto(event: EventLean, club: ClubLean): AttendanceEventDto {
  return {
    club: toClubDto(club),
    endsAt: event.endsAt.toISOString(),
    id: event._id.toString(),
    startsAt: event.startsAt.toISOString(),
    status: event.status,
    title: event.title,
    venue: event.venue
  }
}

function toAttendanceRecordDto(
  attendance: AttendanceLean,
  event: EventLean,
  club: ClubLean
): AttendanceRecordDto {
  return {
    checkedInAt: attendance.checkedInAt.toISOString(),
    event: toAttendanceEventDto(event, club),
    id: attendance._id.toString(),
    method: attendance.method,
    userId: attendance.user.toString(),
    verifiedBy: attendance.verifiedBy ? attendance.verifiedBy.toString() : null
  }
}

async function findEvent(eventId: string) {
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

  return event
}

async function findClub(clubId: Types.ObjectId) {
  const club = (await ClubModel.findOne({ _id: clubId, deletedAt: null }).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

async function assertActorCanManageAttendance(actor: UserDto, event: EventLean) {
  if (await canActorManageClub(actor, event.club)) {
    return
  }

  throw new ApplicationError('You cannot manage attendance for this event.', 403, 'FORBIDDEN')
}

function assertCheckInWindow(event: EventLean, now = new Date()) {
  if (now < event.startsAt || now > event.endsAt) {
    throw new ApplicationError(
      'Attendance check-in is not open for this event.',
      409,
      'CHECK_IN_CLOSED'
    )
  }
}

export async function listManageableAttendanceEvents(actor: UserDto) {
  const filter: FilterQuery<Event> = {
    deletedAt: null,
    status: { $in: ['completed', 'published'] }
  }

  if (!isUniversityAdmin(actor)) {
    const memberships = await canManageableClubIds(actor)
    filter.club = { $in: memberships }
  }

  const events = (await EventModel.find(filter)
    .sort({ startsAt: -1 })
    .limit(50)
    .lean()) as EventLean[]
  const clubs = (await ClubModel.find({
    _id: { $in: events.map(event => event.club) },
    deletedAt: null
  }).lean()) as ClubLean[]
  const clubsById = new Map(clubs.map(club => [club._id.toString(), club]))

  return events
    .map(event => {
      const club = clubsById.get(event.club.toString())
      return club ? toAttendanceEventDto(event, club) : null
    })
    .filter((event): event is AttendanceEventDto => Boolean(event))
}

async function canManageableClubIds(actor: UserDto) {
  const memberships = (await MembershipModel.find({
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return memberships.map(membership => membership.club)
}

export async function generateAttendanceToken(
  eventId: string,
  actor: UserDto
): Promise<AttendanceTokenDto> {
  const event = await findEvent(eventId)
  await assertActorCanManageAttendance(actor, event)
  const club = await findClub(event.club)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
  const token = createAttendanceToken({
    eventId: event._id.toString(),
    exp: expiresAt.getTime()
  })

  return {
    checkInUrl: `${env.FRONTEND_ORIGIN}/attendance?token=${encodeURIComponent(token)}`,
    event: toAttendanceEventDto(event, club),
    expiresAt: expiresAt.toISOString(),
    token
  }
}

export async function checkIn(input: CheckInInput, actor: UserDto) {
  const payload = verifyAttendanceToken(input.token)
  const event = await findEvent(payload.eventId)
  assertCheckInWindow(event)

  const registration = (await EventRegistrationModel.findOne({
    event: event._id,
    status: 'registered',
    user: toObjectId(actor.id)
  }).lean()) as EventRegistrationLean | null

  if (!registration) {
    throw new ApplicationError(
      'Only confirmed attendees can check in.',
      403,
      'REGISTRATION_REQUIRED'
    )
  }

  const attendance = (await AttendanceModel.findOneAndUpdate(
    {
      event: event._id,
      user: toObjectId(actor.id)
    },
    {
      $setOnInsert: {
        checkedInAt: new Date(),
        event: event._id,
        method: 'qr',
        registration: registration._id,
        user: toObjectId(actor.id),
        verifiedBy: null
      }
    },
    { new: true, setDefaultsOnInsert: true, upsert: true }
  ).lean()) as AttendanceLean
  const club = await findClub(event.club)

  return toAttendanceRecordDto(attendance, event, club)
}

export async function listOwnAttendanceHistory(
  query: AttendanceHistoryQuery,
  actor: UserDto
): Promise<AttendanceHistoryResult> {
  const filter: FilterQuery<Attendance> = {
    user: toObjectId(actor.id)
  }
  const skip = (query.page - 1) * query.perPage
  const [total, attendanceRows] = await Promise.all([
    AttendanceModel.countDocuments(filter),
    AttendanceModel.find(filter).sort({ checkedInAt: -1 }).skip(skip).limit(query.perPage).lean()
  ])
  const attendances = attendanceRows as AttendanceLean[]

  if (attendances.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as AttendanceHistoryResult
  }

  const events = (await EventModel.find({
    _id: { $in: attendances.map(attendance => attendance.event) }
  }).lean()) as EventLean[]
  const clubs = (await ClubModel.find({
    _id: { $in: events.map(event => event.club) }
  }).lean()) as ClubLean[]
  const eventsById = new Map(events.map(event => [event._id.toString(), event]))
  const clubsById = new Map(clubs.map(club => [club._id.toString(), club]))

  return getPagination(
    attendances
      .map(attendance => {
        const event = eventsById.get(attendance.event.toString())
        const club = event ? clubsById.get(event.club.toString()) : undefined
        return event && club ? toAttendanceRecordDto(attendance, event, club) : null
      })
      .filter((attendance): attendance is AttendanceRecordDto => Boolean(attendance)),
    total,
    query.page,
    query.perPage
  )
}

export async function getAttendanceReport(
  eventId: string,
  query: AttendanceReportQuery,
  actor: UserDto
): Promise<AttendanceReportDto> {
  const event = await findEvent(eventId)
  await assertActorCanManageAttendance(actor, event)
  const club = await findClub(event.club)
  const filter: FilterQuery<EventRegistration> = {
    event: event._id,
    status: query.status
  }
  const skip = (query.page - 1) * query.perPage
  const [total, registrations, checkedIn, registered, waitlisted] = await Promise.all([
    EventRegistrationModel.countDocuments(filter),
    EventRegistrationModel.find(filter)
      .sort({ waitlistPosition: 1, registeredAt: 1 })
      .skip(skip)
      .limit(query.perPage)
      .lean(),
    AttendanceModel.countDocuments({ event: event._id }),
    EventRegistrationModel.countDocuments({ event: event._id, status: 'registered' }),
    EventRegistrationModel.countDocuments({ event: event._id, status: 'waitlisted' })
  ])
  const registrationRows = registrations as EventRegistrationLean[]
  const [users, attendanceRows] = await Promise.all([
    UserModel.find({
      _id: { $in: registrationRows.map(registration => registration.user) }
    }).lean(),
    AttendanceModel.find({ event: event._id }).lean()
  ])
  const usersById = new Map((users as UserLean[]).map(user => [user._id.toString(), user]))
  const attendanceByUserId = new Map(
    (attendanceRows as AttendanceLean[]).map(attendance => [attendance.user.toString(), attendance])
  )

  const rows = registrationRows
    .map(registration => {
      const user = usersById.get(registration.user.toString())

      if (!user) {
        return null
      }

      const attendance = attendanceByUserId.get(registration.user.toString())

      return {
        attendance: attendance
          ? {
              checkedInAt: attendance.checkedInAt.toISOString(),
              id: attendance._id.toString(),
              method: attendance.method
            }
          : null,
        registrationId: registration._id.toString(),
        registeredAt: registration.registeredAt.toISOString(),
        status: registration.status,
        user: toUserDto(user),
        waitlistPosition: registration.waitlistPosition ?? null
      }
    })
    .filter((row): row is AttendanceReportRowDto => Boolean(row))

  return {
    event: toAttendanceEventDto(event, club),
    rows: getPagination(rows, total, query.page, query.perPage),
    summary: {
      checkedIn,
      registered,
      waitlisted
    }
  }
}
