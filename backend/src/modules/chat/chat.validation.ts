import { z } from 'zod'

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(160),
  size: z.coerce.number().int().min(0).default(0),
  type: z.enum(['image', 'other']).default('other'),
  url: z.string().trim().url()
})

export const chatClubParamsSchema = z.object({
  clubId: z.string().trim().min(1, 'Club is required.')
})

export const chatMessageParamsSchema = z.object({
  messageId: z.string().trim().min(1, 'Message is required.')
})

export const chatMessageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(30)
})

export const createChatMessageSchema = z.object({
  attachments: z.array(attachmentSchema).max(4).default([]),
  body: z.string().trim().max(1000).default(''),
  parentMessageId: z.string().trim().min(1).optional()
})

export const moderateChatMessageSchema = z.object({
  action: z.enum(['delete', 'pin', 'unpin'])
})

export const markChatReadSchema = z.object({
  messageIds: z.array(z.string().trim().min(1)).min(1).max(100)
})

export type ChatMessageListQuery = z.infer<typeof chatMessageListQuerySchema>
export type CreateChatMessageInput = z.infer<typeof createChatMessageSchema>
export type MarkChatReadInput = z.infer<typeof markChatReadSchema>
export type ModerateChatMessageInput = z.infer<typeof moderateChatMessageSchema>
