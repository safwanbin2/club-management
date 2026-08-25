import { z } from 'zod'

import {
  EAST_DELTA_EMAIL_DOMAIN_ERROR,
  EAST_DELTA_PROGRAM_ERROR,
  isEastDeltaEmail,
  isEastDeltaProgram
} from '../../constants/east-delta-university.js'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')

const eastDeltaEmailSchema = z
  .string()
  .trim()
  .email('Enter a valid university email.')
  .toLowerCase()
  .refine(isEastDeltaEmail, {
    message: EAST_DELTA_EMAIL_DOMAIN_ERROR
  })

const optionalEastDeltaProgramSchema = z
  .string()
  .trim()
  .optional()
  .transform(value => (value === '' ? undefined : value))
  .refine(value => value === undefined || isEastDeltaProgram(value), {
    message: EAST_DELTA_PROGRAM_ERROR
  })

export const registerSchema = z.object({
  department: optionalEastDeltaProgramSchema,
  email: eastDeltaEmailSchema,
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
