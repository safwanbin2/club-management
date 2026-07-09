import type { Types } from 'mongoose'

export type AttendanceMethod = 'manual' | 'qr'

export type Attendance = {
  checkedInAt: Date
  createdAt: Date
  event: Types.ObjectId
  method: AttendanceMethod
  registration: null | Types.ObjectId
  updatedAt: Date
  user: Types.ObjectId
  verifiedBy: null | Types.ObjectId
}
