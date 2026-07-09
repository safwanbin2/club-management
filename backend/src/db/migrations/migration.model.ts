import mongoose from 'mongoose'

import { defineModel } from '../../utils/define-model.js'

export type MigrationRecord = {
  appliedAt: Date
  name: string
}

const migrationSchema = new mongoose.Schema<MigrationRecord>(
  {
    appliedAt: {
      default: Date.now,
      required: true,
      type: Date
    },
    name: {
      required: true,
      trim: true,
      type: String,
      unique: true
    }
  },
  {
    collection: 'schema_migrations'
  }
)

export const MigrationModel = defineModel<MigrationRecord>('MigrationRecord', migrationSchema)
