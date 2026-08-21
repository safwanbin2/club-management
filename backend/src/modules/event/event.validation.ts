import { z } from 'zod'

const eventStatuses = ['cancelled', 'completed', 'draft', 'published'] as const
const eventVisibility = ['members', 'public'] as const
const eventRegistrationStatuses = [
  'cancelled',
  'declined',
  'pending',
  'registered',
  'waitlisted'
] as const

function optionalEnum<TValue extends readonly [string, ...string[]]>(values: TValue) {
  return z.preprocess(
    value => (value === '' || value === 'all' ? undefined : value),
    z.enum(values).optional()
  )
}

function validateEventTiming(input: {
  endsAt?: string
  registrationDeadline?: string
  startsAt?: string
}) {
  if (input.endsAt && input.startsAt && new Date(input.endsAt) <= new Date(input.startsAt)) {
    return false
  }

  if (
    input.registrationDeadline &&
    input.startsAt &&
    new Date(input.registrationDeadline) > new Date(input.startsAt)
  ) {
    return false
  }

  return true
}

export const eventListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(24).default(8),
  scope: z.enum(['all', 'managed', 'myClubs', 'registered']).default('all'),
  search: z.string().trim().max(140).default(''),
  sort: z.enum(['latest', 'upcoming']).default('upcoming'),
  status: optionalEnum(eventStatuses),
  timeframe: z.enum(['all', 'past', 'upcoming']).default('upcoming')
})

export const eventParamsSchema = z.object({
  eventId: z.string().trim().min(1, 'Event is required.')
})

export const eventRegistrationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
  status: z.enum(eventRegistrationStatuses).default('pending')
})

const baseCreateEventSchema = z.object({
  bannerUrl: z
    .string()
    .trim()
    .url('Banner must be a valid URL.')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  bkashNumber: z
    .string()
    .trim()
    .min(8, 'bKash number must be at least 8 characters.')
    .max(20, 'bKash number must be 20 characters or fewer.')
    .regex(/^[+0-9][0-9+\-\s]*$/, 'bKash number can contain digits, spaces, +, and - only.')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  capacity: z.coerce.number().int().positive().max(5000),
  clubId: z.string().trim().min(1, 'Club is required.'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(4000),
  endsAt: z.string().datetime('End date must be a valid ISO date.'),
  feeAmount: z.coerce.number().min(0).max(100000).default(0),
  registrationDeadline: z.string().datetime('Registration deadline must be a valid ISO date.'),
  status: z.enum(['draft', 'published']).default('published'),
  startsAt: z.string().datetime('Start date must be a valid ISO date.'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(160),
  venue: z.string().trim().min(2, 'Venue is required.').max(160),
  visibility: z.enum(eventVisibility).default('public')
})

export const createEventSchema = baseCreateEventSchema
  .refine(validateEventTiming, {
    message: 'Event timing is invalid.',
    path: ['startsAt']
  })
  .refine(input => input.feeAmount === 0 || Boolean(input.bkashNumber), {
    message: 'bKash number is required when the event has a fee.',
    path: ['bkashNumber']
  })

export const updateEventSchema = baseCreateEventSchema
  .omit({ clubId: true })
  .partial()
  .extend({
    status: z.enum(eventStatuses).optional()
  })
  .refine(validateEventTiming, {
    message: 'Event timing is invalid.',
    path: ['startsAt']
  })
  .refine(input => Object.keys(input).length > 0, {
    message: 'Choose at least one event field to update.'
  })

export const cancelRegistrationSchema = z.object({
  reason: z.string().trim().max(500).optional()
})

export const registerEventSchema = z
  .object({
    paymentTransactionId: z
      .string()
      .trim()
      .min(3, 'Transaction ID must be at least 3 characters.')
      .max(120, 'Transaction ID must be 120 characters or fewer.')
      .optional()
      .or(z.literal(''))
      .transform(value => (value === '' ? undefined : value))
  })
  .default({})

export const eventRegistrationReviewParamsSchema = eventParamsSchema.extend({
  registrationId: z.string().trim().min(1, 'Registration is required.')
})

export const reviewEventRegistrationSchema = z
  .object({
    action: z.enum(['approve', 'decline']),
    remarks: z.string().trim().max(500).optional()
  })
  .superRefine((input, context) => {
    if (input.action === 'decline' && !input.remarks) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Decline reason is required.',
        path: ['remarks']
      })
    }
  })

export type CancelRegistrationInput = z.infer<typeof cancelRegistrationSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type EventListQuery = z.infer<typeof eventListQuerySchema>
export type EventRegistrationsQuery = z.infer<typeof eventRegistrationsQuerySchema>
export type RegisterEventInput = z.infer<typeof registerEventSchema>
export type ReviewEventRegistrationInput = z.infer<typeof reviewEventRegistrationSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
