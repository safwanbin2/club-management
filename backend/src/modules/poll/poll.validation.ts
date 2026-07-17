import { z } from 'zod'

export const pollListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(24).default(8),
  scope: z.enum(['all', 'managed', 'myClubs', 'voted']).default('all'),
  search: z.string().trim().max(140).default(''),
  status: z.enum(['all', 'closed', 'draft', 'open']).default('all')
})

export const pollParamsSchema = z.object({
  pollId: z.string().trim().min(1, 'Poll is required.')
})

export const createPollSchema = z.object({
  closesAt: z.string().datetime('Closing date must be a valid ISO date.'),
  clubId: z.string().trim().min(1, 'Club is required.'),
  options: z
    .array(z.string().trim().min(1).max(120))
    .min(2, 'Poll requires at least two options.')
    .max(8, 'Poll supports at most eight options.'),
  question: z.string().trim().min(8, 'Question must be at least 8 characters.').max(240),
  status: z.enum(['draft', 'open']).default('open'),
  type: z.enum(['multiple_choice', 'single_choice']).default('single_choice'),
  visibility: z.enum(['anonymous', 'public']).default('public')
})

export const updatePollStatusSchema = z.object({
  status: z.enum(['closed', 'open'])
})

export const votePollSchema = z.object({
  selectedOptionIds: z.array(z.string().trim().min(1)).min(1, 'Choose at least one option.')
})

export type CreatePollInput = z.infer<typeof createPollSchema>
export type PollListQuery = z.infer<typeof pollListQuerySchema>
export type UpdatePollStatusInput = z.infer<typeof updatePollStatusSchema>
export type VotePollInput = z.infer<typeof votePollSchema>
