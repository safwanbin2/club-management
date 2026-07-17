import { z } from 'zod'

const eventStatuses = ['cancelled', 'completed', 'draft', 'published'] as const
const eventVisibility = ['members', 'public'] as const

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
  status: z.enum(['cancelled', 'registered', 'waitlisted']).default('registered')
})

const baseCreateEventSchema = z.object({
  bannerUrl: z
    .string()
    .trim()
    .url('Banner must be a valid URL.')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  capacity: z.coerce.number().int().positive().max(5000),
  clubId: z.string().trim().min(1, 'Club is required.'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(4000),
  endsAt: z.string().datetime('End date must be a valid ISO date.'),
  registrationDeadline: z.string().datetime('Registration deadline must be a valid ISO date.'),
  status: z.enum(['draft', 'published']).default('published'),
  startsAt: z.string().datetime('Start date must be a valid ISO date.'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(160),
  venue: z.string().trim().min(2, 'Venue is required.').max(160),
  visibility: z.enum(eventVisibility).default('public')
})

export const createEventSchema = baseCreateEventSchema.refine(validateEventTiming, {
  message: 'Event timing is invalid.',
  path: ['startsAt']
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

export type CancelRegistrationInput = z.infer<typeof cancelRegistrationSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type EventListQuery = z.infer<typeof eventListQuerySchema>
export type EventRegistrationsQuery = z.infer<typeof eventRegistrationsQuerySchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
