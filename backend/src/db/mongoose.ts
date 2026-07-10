import mongoose from 'mongoose'

import { databaseConfig } from '../config/database.js'

let connectionPromise: Promise<typeof mongoose> | null = null

export async function connectDatabase() {
  mongoose.set('strictQuery', true)

  if (mongoose.connection.readyState === 1) {
    return
  }

  if (mongoose.connection.readyState !== 2 || !connectionPromise) {
    connectionPromise = mongoose.connect(databaseConfig.uri).catch(error => {
      connectionPromise = null
      throw error
    })
  }

  await connectionPromise
}

export async function disconnectDatabase() {
  connectionPromise = null
  await mongoose.disconnect()
}
