import { z } from 'zod'

export const attendanceEventParamsSchema = z.object({
  eventId: z.string().trim().min(1, 'Event is required.')
})

export const attendanceHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20)
})

export const attendanceReportQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
  status: z.enum(['registered', 'waitlisted']).default('registered')
})

export const checkInSchema = z.object({
  token: z.string().trim().min(20, 'Attendance token is required.')
})

export type AttendanceHistoryQuery = z.infer<typeof attendanceHistoryQuerySchema>
export type AttendanceReportQuery = z.infer<typeof attendanceReportQuerySchema>
export type CheckInInput = z.infer<typeof checkInSchema>
