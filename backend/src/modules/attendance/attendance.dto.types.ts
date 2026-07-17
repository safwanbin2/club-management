import type { PaginatedResult } from '../../types/pagination.js'
import type { EventRegistrationStatus } from '../event/event-registration.types.js'
import type { EventClubDto, EventUserDto } from '../event/event.dto.types.js'
import type { AttendanceMethod } from './attendance.types.js'

export type AttendanceEventDto = {
  club: EventClubDto
  endsAt: string
  id: string
  startsAt: string
  status: string
  title: string
  venue: string
}

export type AttendanceRecordDto = {
  checkedInAt: string
  event: AttendanceEventDto
  id: string
  method: AttendanceMethod
  userId: string
  verifiedBy: null | string
}

export type AttendanceTokenDto = {
  checkInUrl: string
  event: AttendanceEventDto
  expiresAt: string
  token: string
}

export type AttendanceReportRowDto = {
  attendance: null | {
    checkedInAt: string
    id: string
    method: AttendanceMethod
  }
  registrationId: string
  registeredAt: string
  status: EventRegistrationStatus
  user: EventUserDto
  waitlistPosition: null | number
}

export type AttendanceReportDto = {
  event: AttendanceEventDto
  rows: PaginatedResult<AttendanceReportRowDto>
  summary: {
    checkedIn: number
    registered: number
    waitlisted: number
  }
}

export type AttendanceHistoryResult = PaginatedResult<AttendanceRecordDto>
