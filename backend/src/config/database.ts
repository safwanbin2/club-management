import { env } from './env.js'

export const databaseConfig = {
  uri: env.MONGODB_URI
}
