import { z } from 'zod'

const clubCategories = [
  'academic',
  'arts',
  'community_service',
  'culture',
  'entrepreneurship',
  'sports',
  'technology'
] as const

const clubStatuses = ['active', 'disabled', 'pending'] as const
const membershipStatuses = ['active', 'left', 'none', 'pending', 'rejected'] as const

function optionalEnum<TValue extends readonly [string, ...string[]]>(values: TValue) {
  return z.preprocess(
    value => (value === '' || value === 'all' ? undefined : value),
    z.enum(values).optional()
  )
}

export const clubListQuerySchema = z.object({
  category: optionalEnum(clubCategories),
  membershipStatus: optionalEnum(membershipStatuses),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(48).default(9),
  search: z.string().trim().max(120).default(''),
  sortBy: z.enum(['createdAt', 'name', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  status: optionalEnum(clubStatuses)
})

export const clubParamsSchema = z.object({
  clubId: z.string().trim().min(1, 'Club is required.')
})

export const clubMembershipRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(25).default(6),
  status: z.enum(['active', 'left', 'pending', 'rejected']).default('pending')
})

export const clubMembershipReviewParamsSchema = clubParamsSchema.extend({
  membershipId: z.string().trim().min(1, 'Membership request is required.')
})

export const reviewMembershipSchema = z.object({
  action: z.enum(['approve', 'reject']),
  remarks: z.string().trim().max(500).optional()
})

export type ClubListQuery = z.infer<typeof clubListQuerySchema>
export type ClubMembershipRequestsQuery = z.infer<typeof clubMembershipRequestsQuerySchema>
export type ReviewMembershipInput = z.infer<typeof reviewMembershipSchema>
