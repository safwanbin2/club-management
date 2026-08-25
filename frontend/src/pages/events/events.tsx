import { Alert, App as AntApp, Button, Empty, Pagination, Tooltip } from 'antd'
import { CalendarDays, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { USER_ROLES } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import useCancelEventRegistration from './data/use-cancel-event-registration'
import useCreateEvent from './data/use-create-event'
import useDeleteEvent from './data/use-delete-event'
import useEventRegistrations from './data/use-event-registrations'
import useEvents from './data/use-events'
import useManageableEventClubs from './data/use-manageable-event-clubs'
import useRegisterEvent from './data/use-register-event'
import useReviewEventRegistration from './data/use-review-event-registration'
import useUpdateEvent from './data/use-update-event'
import {
  parseEventScope,
  parseEventSort,
  parseEventStatus,
  parseEventTimeframe,
  parsePage,
  parsePerPage,
  parseRegistrationStatus
} from './shared/helpers'
import type {
  CreateEventPayload,
  EventItem,
  EventListPayload,
  EventRegistrationStatus,
  UpdateEventPayload
} from './shared/types'
import EventCard from './ui/event-card'
import EventFormModal from './ui/event-form-modal'
import EventPaymentModal from './ui/event-payment-modal'
import EventRegistrationsDrawer from './ui/event-registrations-drawer'
import EventsSkeleton from './ui/events-skeleton'
import EventsToolbar from './ui/events-toolbar'

type ParamUpdates = Record<string, null | number | string | undefined>

function canManageEvents(role: null | string | undefined) {
  return role === USER_ROLES.clubExecutive || role === USER_ROLES.universityAdmin
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const [isFormOpen, setFormOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [paymentEvent, setPaymentEvent] = useState<EventItem | null>(null)
  const [registrationsEventId, setRegistrationsEventId] = useState<null | string>(null)
  const [registrationStatus, setRegistrationStatus] = useState<EventRegistrationStatus>('pending')
  const urlSearchTerm = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350)
  const userCanManage = canManageEvents(user?.role)

  const updateSearchParams = useCallback(
    (updates: ParamUpdates) => {
      const nextParams = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          nextParams.delete(key)
        } else {
          nextParams.set(key, String(value))
        }
      })

      setSearchParams(nextParams)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    setSearchTerm(urlSearchTerm)
  }, [urlSearchTerm])

  useEffect(() => {
    const trimmedSearchTerm = debouncedSearchTerm.trim()

    if (trimmedSearchTerm !== urlSearchTerm) {
      updateSearchParams({ page: 1, search: trimmedSearchTerm })
    }
  }, [debouncedSearchTerm, updateSearchParams, urlSearchTerm])

  useEffect(() => {
    const status = searchParams.get('registrationStatus')

    if (status) {
      setRegistrationStatus(parseRegistrationStatus(status))
    }
  }, [searchParams])

  const payload: EventListPayload = useMemo(
    () => ({
      page: parsePage(searchParams.get('page')),
      perPage: parsePerPage(searchParams.get('perPage')),
      scope: parseEventScope(searchParams.get('scope')),
      search: urlSearchTerm,
      sort: parseEventSort(searchParams.get('sort')),
      status: parseEventStatus(searchParams.get('status')),
      timeframe: parseEventTimeframe(searchParams.get('timeframe'))
    }),
    [searchParams, urlSearchTerm]
  )

  const {
    currentEventPage,
    events,
    isEventsError,
    isEventsFetching,
    isEventsPending,
    lastEventPage,
    refetchEvents,
    totalEvents
  } = useEvents(payload)
  const { isManageableEventClubsPending, manageableEventClubs } =
    useManageableEventClubs(userCanManage)
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const registerEvent = useRegisterEvent()
  const reviewEventRegistration = useReviewEventRegistration()
  const cancelEventRegistration = useCancelEventRegistration()
  const registrationsEvent = events.find(event => event.id === registrationsEventId) ?? null
  const {
    eventRegistrations,
    isEventRegistrationsError,
    isEventRegistrationsPending,
    refetchEventRegistrations,
    totalEventRegistrations
  } = useEventRegistrations(
    {
      eventId: registrationsEventId ?? '',
      page: 1,
      perPage: 50,
      status: registrationStatus
    },
    Boolean(registrationsEventId)
  )

  const closeForm = () => {
    setFormOpen(false)
    setEditingEvent(null)
  }

  const handleSubmitEvent = (values: CreateEventPayload | UpdateEventPayload) => {
    if ('eventId' in values) {
      updateEvent.mutate(values, {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Event could not be updated.'))
        },
        onSuccess: () => {
          message.success('Event updated.')
          closeForm()
        }
      })
      return
    }

    createEvent.mutate(values, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Event could not be created.'))
      },
      onSuccess: () => {
        message.success('Event created.')
        closeForm()
      }
    })
  }

  const handleRegister = (event: EventItem) => {
    if (event.feeAmount > 0) {
      setPaymentEvent(event)
      return
    }

    registerEvent.mutate(
      { eventId: event.id },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Event registration could not be updated.'))
        },
        onSuccess: () => {
          message.success('Registration request submitted for executive review.')
        }
      }
    )
  }

  const handlePaymentSubmit = (event: EventItem, paymentTransactionId: string) => {
    registerEvent.mutate(
      {
        eventId: event.id,
        paymentTransactionId
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Event registration could not be updated.'))
        },
        onSuccess: () => {
          message.success('Payment submitted with registration request for executive review.')
          setPaymentEvent(null)
        }
      }
    )
  }

  const handleReviewRegistration = (
    registrationId: string,
    action: 'approve' | 'decline',
    remarks?: string
  ) => {
    if (!registrationsEventId) {
      return
    }

    reviewEventRegistration.mutate(
      {
        action,
        eventId: registrationsEventId,
        registrationId,
        remarks
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Registration could not be reviewed.'))
        },
        onSuccess: registration => {
          message.success(
            registration.data.status === 'declined'
              ? 'Registration declined.'
              : 'Registration approved.'
          )
        }
      }
    )
  }

  const handleCancelRegistration = (event: EventItem) => {
    cancelEventRegistration.mutate(
      {
        eventId: event.id
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Event registration could not be cancelled.'))
        },
        onSuccess: () => {
          message.success('Event registration cancelled.')
        }
      }
    )
  }

  const handleDelete = (event: EventItem) => {
    deleteEvent.mutate(event.id, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Event could not be deleted.'))
      },
      onSuccess: () => {
        message.success('Event deleted.')
      }
    })
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Events">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Campus events
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Upcoming Events</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Discover club events, register for open seats, and join waitlists when capacity is
              full.
            </p>
          </div>

          {userCanManage ? (
            <Tooltip
              title={
                manageableEventClubs.length === 0 && !isManageableEventClubsPending
                  ? 'You need an active managed club to create events.'
                  : undefined
              }
            >
              <Button
                disabled={manageableEventClubs.length === 0 && !isManageableEventClubsPending}
                icon={<Plus size={17} />}
                onClick={() => setFormOpen(true)}
                type="primary"
              >
                Create Event
              </Button>
            </Tooltip>
          ) : null}
        </section>

        <EventsToolbar
          isRefreshing={isEventsFetching && !isEventsPending}
          onRefresh={() => refetchEvents()}
          onScopeChange={scope => updateSearchParams({ page: 1, scope })}
          onSearchChange={setSearchTerm}
          onSortChange={sort => updateSearchParams({ page: 1, sort })}
          onStatusChange={status => updateSearchParams({ page: 1, status })}
          onTimeframeChange={timeframe => updateSearchParams({ page: 1, timeframe })}
          scope={payload.scope}
          searchTerm={searchTerm}
          sort={payload.sort}
          status={payload.status}
          timeframe={payload.timeframe}
          totalEvents={totalEvents}
        />

        {isEventsError ? (
          <Alert
            action={
              <Button icon={<RefreshCw size={16} />} onClick={() => refetchEvents()}>
                Retry
              </Button>
            }
            message="Events could not load"
            showIcon
            type="error"
          />
        ) : null}

        {isEventsPending ? <EventsSkeleton /> : null}

        {!isEventsPending && events.length === 0 ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="No events match these filters" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button
                onClick={() =>
                  updateSearchParams({
                    page: 1,
                    perPage: null,
                    scope: null,
                    search: null,
                    sort: null,
                    status: null,
                    timeframe: null
                  })
                }
              >
                Clear Filters
              </Button>
            </Empty>
          </section>
        ) : null}

        {events.length > 0 ? (
          <section className="space-y-5" aria-label="Event results">
            {events.map(event => (
              <EventCard
                event={event}
                isDeleting={deleteEvent.isPending && deleteEvent.variables === event.id}
                isRegistering={
                  (registerEvent.isPending && registerEvent.variables?.eventId === event.id) ||
                  (cancelEventRegistration.isPending &&
                    cancelEventRegistration.variables?.eventId === event.id)
                }
                key={event.id}
                onCancelRegistration={handleCancelRegistration}
                onDelete={handleDelete}
                onEdit={activeEvent => {
                  setEditingEvent(activeEvent)
                  setFormOpen(true)
                }}
                onRegister={handleRegister}
                onViewRegistrations={activeEvent => setRegistrationsEventId(activeEvent.id)}
              />
            ))}
          </section>
        ) : null}

        {lastEventPage > 1 || totalEvents > payload.perPage ? (
          <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
            <Pagination
              current={currentEventPage}
              onChange={(page, perPage) => updateSearchParams({ page, perPage })}
              pageSize={payload.perPage}
              pageSizeOptions={[6, 8, 12, 24]}
              showSizeChanger
              total={totalEvents}
            />
          </div>
        ) : null}

        {isEventsFetching && !isEventsPending ? (
          <p className="m-0 text-center text-sm font-semibold text-text-soft">
            Refreshing events...
          </p>
        ) : null}

        <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-app bg-primary-soft text-primary">
              <CalendarDays aria-hidden="true" size={20} />
            </span>
            <div>
              <h2 className="m-0 text-lg font-bold text-text">Waitlist Rule</h2>
              <p className="m-0 text-sm text-text-soft">
                Full events automatically place new registrations on the waitlist, and the first
                waitlisted student is promoted when a confirmed attendee cancels.
              </p>
            </div>
          </div>
        </section>

        <EventFormModal
          clubs={manageableEventClubs}
          event={editingEvent}
          isClubsPending={isManageableEventClubsPending}
          isOpen={isFormOpen}
          isSubmitting={createEvent.isPending || updateEvent.isPending}
          onClose={closeForm}
          onSubmit={handleSubmitEvent}
        />

        <EventRegistrationsDrawer
          event={registrationsEvent}
          isError={isEventRegistrationsError}
          isOpen={Boolean(registrationsEventId)}
          isPending={isEventRegistrationsPending}
          isReviewPending={reviewEventRegistration.isPending}
          onClose={() => setRegistrationsEventId(null)}
          onRetry={() => refetchEventRegistrations()}
          onReview={handleReviewRegistration}
          onStatusChange={status => {
            setRegistrationStatus(status)
            updateSearchParams({ registrationStatus: status })
          }}
          registrations={eventRegistrations}
          status={registrationStatus}
          totalRegistrations={totalEventRegistrations}
        />

        <EventPaymentModal
          event={paymentEvent}
          isOpen={Boolean(paymentEvent)}
          isSubmitting={registerEvent.isPending}
          onClose={() => setPaymentEvent(null)}
          onSubmit={handlePaymentSubmit}
        />
      </main>
    </AppShell>
  )
}
