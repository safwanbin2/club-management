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
const clubRoles = ['advisor', 'executive', 'member'] as const
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

const optionalUrlSchema = z.preprocess(
  value => (typeof value === 'string' ? value.trim() : value),
  z.union([z.string().url('Must be a valid URL.'), z.literal('')]).optional()
)

const optionalEmailSchema = z.preprocess(
  value => (typeof value === 'string' ? value.trim() : value),
  z.union([z.string().email('Must be a valid email address.'), z.literal('')]).optional()
)

const clubWriteBaseSchema = z.object({
  category: z.enum(clubCategories),
  contactEmail: optionalEmailSchema,
  contactPhone: z.string().trim().max(40).optional(),
  coverImageUrl: optionalUrlSchema,
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(3000),
  facultyAdvisor: z.object({
    department: z.string().trim().max(120).optional(),
    email: optionalEmailSchema,
    name: z.string().trim().min(2, 'Faculty advisor name is required.').max(120)
  }),
  gallery: z
    .array(optionalUrlSchema)
    .max(8, 'A club gallery can include at most 8 images.')
    .default([]),
  logoUrl: optionalUrlSchema,
  name: z.string().trim().min(3, 'Club name must be at least 3 characters.').max(120),
  socialLinks: z
    .object({
      facebook: optionalUrlSchema,
      instagram: optionalUrlSchema,
      linkedin: optionalUrlSchema,
      website: optionalUrlSchema
    })
    .default({})
})

export const createClubSchema = clubWriteBaseSchema.extend({
  status: z.enum(clubStatuses).default('active')
})

export const updateClubSchema = clubWriteBaseSchema
  .partial()
  .extend({
    status: z.enum(clubStatuses).optional()
  })
  .refine(input => Object.values(input).some(value => value !== undefined), {
    message: 'Choose at least one club field to update.'
  })

export const clubParamsSchema = z.object({
  clubId: z.string().trim().min(1, 'Club is required.')
})

export const clubMembershipRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(25).default(6),
  status: z.enum(['active', 'left', 'pending', 'rejected']).default('pending')
})

export const clubMembersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20),
  role: optionalEnum(clubRoles),
  search: z.string().trim().max(120).default('')
})

export const clubMembershipReviewParamsSchema = clubParamsSchema.extend({
  membershipId: z.string().trim().min(1, 'Membership request is required.')
})

export const clubMembershipRoleParamsSchema = clubParamsSchema.extend({
  membershipId: z.string().trim().min(1, 'Membership is required.')
})

export const reviewMembershipSchema = z.object({
  action: z.enum(['approve', 'reject']),
  remarks: z.string().trim().max(500).optional()
})

export const updateMembershipRoleSchema = z.object({
  clubRole: z.enum(clubRoles),
  executivePosition: z.string().trim().max(120).optional()
})

export type CreateClubInput = z.infer<typeof createClubSchema>
export type ClubListQuery = z.infer<typeof clubListQuerySchema>
export type ClubMembersQuery = z.infer<typeof clubMembersQuerySchema>
export type ClubMembershipRequestsQuery = z.infer<typeof clubMembershipRequestsQuerySchema>
export type ReviewMembershipInput = z.infer<typeof reviewMembershipSchema>
export type UpdateClubInput = z.infer<typeof updateClubSchema>
export type UpdateMembershipRoleInput = z.infer<typeof updateMembershipRoleSchema>
