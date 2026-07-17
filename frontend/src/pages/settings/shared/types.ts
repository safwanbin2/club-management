export type NotificationPreferences = {
  emailDigest: boolean
  eventReminders: boolean
  inApp: boolean
  membershipUpdates: boolean
}

export type AccountSettings = {
  email: string
  lastLoginAt: null | string
  notificationPreferences: NotificationPreferences
  profileVisibility: 'private' | 'public' | 'university'
}

export type UpdateAccountSettingsPayload = {
  notificationPreferences: NotificationPreferences
  profileVisibility: AccountSettings['profileVisibility']
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}
