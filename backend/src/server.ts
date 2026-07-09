import app from './app.js'
import { env } from './config/env.js'
import { connectDatabase } from './db/mongoose.js'

async function bootstrap() {
  try {
    await connectDatabase()
    console.log('Database connected')
  } catch (error) {
    if (env.NODE_ENV === 'production') {
      throw error
    }

    console.warn('Database connection failed in development')
    console.warn(error)
  }

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`)
  })
}

bootstrap().catch(error => {
  console.error(error)
  process.exit(1)
})
