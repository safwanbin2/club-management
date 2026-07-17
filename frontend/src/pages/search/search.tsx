import { Alert, Button, Empty, Input, List, Segmented, Skeleton, Tag } from 'antd'
import { Building2, CalendarDays, Newspaper, RefreshCw, Search, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import useSearchResults from './data/use-search-results'
import { getTypeLabel, parseSearchType } from './shared/helpers'
import type { SearchFilterType, SearchPayload, SearchResultType } from './shared/types'

type ParamUpdates = Record<string, null | number | string | undefined>

function getIcon(type: SearchResultType) {
  if (type === 'clubs') {
    return Building2
  }

  if (type === 'events') {
    return CalendarDays
  }

  if (type === 'posts') {
    return Newspaper
  }

  return UserRound
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlSearchTerm = searchParams.get('q') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300)

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
      updateSearchParams({ q: trimmedSearchTerm })
    }
  }, [debouncedSearchTerm, updateSearchParams, urlSearchTerm])

  const payload: SearchPayload = useMemo(
    () => ({
      limit: 6,
      q: urlSearchTerm,
      type: parseSearchType(searchParams.get('type'))
    }),
    [searchParams, urlSearchTerm]
  )
  const { isSearchError, isSearchPending, refetchSearch, searchResult } = useSearchResults(payload)
  const groups = searchResult?.groups ?? []
  const hasQuery = payload.q.trim().length >= 2
  const hasResults = groups.some(group => group.items.length > 0)

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Search">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Discovery
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Search</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Find clubs, events, feed posts, and profiles from one campus-wide surface.
            </p>
          </div>
          <Button
            disabled={!hasQuery}
            icon={<RefreshCw size={16} />}
            loading={isSearchPending}
            onClick={() => refetchSearch()}
            type="primary"
          >
            Refresh
          </Button>
        </section>

        <section className="grid gap-3 rounded-app border border-border bg-surface p-4 shadow-panel lg:grid-cols-[minmax(260px,1fr)_auto]">
          <Input
            allowClear
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search clubs, events, posts, profiles..."
            prefix={<Search aria-hidden="true" size={18} />}
            value={searchTerm}
          />
          <div className="min-w-0 overflow-x-auto">
            <Segmented
              onChange={type => updateSearchParams({ type: type as SearchFilterType })}
              options={[
                { label: 'All', value: 'all' },
                { label: 'Clubs', value: 'clubs' },
                { label: 'Events', value: 'events' },
                { label: 'Feed', value: 'posts' },
                { label: 'Profiles', value: 'profiles' }
              ]}
              value={payload.type}
            />
          </div>
        </section>

        {isSearchError ? <Alert message="Search could not load" showIcon type="error" /> : null}

        {!hasQuery ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty
              description="Enter at least two characters"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </section>
        ) : null}

        {isSearchPending ? <Skeleton active paragraph={{ rows: 8 }} /> : null}

        {hasQuery && !isSearchPending && !hasResults ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="No matching results" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </section>
        ) : null}

        {hasResults ? (
          <section className="space-y-5">
            {groups
              .filter(group => group.items.length > 0)
              .map(group => (
                <section
                  className="rounded-app border border-border bg-surface shadow-panel"
                  key={group.type}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                    <h2 className="m-0 text-lg font-bold text-text">{group.title}</h2>
                    <Tag>{group.total}</Tag>
                  </div>
                  <List
                    dataSource={group.items}
                    renderItem={item => {
                      const Icon = getIcon(item.type)

                      return (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <span className="grid size-11 place-items-center rounded-app bg-primary-soft text-primary">
                                <Icon aria-hidden="true" size={19} />
                              </span>
                            }
                            description={
                              <span className="block text-sm text-text-soft">
                                {item.description}
                                <span className="mt-2 block text-xs text-text-muted">
                                  {item.meta}
                                </span>
                              </span>
                            }
                            title={
                              <span className="flex flex-wrap items-center gap-2">
                                <Link
                                  className="font-bold text-text hover:text-primary"
                                  to={item.path}
                                >
                                  {item.title}
                                </Link>
                                <Tag>{getTypeLabel(item.type)}</Tag>
                              </span>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                </section>
              ))}
          </section>
        ) : null}
      </main>
    </AppShell>
  )
}
