import {
  Bell,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Users
} from 'lucide-react'
import type { ComponentType } from 'react'

import { USER_ROLES, type UserRole } from '@common/constants/roles'

export type AppNavItem = {
  enabled: boolean
  icon: ComponentType<{ size?: number }>
  key: string
  label: string
  path: string
}

const sharedItems: AppNavItem[] = [
  {
    enabled: true,
    icon: LayoutDashboard,
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    enabled: true,
    icon: Users,
    key: 'clubs',
    label: 'Club Directory',
    path: '/clubs'
  },
  {
    enabled: true,
    icon: Newspaper,
    key: 'feed',
    label: 'News Feed',
    path: '/feed'
  },
  {
    enabled: true,
    icon: CalendarDays,
    key: 'events',
    label: 'Events',
    path: '/events'
  },
  {
    enabled: true,
    icon: ClipboardCheck,
    key: 'attendance',
    label: 'Attendance',
    path: '/attendance'
  },
  {
    enabled: true,
    icon: BarChart3,
    key: 'polls',
    label: 'Polls',
    path: '/polls'
  },
  {
    enabled: true,
    icon: MessageSquare,
    key: 'chat',
    label: 'Chat',
    path: '/chat'
  }
]

export const ROLE_NAV_ITEMS: Record<UserRole, AppNavItem[]> = {
  [USER_ROLES.clubExecutive]: [
    ...sharedItems,
    {
      enabled: true,
      icon: ClipboardList,
      key: 'resources',
      label: 'Resources',
      path: '/resources'
    },
    {
      enabled: true,
      icon: Settings,
      key: 'settings',
      label: 'Settings',
      path: '/settings'
    }
  ],
  [USER_ROLES.student]: [
    ...sharedItems,
    {
      enabled: true,
      icon: Bell,
      key: 'notifications',
      label: 'Notifications',
      path: '/notifications'
    },
    {
      enabled: true,
      icon: Settings,
      key: 'settings',
      label: 'Settings',
      path: '/settings'
    }
  ],
  [USER_ROLES.universityAdmin]: [
    ...sharedItems,
    {
      enabled: true,
      icon: ShieldCheck,
      key: 'resource-approvals',
      label: 'Approvals',
      path: '/resources'
    },
    {
      enabled: true,
      icon: Settings,
      key: 'settings',
      label: 'Settings',
      path: '/settings'
    }
  ]
}
