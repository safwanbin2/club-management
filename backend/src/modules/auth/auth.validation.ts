import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')

export const registerSchema = z.object({
  department: z.string().trim().max(120).optional(),
  email: z.string().trim().email('Enter a valid university email.').toLowerCase(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  password: passwordSchema,
  studentId: z.string().trim().max(40).optional()
})

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email.').toLowerCase(),
  password: z.string().min(1, 'Password is required.')
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email.').toLowerCase()
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  token: z.string().trim().min(32, 'Reset token is required.')
})
