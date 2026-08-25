import { z } from 'zod'

export const assistantChatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required.').max(2000),
  previousInteractionId: z
    .string()
    .trim()
    .max(240)
    .optional()
    .or(z.literal(''))
    .transform(value => value || undefined)
})

export type AssistantChatRequest = z.infer<typeof assistantChatSchema>
