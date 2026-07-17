import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(16).default('development-access-token-secret-change-me'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  FRONTEND_ORIGINS: z.string().default(''),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/university-club-management'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30)
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables', parsedEnv.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsedEnv.data
