import { Alert, App as AntApp, Button, Empty, List, Pagination, Segmented, Tag } from 'antd'
import { Bell, CheckCheck, RefreshCw } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useMarkAllNotificationsRead from './data/use-mark-all-notifications-read'
import useMarkNotificationRead from './data/use-mark-notification-read'
import useNotifications from './data/use-notifications'
import { formatDateTime, parseNotificationStatus, parsePage } from './shared/helpers'
import type { NotificationListPayload, NotificationStatus } from './shared/types'

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { message } = AntApp.useApp()
  const payload: NotificationListPayload = useMemo(
    () => ({
      page: parsePage(searchParams.get('page')),
      perPage: 12,
      status: parseNotificationStatus(searchParams.get('status'))
    }),
    [searchParams]
  )
  const {
    currentNotificationPage,
    isNotificationsError,
    isNotificationsFetching,
    isNotificationsPending,
    lastNotificationPage,
    notifications,
    refetchNotifications,
    totalNotifications
  } = useNotifications(payload)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const updateFilter = (status: NotificationStatus) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('status', status)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Notifications">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Inbox
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Notifications</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Review membership, event, poll, badge, and platform updates in one place.
            </p>
          </div>
          <Button
            icon={<CheckCheck size={17} />}
            loading={markAllRead.isPending}
            onClick={() =>
              markAllRead.mutate(undefined, {
                onError: error => {
                  message.error(getApiErrorMessage(error, 'Notifications could not be updated.'))
                },
                onSuccess: () => {
                  message.success('All notifications marked read.')
                }
              })
            }
            type="primary"
          >
            Mark All Read
          </Button>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-surface p-4 shadow-panel">
          <div className="min-w-0 overflow-x-auto">
            <Segmented
              onChange={value => updateFilter(value as NotificationStatus)}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Unread', value: 'unread' },
                { label: 'Read', value: 'read' }
              ]}
              value={payload.status}
            />
          </div>
          <Button
            icon={<RefreshCw size={16} />}
            loading={isNotificationsFetching && !isNotificationsPending}
            onClick={() => refetchNotifications()}
          >
            {totalNotifications} updates
          </Button>
        </section>

        {isNotificationsError ? (
          <Alert message="Notifications could not load" showIcon type="error" />
        ) : null}

        {!isNotificationsPending && notifications.length === 0 ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="No notifications here" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </section>
        ) : null}

        {notifications.length > 0 ? (
          <section className="rounded-app border border-border bg-surface shadow-panel">
            <List
              dataSource={notifications}
              loading={isNotificationsPending}
              renderItem={notification => (
                <List.Item
                  actions={[
                    notification.link ? (
                      <Link key="open" to={notification.link}>
                        Open
                      </Link>
                    ) : null,
                    !notification.readAt ? (
                      <Button
                        key="read"
                        loading={markRead.isPending && markRead.variables === notification.id}
                        onClick={() =>
                          markRead.mutate(notification.id, {
                            onError: error => {
                              message.error(
                                getApiErrorMessage(error, 'Notification could not be updated.')
                              )
                            }
                          })
                        }
                        type="link"
                      >
                        Mark read
                      </Button>
                    ) : null
                  ].filter(Boolean)}
                  className={notification.readAt ? undefined : 'bg-primary-soft/40'}
                >
                  <List.Item.Meta
                    avatar={
                      <span className="grid size-10 place-items-center rounded-app bg-primary-soft text-primary">
                        <Bell aria-hidden="true" size={18} />
                      </span>
                    }
                    description={
                      <span className="block text-sm text-text-soft">
                        {notification.body}
                        <span className="mt-2 block text-xs text-text-muted">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </span>
                    }
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-text">{notification.title}</span>
                        {!notification.readAt ? <Tag color="maroon">Unread</Tag> : null}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </section>
        ) : null}

        {lastNotificationPage > 1 ? (
          <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
            <Pagination
              current={currentNotificationPage}
              onChange={page => {
                const nextParams = new URLSearchParams(searchParams)
                nextParams.set('page', String(page))
                setSearchParams(nextParams)
              }}
              pageSize={payload.perPage}
              total={totalNotifications}
            />
          </div>
        ) : null}
      </main>
    </AppShell>
  )
}
