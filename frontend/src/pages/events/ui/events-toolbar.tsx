import { Button, Input, Segmented, Select } from 'antd'
import { RefreshCw, Search } from 'lucide-react'

import { EVENT_SCOPE_OPTIONS, EVENT_TIMEFRAME_OPTIONS } from '../shared/constants'
import type { EventScope, EventSort, EventStatus, EventTimeframe } from '../shared/types'

type EventsToolbarProps = {
  isRefreshing: boolean
  onRefresh: () => void
  onScopeChange: (scope: EventScope) => void
  onSearchChange: (value: string) => void
  onSortChange: (sort: EventSort) => void
  onStatusChange: (status: EventStatus | undefined) => void
  onTimeframeChange: (timeframe: EventTimeframe) => void
  scope: EventScope
  searchTerm: string
  sort: EventSort
  status?: EventStatus
  timeframe: EventTimeframe
  totalEvents: number
}

export default function EventsToolbar({
  isRefreshing,
  onRefresh,
  onScopeChange,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onTimeframeChange,
  scope,
  searchTerm,
  sort,
  status,
  timeframe,
  totalEvents
}: EventsToolbarProps) {
  return (
    <section className="grid gap-3 rounded-app border border-border bg-surface p-4 shadow-panel xl:grid-cols-[minmax(220px,1fr)_170px_160px_150px_190px_auto]">
      <Input
        allowClear
        aria-label="Search events"
        onChange={event => onSearchChange(event.target.value)}
        placeholder="Search events, venues, clubs..."
        prefix={<Search aria-hidden="true" size={17} />}
        value={searchTerm}
      />

      <Select
        aria-label="Event scope"
        onChange={onScopeChange}
        options={EVENT_SCOPE_OPTIONS}
        value={scope}
      />

      <Select
        aria-label="Event timeframe"
        onChange={onTimeframeChange}
        options={EVENT_TIMEFRAME_OPTIONS}
        value={timeframe}
      />

      <Select
        aria-label="Event status"
        onChange={value => onStatusChange(value === 'all' ? undefined : (value as EventStatus))}
        options={[
          { label: 'Any Status', value: 'all' },
          { label: 'Published', value: 'published' },
          { label: 'Draft', value: 'draft' },
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' }
        ]}
        value={status ?? 'all'}
      />

      <div className="min-w-0 overflow-x-auto">
        <Segmented
          aria-label="Sort events"
          block
          onChange={value => onSortChange(value as EventSort)}
          options={[
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Latest', value: 'latest' }
          ]}
          value={sort}
        />
      </div>

      <Button icon={<RefreshCw size={16} />} loading={isRefreshing} onClick={onRefresh}>
        {totalEvents} events
      </Button>
    </section>
  )
}
