import app from '../backend/dist/app.js'
import { connectDatabase } from '../backend/dist/db/mongoose.js'

let databaseReady = null

async function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = connectDatabase().catch(error => {
      databaseReady = null
      throw error
    })
  }

  await databaseReady
}

export default async function handler(req, res) {
  try {
    await ensureDatabase()
  } catch (error) {
    console.error('Database connection failed', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        code: 'DATABASE_CONNECTION_FAILED',
        data: null,
        message: 'Database connection failed',
        status: 'error'
      })
    )
    return
  }

  return app(req, res)
}
