import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'
import type { Attendance } from './attendance.types.js'

const attendanceSchema = new mongoose.Schema<Attendance>(
  {
    checkedInAt: {
      default: Date.now,
      required: true,
      type: Date
    },
    event: {
      ref: 'Event',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    method: {
      default: 'qr',
      enum: ['manual', 'qr'],
      type: String
    },
    registration: {
      default: null,
      ref: 'EventRegistration',
      type: mongoose.Schema.Types.ObjectId
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    verifiedBy: {
      default: null,
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    collection: 'attendance',
    timestamps: true
  }
)

attendanceSchema.index({ event: 1, checkedInAt: -1 })
attendanceSchema.index({ event: 1, user: 1 }, { unique: true })
attendanceSchema.index({ user: 1, checkedInAt: -1 })

export const AttendanceModel = defineModel<Attendance>('Attendance', attendanceSchema)
