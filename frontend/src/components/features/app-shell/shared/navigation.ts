import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
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
    enabled: false,
    icon: Users,
    key: 'clubs',
    label: 'Club Directory',
    path: '/clubs'
  },
  {
    enabled: false,
    icon: Newspaper,
    key: 'feed',
    label: 'News Feed',
    path: '/feed'
  },
  {
    enabled: false,
    icon: CalendarDays,
    key: 'events',
    label: 'Events',
    path: '/events'
  }
]

export const ROLE_NAV_ITEMS: Record<UserRole, AppNavItem[]> = {
  [USER_ROLES.clubExecutive]: [
    ...sharedItems,
    {
      enabled: false,
      icon: ClipboardList,
      key: 'member-requests',
      label: 'Member Requests',
      path: '/executive/members'
    },
    {
      enabled: false,
      icon: Settings,
      key: 'settings',
      label: 'Club Settings',
      path: '/settings'
    }
  ],
  [USER_ROLES.student]: [
    ...sharedItems,
    {
      enabled: false,
      icon: Bell,
      key: 'notifications',
      label: 'Notifications',
      path: '/notifications'
    },
    {
      enabled: false,
      icon: Settings,
      key: 'settings',
      label: 'Settings',
      path: '/settings'
    }
  ],
  [USER_ROLES.universityAdmin]: [
    ...sharedItems,
    {
      enabled: false,
      icon: ShieldCheck,
      key: 'approval-queue',
      label: 'Approval Queue',
      path: '/admin/approvals'
    },
    {
      enabled: false,
      icon: Settings,
      key: 'settings',
      label: 'System Settings',
      path: '/settings'
    }
  ]
}
