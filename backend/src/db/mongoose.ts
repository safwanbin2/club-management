import mongoose from 'mongoose'

import { databaseConfig } from '../config/database.js'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  await mongoose.connect(databaseConfig.uri)
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
