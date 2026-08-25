import { Avatar, Button, Popconfirm, Tag } from 'antd'
import {
  CalendarDays,
  Clock,
  Edit3,
  Lock,
  MapPin,
  ShieldCheck,
  Trash2,
  Users,
  WalletCards,
  XCircle
} from 'lucide-react'

import {
  formatDateTime,
  formatEventFee,
  formatEventStatus,
  formatRegistrationStatus,
  formatTimeRange,
  getEntityInitials,
  getEventDateBadge,
  isEventRegistrationOpen,
  shouldShowEventRegistrationAction
} from '../shared/helpers'
import type { EventItem } from '../shared/types'

type EventCardProps = {
  event: EventItem
  isDeleting: boolean
  isRegistering: boolean
  onCancelRegistration: (event: EventItem) => void
  onDelete: (event: EventItem) => void
  onEdit: (event: EventItem) => void
  onRegister: (event: EventItem) => void
  onViewRegistrations: (event: EventItem) => void
}

function getStatusColor(status: EventItem['status']) {
  if (status === 'published') return 'green'
  if (status === 'draft') return 'blue'
  if (status === 'completed') return 'purple'
  return 'red'
}

function getRegistrationStatusColor(
  status: NonNullable<EventItem['currentUserRegistration']>['status']
) {
  if (status === 'registered') return 'green'
  if (status === 'waitlisted') return 'gold'
  if (status === 'pending') return 'blue'
  if (status === 'declined') return 'red'
  return 'default'
}

export default function EventCard({
  event,
  isDeleting,
  isRegistering,
  onCancelRegistration,
  onDelete,
  onEdit,
  onRegister,
  onViewRegistrations
}: EventCardProps) {
  const dateBadge = getEventDateBadge(event.startsAt)
  const canUseRegistrationActions = shouldShowEventRegistrationAction(event)
  const activeRegistration =
    canUseRegistrationActions &&
    (event.currentUserRegistration?.status === 'registered' ||
      event.currentUserRegistration?.status === 'waitlisted' ||
      event.currentUserRegistration?.status === 'pending')
      ? event.currentUserRegistration
      : null
  const declinedRegistration =
    canUseRegistrationActions && event.currentUserRegistration?.status === 'declined'
      ? event.currentUserRegistration
      : null
  const registrationOpen =
    event.status === 'published' &&
    isEventRegistrationOpen(event.startsAt, event.registrationDeadline)
  const primaryActionLabel =
    activeRegistration?.status === 'registered'
      ? 'Cancel'
      : activeRegistration?.status === 'waitlisted'
        ? 'Leave Waitlist'
        : activeRegistration?.status === 'pending'
          ? 'Cancel Request'
          : declinedRegistration
            ? event.feeAmount > 0
              ? 'Resubmit Payment'
              : 'Resubmit Request'
            : 'Request Registration'

  return (
    <article className="grid gap-4 rounded-app border border-border bg-surface p-5 shadow-panel md:grid-cols-[92px_minmax(0,1fr)]">
      <div className="flex md:block">
        <div className="grid h-[92px] w-[80px] shrink-0 place-items-center rounded-app border border-primary/20 bg-primary text-white">
          <span className="text-xs font-semibold uppercase">{dateBadge.month}</span>
          <span className="text-3xl font-bold leading-none">{dateBadge.day}</span>
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Avatar className="bg-primary text-white" src={event.club.logoUrl ?? undefined}>
                {getEntityInitials(event.club.name)}
              </Avatar>
              <span className="text-sm font-semibold text-text-soft">{event.club.name}</span>
              <Tag color={getStatusColor(event.status)}>{formatEventStatus(event.status)}</Tag>
              {event.visibility === 'members' ? (
                <Tag icon={<Lock size={13} />} color="warning">
                  Members
                </Tag>
              ) : null}
              {event.feeAmount > 0 ? (
                <Tag icon={<WalletCards size={13} />} color="blue">
                  {formatEventFee(event.feeAmount)}
                </Tag>
              ) : (
                <Tag color="green">Free</Tag>
              )}
            </div>
            <h2 className="m-0 text-2xl font-bold text-text">{event.title}</h2>
            <p className="m-0 mt-2 line-clamp-2 text-sm leading-6 text-text-soft">
              {event.description}
            </p>
          </div>

          {event.canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button icon={<Users size={16} />} onClick={() => onViewRegistrations(event)}>
                Registrations
              </Button>
              <Button icon={<Edit3 size={16} />} onClick={() => onEdit(event)}>
                Edit
              </Button>
              <Popconfirm
                okButtonProps={{ danger: true }}
                okText="Delete"
                onConfirm={() => onDelete(event)}
                title="Delete this event?"
              >
                <Button danger icon={<Trash2 size={16} />} loading={isDeleting}>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 text-sm text-text-soft md:grid-cols-3">
          <span className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" size={16} />
            {formatDateTime(event.startsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock aria-hidden="true" size={16} />
            {formatTimeRange(event.startsAt, event.endsAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin aria-hidden="true" size={16} />
            {event.venue}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-soft">
            <span className="font-semibold text-text">{event.registeredCount} attending</span>
            <span>{event.waitlistedCount} waitlisted</span>
            <span>{event.availableSpots} spots left</span>
            {activeRegistration ? (
              <Tag color={getRegistrationStatusColor(activeRegistration.status)}>
                {formatRegistrationStatus(activeRegistration.status)}
              </Tag>
            ) : null}
            {declinedRegistration ? (
              <Tag color="red">{formatRegistrationStatus(declinedRegistration.status)}</Tag>
            ) : null}
            {event.feeAmount > 0 && event.bkashNumber ? (
              <span>bKash: {event.bkashNumber}</span>
            ) : null}
          </div>

          {canUseRegistrationActions ? (
            activeRegistration ? (
              <Popconfirm
                okText="Confirm"
                onConfirm={() => onCancelRegistration(event)}
                title={
                  activeRegistration.status === 'registered'
                    ? 'Cancel this event registration?'
                    : activeRegistration.status === 'waitlisted'
                      ? 'Leave this event waitlist?'
                      : 'Cancel this pending registration request?'
                }
              >
                <Button icon={<XCircle size={16} />} loading={isRegistering}>
                  {primaryActionLabel}
                </Button>
              </Popconfirm>
            ) : (
              <Button
                disabled={!registrationOpen}
                loading={isRegistering}
                onClick={() => onRegister(event)}
                type="primary"
              >
                {registrationOpen ? primaryActionLabel : 'Closed'}
              </Button>
            )
          ) : (
            <Tag color="blue" icon={<ShieldCheck size={13} />}>
              Manager
            </Tag>
          )}
        </div>
      </div>
    </article>
  )
}
