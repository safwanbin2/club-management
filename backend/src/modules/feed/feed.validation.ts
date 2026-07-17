import { z } from 'zod'

const moderationStatuses = ['deleted', 'flagged', 'hidden', 'visible'] as const
const postTypes = ['achievement', 'announcement', 'event', 'poll', 'post'] as const

function optionalEnum<TValue extends readonly [string, ...string[]]>(values: TValue) {
  return z.preprocess(
    value => (value === '' || value === 'all' ? undefined : value),
    z.enum(values).optional()
  )
}

const imageUrlsSchema = z
  .array(z.string().trim().url('Image must be a valid URL.'))
  .max(4, 'Posts can include at most 4 images.')
  .default([])

export const feedListQuerySchema = z.object({
  clubId: z.preprocess(
    value => (value === '' || value === 'all' ? undefined : value),
    z.string().trim().min(1).optional()
  ),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(20).default(8),
  search: z.string().trim().max(140).default(''),
  sort: z.enum(['latest', 'popular']).default('latest'),
  type: optionalEnum(postTypes)
})

export const feedCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(20)
})

export const feedPostParamsSchema = z.object({
  postId: z.string().trim().min(1, 'Post is required.')
})

export const feedCommentParamsSchema = feedPostParamsSchema.extend({
  commentId: z.string().trim().min(1, 'Comment is required.')
})

export const createFeedPostSchema = z.object({
  body: z.string().trim().min(10, 'Post body must be at least 10 characters.').max(4000),
  clubId: z.string().trim().min(1, 'Club is required.'),
  highlighted: z.boolean().optional(),
  images: imageUrlsSchema,
  pinned: z.boolean().default(false),
  title: z
    .string()
    .trim()
    .max(140, 'Title can be at most 140 characters.')
    .optional()
    .transform(value => (value === '' ? undefined : value)),
  type: z.enum(['achievement', 'announcement', 'post']).default('post'),
  visibility: z.enum(['members', 'public']).default('public')
})

export const createFeedCommentSchema = z.object({
  body: z.string().trim().min(2, 'Comment must be at least 2 characters.').max(1000)
})

export const moderateFeedPostSchema = z
  .object({
    highlighted: z.boolean().optional(),
    moderationStatus: z.enum(moderationStatuses).optional(),
    pinned: z.boolean().optional()
  })
  .refine(
    input =>
      input.highlighted !== undefined ||
      input.moderationStatus !== undefined ||
      input.pinned !== undefined,
    {
      message: 'Choose at least one moderation action.'
    }
  )

export const moderateFeedCommentSchema = z.object({
  moderationStatus: z.enum(moderationStatuses)
})

export type CreateFeedCommentInput = z.infer<typeof createFeedCommentSchema>
export type CreateFeedPostInput = z.infer<typeof createFeedPostSchema>
export type FeedCommentsQuery = z.infer<typeof feedCommentsQuerySchema>
export type FeedListQuery = z.infer<typeof feedListQuerySchema>
export type ModerateFeedCommentInput = z.infer<typeof moderateFeedCommentSchema>
export type ModerateFeedPostInput = z.infer<typeof moderateFeedPostSchema>
