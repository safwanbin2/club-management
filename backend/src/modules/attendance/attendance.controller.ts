import type { Request, Response } from 'express'

import { success } from '../../http/responses/index.js'
import * as attendanceService from './attendance.service.js'
import type {
  AttendanceHistoryQuery,
  AttendanceReportQuery,
  CheckInInput
} from './attendance.validation.js'

function getValidatedQuery<TQuery>(req: Request) {
  return req.validated?.query as TQuery
}

function getValidatedBody<TBody>(req: Request) {
  return req.validated?.body as TBody
}

function getEventId(req: Request) {
  return (req.validated?.params as { eventId: string }).eventId
}

export async function manageableEvents(req: Request, res: Response) {
  return success(res, await attendanceService.listManageableAttendanceEvents(req.auth!.user))
}

export async function token(req: Request, res: Response) {
  return success(
    res,
    await attendanceService.generateAttendanceToken(getEventId(req), req.auth!.user),
    'Attendance token generated'
  )
}

export async function checkIn(req: Request, res: Response) {
  return success(
    res,
    await attendanceService.checkIn(getValidatedBody<CheckInInput>(req), req.auth!.user),
    'Attendance recorded'
  )
}

export async function history(req: Request, res: Response) {
  return success(
    res,
    await attendanceService.listOwnAttendanceHistory(
      getValidatedQuery<AttendanceHistoryQuery>(req),
      req.auth!.user
    )
  )
}

export async function report(req: Request, res: Response) {
  return success(
    res,
    await attendanceService.getAttendanceReport(
      getEventId(req),
      getValidatedQuery<AttendanceReportQuery>(req),
      req.auth!.user
    )
  )
}
