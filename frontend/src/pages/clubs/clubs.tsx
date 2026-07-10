import { Alert, App as AntApp, Button, Empty, Pagination } from 'antd'
import { RefreshCw, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import useClubs from './data/use-clubs'
import useLeaveClub from './data/use-leave-club'
import useRequestMembership from './data/use-request-membership'
import {
  parseClubCategory,
  parseClubStatus,
  parseMembershipStatus,
  parsePage,
  parsePerPage,
  parseSort
} from './shared/helpers'
import type { ClubListPayload } from './shared/types'
import ClubCard from './ui/club-card'
import ClubDirectoryToolbar from './ui/club-directory-toolbar'
import ClubsSkeleton from './ui/clubs-skeleton'

type ParamUpdates = Record<string, null | number | string | undefined>

export default function ClubsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const requestMembership = useRequestMembership()
  const leaveClub = useLeaveClub()
  const urlSearchTerm = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350)

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

  const sort = parseSort(searchParams.get('sort'))
  const payload: ClubListPayload = useMemo(
    () => ({
      category: parseClubCategory(searchParams.get('category')),
      membershipStatus: parseMembershipStatus(searchParams.get('membershipStatus')),
      page: parsePage(searchParams.get('page')),
      perPage: parsePerPage(searchParams.get('perPage')),
      search: urlSearchTerm,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      status: parseClubStatus(searchParams.get('status'))
    }),
    [searchParams, sort.sortBy, sort.sortOrder, urlSearchTerm]
  )

  const {
    clubs,
    currentClubPage,
    isClubsError,
    isClubsFetching,
    isClubsPending,
    lastClubPage,
    refetchClubs,
    totalClubs
  } = useClubs(payload)

  const handleRequest = (clubId: string) => {
    requestMembership.mutate(clubId, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Membership request could not be submitted.'))
      },
      onSuccess: () => {
        message.success('Membership request submitted.')
      }
    })
  }

  const handleLeave = (clubId: string) => {
    leaveClub.mutate(clubId, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Membership could not be updated.'))
      },
      onSuccess: () => {
        message.success('Membership updated.')
      }
    })
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Campus organizations
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Club Directory</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Browse active clubs, check membership status, and send join requests from one
              directory.
            </p>
          </div>
          <div className="rounded-app border border-border bg-surface px-4 py-3 shadow-panel">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-soft">
              <Users size={17} aria-hidden="true" />
              {totalClubs} matching club(s)
            </span>
          </div>
        </section>

        <ClubDirectoryToolbar
          category={payload.category}
          membershipStatus={payload.membershipStatus}
          onCategoryChange={category => updateSearchParams({ category, page: 1 })}
          onMembershipStatusChange={membershipStatus =>
            updateSearchParams({ membershipStatus, page: 1 })
          }
          onSearchChange={setSearchTerm}
          onSortChange={sortValue => updateSearchParams({ page: 1, sort: sortValue })}
          onStatusChange={status => updateSearchParams({ page: 1, status })}
          searchTerm={searchTerm}
          sortValue={`${payload.sortBy}:${payload.sortOrder}`}
          status={payload.status}
          userRole={user?.role}
        />

        {isClubsError ? (
          <Alert
            action={
              <Button icon={<RefreshCw size={16} />} onClick={() => refetchClubs()}>
                Retry
              </Button>
            }
            message="Club directory could not load"
            showIcon
            type="error"
          />
        ) : null}

        {isClubsPending ? <ClubsSkeleton /> : null}

        {!isClubsPending && clubs.length === 0 ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="No clubs match these filters" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Button
                onClick={() =>
                  updateSearchParams({
                    category: null,
                    membershipStatus: null,
                    page: 1,
                    search: null,
                    sort: null,
                    status: null
                  })
                }
              >
                Clear Filters
              </Button>
            </Empty>
          </section>
        ) : null}

        {clubs.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Club results">
            {clubs.map(club => (
              <ClubCard
                key={club.id}
                club={club}
                isLeavePending={leaveClub.isPending && leaveClub.variables === club.slug}
                isRequestPending={
                  requestMembership.isPending && requestMembership.variables === club.slug
                }
                onLeave={handleLeave}
                onRequest={handleRequest}
              />
            ))}
          </section>
        ) : null}

        {lastClubPage > 1 || totalClubs > payload.perPage ? (
          <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
            <Pagination
              current={currentClubPage}
              onChange={(page, perPage) => updateSearchParams({ page, perPage })}
              pageSize={payload.perPage}
              pageSizeOptions={[6, 9, 12, 24]}
              showSizeChanger
              total={totalClubs}
            />
          </div>
        ) : null}

        {isClubsFetching && !isClubsPending ? (
          <p className="m-0 text-center text-sm font-semibold text-text-soft">
            Refreshing clubs...
          </p>
        ) : null}
      </main>
    </AppShell>
  )
}
