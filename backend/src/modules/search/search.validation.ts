import { z } from 'zod'

export const searchQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(10).default(5),
  q: z.string().trim().max(140).default(''),
  type: z.enum(['all', 'clubs', 'events', 'posts', 'profiles']).default('all')
})

export type SearchQuery = z.infer<typeof searchQuerySchema>
