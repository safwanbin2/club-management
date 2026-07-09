import type { UserRole } from '../../constants/roles.js'
import type { UserDto } from '../user/user.types.js'

export type DashboardTone = 'danger' | 'info' | 'primary' | 'success' | 'warning'

export type DashboardMetric = {
  change: string
  id: string
  label: string
  tone: DashboardTone
  value: string
}

export type DashboardAction = {
  id: string
  label: string
  path: string
  tone: 'primary' | 'secondary'
}

export type DashboardListItem = {
  description: string
  id: string
  meta: string
  status: string
  title: string
  tone: DashboardTone
}

export type DashboardPanel = {
  emptyDescription: string
  emptyTitle: string
  id: string
  items: DashboardListItem[]
  title: string
}

export type DashboardSummary = {
  actions: DashboardAction[]
  generatedAt: string
  hero: {
    eyebrow: string
    title: string
    subtitle: string
  }
  metrics: DashboardMetric[]
  panels: DashboardPanel[]
  role: UserRole
  user: UserDto
}
