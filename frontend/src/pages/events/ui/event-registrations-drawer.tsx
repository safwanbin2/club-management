import { Alert, Avatar, Button, Drawer, Empty, List, Segmented, Skeleton, Tag } from 'antd'
import { RefreshCw, Users } from 'lucide-react'

import { formatDateTime, formatRegistrationStatus, getEntityInitials } from '../shared/helpers'
import type { EventItem, EventRegistrationListItem, EventRegistrationStatus } from '../shared/types'

type EventRegistrationsDrawerProps = {
  event: EventItem | null
  isError: boolean
  isOpen: boolean
  isPending: boolean
  onClose: () => void
  onRetry: () => void
  onStatusChange: (status: EventRegistrationStatus) => void
  registrations: EventRegistrationListItem[]
  status: EventRegistrationStatus
  totalRegistrations: number
}

export default function EventRegistrationsDrawer({
  event,
  isError,
  isOpen,
  isPending,
  onClose,
  onRetry,
  onStatusChange,
  registrations,
  status,
  totalRegistrations
}: EventRegistrationsDrawerProps) {
  return (
    <Drawer
      destroyOnClose
      onClose={onClose}
      open={isOpen}
      title={
        <span className="inline-flex items-center gap-2">
          <Users aria-hidden="true" size={18} />
          Event Registrations
        </span>
      }
      width="min(560px, 100vw)"
    >
      {event ? (
        <div className="mb-4 rounded-app border border-border bg-muted p-4">
          <p className="m-0 text-sm font-semibold text-text-soft">{event.club.name}</p>
          <h2 className="m-0 mt-1 text-lg font-bold text-text">{event.title}</h2>
          <p className="m-0 mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
        </div>
      ) : null}

      <div className="mb-4 min-w-0 overflow-x-auto">
        <Segmented
          block
          onChange={value => onStatusChange(value as EventRegistrationStatus)}
          options={[
            { label: 'Registered', value: 'registered' },
            { label: 'Waitlisted', value: 'waitlisted' },
            { label: 'Cancelled', value: 'cancelled' }
          ]}
          value={status}
        />
      </div>

      {isError ? (
        <Alert
          action={
            <Button icon={<RefreshCw size={15} />} onClick={onRetry}>
              Retry
            </Button>
          }
          className="mb-4"
          message="Registrations could not load"
          showIcon
          type="error"
        />
      ) : null}

      {isPending ? <Skeleton active avatar paragraph={{ rows: 5 }} /> : null}

      {!isPending && registrations.length === 0 ? (
        <Empty
          description={`No ${formatRegistrationStatus(status).toLowerCase()} attendees`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : null}

      {!isPending && registrations.length > 0 ? (
        <List
          dataSource={registrations}
          footer={
            <span className="text-sm font-semibold text-text-soft">
              {totalRegistrations} {formatRegistrationStatus(status).toLowerCase()}
            </span>
          }
          renderItem={registration => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    className="bg-primary text-white"
                    src={registration.user.avatarUrl ?? undefined}
                  >
                    {getEntityInitials(registration.user.name)}
                  </Avatar>
                }
                description={
                  <span className="text-sm text-text-soft">
                    {registration.user.email}
                    {registration.waitlistPosition
                      ? ` • Waitlist #${registration.waitlistPosition}`
                      : ''}
                  </span>
                }
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text">{registration.user.name}</span>
                    <Tag color={status === 'registered' ? 'green' : 'gold'}>
                      {formatRegistrationStatus(registration.status)}
                    </Tag>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      ) : null}
    </Drawer>
  )
}
