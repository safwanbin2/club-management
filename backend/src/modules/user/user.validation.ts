import { z } from 'zod'

const notificationPreferencesSchema = z.object({
  emailDigest: z.boolean(),
  eventReminders: z.boolean(),
  inApp: z.boolean(),
  membershipUpdates: z.boolean()
})

export const userProfileParamsSchema = z.object({
  userId: z.string().trim().min(1, 'User is required.')
})

export const updateOwnProfileSchema = z.object({
  avatarUrl: z
    .string()
    .trim()
    .url('Avatar must be a valid URL.')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  department: z.string().trim().max(120).optional(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  studentId: z.string().trim().max(80).optional()
})

export const updateAccountSettingsSchema = z.object({
  notificationPreferences: notificationPreferencesSchema,
  profileVisibility: z.enum(['private', 'public', 'university'])
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.')
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateAccountSettingsInput = z.infer<typeof updateAccountSettingsSchema>
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>
