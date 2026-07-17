import { z } from 'zod'

const requestTypeSchema = z.enum(['funding', 'room_booking'])

const requestDetailsSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than zero.').optional(),
    description: z.string().trim().min(10, 'Description must be at least 10 characters.').max(800),
    requestedDate: z.string().datetime('Requested date must be a valid ISO date.').optional(),
    room: z.string().trim().min(2, 'Room is required.').max(120).optional(),
    title: z.string().trim().min(4, 'Title must be at least 4 characters.').max(160)
  })
  .strip()

export const resourceRequestListQuerySchema = z.object({
  clubId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(24).default(8),
  search: z.string().trim().max(140).default(''),
  status: z.enum(['all', 'approved', 'pending', 'rejected']).default('all'),
  type: z.enum(['all', 'funding', 'room_booking']).default('all')
})

export const createResourceRequestSchema = z
  .object({
    clubId: z.string().trim().min(1, 'Club is required.'),
    details: requestDetailsSchema,
    type: requestTypeSchema
  })
  .superRefine((value, context) => {
    if (value.type === 'funding' && value.details.amount === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Funding amount is required.',
        path: ['details', 'amount']
      })
    }

    if (value.type === 'room_booking') {
      if (!value.details.room) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Room is required for room booking requests.',
          path: ['details', 'room']
        })
      }

      if (!value.details.requestedDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Requested date is required for room booking requests.',
          path: ['details', 'requestedDate']
        })
      }
    }
  })

export const resourceRequestParamsSchema = z.object({
  requestId: z.string().trim().min(1, 'Request is required.')
})

export const reviewResourceRequestSchema = z.object({
  remarks: z.string().trim().max(500).default(''),
  status: z.enum(['approved', 'rejected'])
})

export type CreateResourceRequestInput = z.infer<typeof createResourceRequestSchema>
export type ResourceRequestListQuery = z.infer<typeof resourceRequestListQuerySchema>
export type ReviewResourceRequestInput = z.infer<typeof reviewResourceRequestSchema>
