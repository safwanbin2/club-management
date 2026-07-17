import type { PaginatedData } from '@common/types/api'
import type { EventClub, EventRegistrationStatus, EventUser } from '@pages/events/shared/types'

export type AttendanceEvent = {
  club: EventClub
  endsAt: string
  id: string
  startsAt: string
  status: string
  title: string
  venue: string
}

export type AttendanceRecord = {
  checkedInAt: string
  event: AttendanceEvent
  id: string
  method: 'manual' | 'qr'
  userId: string
  verifiedBy: null | string
}

export type AttendanceToken = {
  checkInUrl: string
  event: AttendanceEvent
  expiresAt: string
  token: string
}

export type AttendanceReportRow = {
  attendance: null | {
    checkedInAt: string
    id: string
    method: 'manual' | 'qr'
  }
  registrationId: string
  registeredAt: string
  status: EventRegistrationStatus
  user: EventUser
  waitlistPosition: null | number
}

export type AttendanceReport = {
  event: AttendanceEvent
  rows: PaginatedData<AttendanceReportRow>
  summary: {
    checkedIn: number
    registered: number
    waitlisted: number
  }
}

export type AttendanceHistoryResponse = PaginatedData<AttendanceRecord>
