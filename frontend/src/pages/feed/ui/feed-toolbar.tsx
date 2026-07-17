import { Button, Input, Segmented, Select } from 'antd'
import { RefreshCw, Search } from 'lucide-react'

import { FEED_TYPE_OPTIONS } from '../shared/constants'
import type { FeedPostType, FeedSort } from '../shared/types'

type FeedToolbarProps = {
  isRefreshing: boolean
  onRefresh: () => void
  onSearchChange: (value: string) => void
  onSortChange: (value: FeedSort) => void
  onTypeChange: (value: FeedPostType | undefined) => void
  searchTerm: string
  sort: FeedSort
  totalPosts: number
  type?: FeedPostType
}

export default function FeedToolbar({
  isRefreshing,
  onRefresh,
  onSearchChange,
  onSortChange,
  onTypeChange,
  searchTerm,
  sort,
  totalPosts,
  type
}: FeedToolbarProps) {
  return (
    <section className="grid gap-3 rounded-app border border-border bg-surface p-4 shadow-panel lg:grid-cols-[minmax(240px,1fr)_180px_220px_auto]">
      <Input
        allowClear
        aria-label="Search feed"
        onChange={event => onSearchChange(event.target.value)}
        placeholder="Search posts, announcements, updates..."
        prefix={<Search aria-hidden="true" size={17} />}
        value={searchTerm}
      />

      <Select
        aria-label="Filter by post type"
        onChange={value => onTypeChange(value === 'all' ? undefined : (value as FeedPostType))}
        options={FEED_TYPE_OPTIONS}
        value={type ?? 'all'}
      />

      <div className="min-w-0 overflow-x-auto">
        <Segmented
          aria-label="Sort feed"
          block
          onChange={value => onSortChange(value as FeedSort)}
          options={[
            { label: 'Latest', value: 'latest' },
            { label: 'Popular', value: 'popular' }
          ]}
          value={sort}
        />
      </div>

      <Button icon={<RefreshCw size={16} />} loading={isRefreshing} onClick={onRefresh}>
        {totalPosts} posts
      </Button>
    </section>
  )
}
