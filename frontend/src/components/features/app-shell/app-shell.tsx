import { Avatar, Badge, Button, Drawer, Dropdown, Input, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { Bell, GraduationCap, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

import { ROLE_LABELS } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import useNotificationUnreadCount from './data/use-notification-unread-count'
import useLogout from './data/use-logout'
import { ROLE_NAV_ITEMS } from './shared/navigation'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
}

function Brand() {
  return (
    <Link className="flex items-center gap-3 text-primary" to="/dashboard">
      <span className="grid size-11 place-items-center rounded-app bg-primary text-white">
        <GraduationCap size={24} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-xl font-bold leading-tight">CampusHub</span>
        <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
          Club Management
        </span>
      </span>
    </Link>
  )
}

type NavItemsProps = {
  compact?: boolean
  itemsOverride?: (typeof ROLE_NAV_ITEMS)[keyof typeof ROLE_NAV_ITEMS]
  onNavigate?: () => void
}

function NavItems({ compact = false, itemsOverride, onNavigate }: NavItemsProps) {
  const user = useAuthUser()
  const items = itemsOverride ?? (user ? ROLE_NAV_ITEMS[user.role] : [])

  return (
    <nav className={compact ? 'grid grid-cols-4 gap-1' : 'space-y-2'}>
      {items.map(item => {
        const Icon = item.icon
        const content = (
          <span
            className={
              compact
                ? 'flex min-w-0 flex-col items-center gap-1 rounded-app px-1 py-2 text-xs font-semibold'
                : 'flex items-center gap-3 rounded-app px-4 py-3 text-sm font-semibold'
            }
          >
            <Icon size={compact ? 20 : 19} />
            <span className={compact ? 'truncate' : undefined}>{item.label}</span>
          </span>
        )

        if (!item.enabled) {
          return (
            <Tooltip key={item.key} title="Available in a later slice">
              <button
                className={
                  compact
                    ? 'min-w-0 cursor-not-allowed text-text-muted'
                    : 'w-full cursor-not-allowed text-left text-text-muted'
                }
                type="button"
              >
                {content}
              </button>
            </Tooltip>
          )
        }

        return (
          <NavLink
            key={item.key}
            className={({ isActive }) =>
              [
                compact ? 'text-text-soft' : 'block text-text-soft',
                isActive ? 'text-primary' : 'hover:text-primary',
                isActive && !compact ? 'rounded-app bg-primary-soft' : '',
                isActive && compact ? 'rounded-app bg-primary text-white shadow-panel' : ''
              ]
                .filter(Boolean)
                .join(' ')
            }
            onClick={onNavigate}
            to={item.path}
          >
            {content}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthUser()
  const logout = useLogout()
  const { unreadCount } = useNotificationUnreadCount()
  const [globalSearchTerm, setGlobalSearchTerm] = useState('')
  const [isMobileNavOpen, setMobileNavOpen] = useState(false)
  const roleNavItems = user ? ROLE_NAV_ITEMS[user.role] : []
  const bottomNavItems = roleNavItems.filter(item =>
    ['clubs', 'dashboard', 'events', 'feed'].includes(item.key)
  )

  useEffect(() => {
    if (location.pathname === '/search') {
      setGlobalSearchTerm(new URLSearchParams(location.search).get('q') ?? '')
    }
  }, [location.pathname, location.search])

  const submitGlobalSearch = () => {
    const query = globalSearchTerm.trim()

    if (query.length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'account',
      label: user?.email,
      type: 'group'
    },
    {
      icon: <UserRound size={16} />,
      key: 'profile',
      label: 'Profile'
    },
    {
      icon: <Settings size={16} />,
      key: 'settings',
      label: 'Settings'
    },
    {
      danger: true,
      icon: <LogOut size={16} />,
      key: 'logout',
      label: 'Sign out'
    }
  ]

  const handleMenuClick: MenuProps['onClick'] = info => {
    if (info.key === 'profile') {
      navigate('/profile')
      return
    }

    if (info.key === 'settings') {
      navigate('/settings')
      return
    }

    if (info.key === 'logout') {
      logout.mutate(undefined, {
        onSettled: () => {
          navigate('/login', { replace: true })
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-text lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-primary-soft/55 p-5 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-8 rounded-app border border-border bg-surface p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
            {user ? ROLE_LABELS[user.role] : 'Workspace'}
          </p>
          <p className="m-0 mt-1 text-sm font-semibold text-text">{user?.name}</p>
        </div>
        <div className="mt-6 flex-1 overflow-y-auto pr-1">
          <NavItems />
        </div>
        <Button
          danger
          ghost
          icon={<LogOut size={18} />}
          loading={logout.isPending}
          onClick={() => logout.mutate()}
        >
          Sign out
        </Button>
      </aside>

      <div className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-surface/95 px-3 backdrop-blur sm:gap-3 sm:px-5 lg:px-6">
          <Button
            className="lg:hidden"
            icon={<Menu size={20} />}
            onClick={() => setMobileNavOpen(true)}
            type="text"
            aria-label="Open navigation"
          />
          <div className="hidden lg:block">
            <Brand />
          </div>
          <Input
            allowClear
            className="min-w-0 flex-1 lg:max-w-xl"
            onChange={event => setGlobalSearchTerm(event.target.value)}
            onPressEnter={submitGlobalSearch}
            prefix={<Search size={18} aria-hidden="true" />}
            placeholder="Search clubs, events, posts..."
            value={globalSearchTerm}
          />
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 xl:inline-flex">
              {user ? ROLE_LABELS[user.role] : 'Role'}
            </span>
            <Button
              icon={
                <Badge count={unreadCount} offset={[5, -4]} size="small">
                  <Bell size={18} />
                </Badge>
              }
              onClick={() => navigate('/notifications')}
              shape="circle"
              type="text"
              aria-label="Notifications"
            />
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <button className="flex items-center gap-2 rounded-full" type="button">
                <Avatar className="bg-primary" size={36}>
                  {user ? getInitials(user.name) : 'U'}
                </Avatar>
              </button>
            </Dropdown>
          </div>
        </header>

        {children}
      </div>

      <Drawer
        destroyOnClose
        onClose={() => setMobileNavOpen(false)}
        open={isMobileNavOpen}
        placement="left"
        title={<Brand />}
        width="min(304px, 100vw)"
      >
        <div className="space-y-5">
          <div className="rounded-app border border-border bg-primary-soft/55 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
              {user ? ROLE_LABELS[user.role] : 'Workspace'}
            </p>
            <p className="m-0 mt-1 text-sm font-semibold text-text">{user?.name}</p>
          </div>

          <NavItems onNavigate={() => setMobileNavOpen(false)} />

          <Button
            block
            danger
            icon={<LogOut size={18} />}
            loading={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  setMobileNavOpen(false)
                  navigate('/login', { replace: true })
                }
              })
            }
          >
            Sign out
          </Button>
        </div>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-2 py-2 shadow-panel lg:hidden">
        <NavItems compact itemsOverride={bottomNavItems} />
      </div>
    </div>
  )
}
