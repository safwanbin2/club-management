import { Alert, App as AntApp, Button, Empty, Tag } from 'antd'
import { CalendarDays, Mail, MapPin, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import UserProfileLink from '@features/user-profile-link'
import useClubMembers from './data/use-club-members'
import useClubDetail from './data/use-club-detail'
import useLeaveClub from './data/use-leave-club'
import useMembershipRequests from './data/use-membership-requests'
import useRequestMembership from './data/use-request-membership'
import useReviewMembershipRequest from './data/use-review-membership-request'
import useUpdateMembershipRole from './data/use-update-membership-role'
import {
  createMembershipRequestsPayload,
  formatClubCategory,
  formatDateTime,
  formatMemberCount
} from './shared/helpers'
import type { ClubMember, ClubMembershipRequest } from './shared/types'
import ClubDetailHero from './ui/club-detail-hero'
import ClubDetailSkeleton from './ui/club-detail-skeleton'
import ClubMembersPanel from './ui/club-members-panel'
import MembershipRequestsPanel from './ui/membership-requests-panel'

export default function ClubDetailPage() {
  const { clubId } = useParams()
  const { message } = AntApp.useApp()
  const requestMembership = useRequestMembership()
  const leaveClub = useLeaveClub()
  const reviewMembership = useReviewMembershipRequest()
  const updateMembershipRole = useUpdateMembershipRole()
  const requestPayload = useMemo(() => createMembershipRequestsPayload(), [])
  const membersPayload = useMemo(() => ({ page: 1, perPage: 50, search: '' }), [])
  const { clubDetail, isClubDetailError, isClubDetailPending, refetchClubDetail } =
    useClubDetail(clubId)
  const canViewMembers = Boolean(
    clubDetail?.canManage || clubDetail?.currentUserMembership?.status === 'active'
  )
  const {
    clubMembers,
    isClubMembersError,
    isClubMembersFetching,
    refetchClubMembers,
    totalClubMembers
  } = useClubMembers(clubId, membersPayload, {
    enabled: canViewMembers
  })
  const {
    isMembershipRequestsError,
    isMembershipRequestsFetching,
    membershipRequests,
    refetchMembershipRequests,
    totalMembershipRequests
  } = useMembershipRequests(clubId, requestPayload, {
    enabled: Boolean(clubDetail?.canManage)
  })

  if (!clubId) {
    return <Navigate replace to="/clubs" />
  }

  const handleRequest = (identifier: string) => {
    requestMembership.mutate(identifier, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Membership request could not be submitted.'))
      },
      onSuccess: () => {
        message.success('Membership request submitted.')
      }
    })
  }

  const handleLeave = (identifier: string) => {
    leaveClub.mutate(identifier, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Membership could not be updated.'))
      },
      onSuccess: () => {
        message.success('Membership updated.')
      }
    })
  }

  const handleReview = (request: ClubMembershipRequest, action: 'approve' | 'reject') => {
    reviewMembership.mutate(
      {
        action,
        clubId,
        membershipId: request.id
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Membership request could not be reviewed.'))
        },
        onSuccess: () => {
          message.success(action === 'approve' ? 'Membership approved.' : 'Membership rejected.')
        }
      }
    )
  }

  const handleUpdateMembershipRole = (
    member: ClubMember,
    clubRole: 'executive' | 'member',
    executivePosition?: string
  ) => {
    updateMembershipRole.mutate(
      {
        clubId,
        clubRole,
        executivePosition,
        membershipId: member.id
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Membership role could not be updated.'))
        },
        onSuccess: () => {
          message.success('Membership role updated.')
        }
      }
    )
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8">
        {isClubDetailPending ? <ClubDetailSkeleton /> : null}

        {isClubDetailError ? (
          <Alert
            action={
              <Button icon={<RefreshCw size={16} />} onClick={() => refetchClubDetail()}>
                Retry
              </Button>
            }
            message="Club detail could not load"
            showIcon
            type="error"
          />
        ) : null}

        {clubDetail ? (
          <>
            <ClubDetailHero
              club={clubDetail}
              isLeavePending={leaveClub.isPending && leaveClub.variables === clubDetail.slug}
              isRequestPending={
                requestMembership.isPending && requestMembership.variables === clubDetail.slug
              }
              onLeave={handleLeave}
              onRequest={handleRequest}
            />

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
              <div className="space-y-5">
                <section className="rounded-app border border-border bg-surface p-5 shadow-panel lg:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-primary" size={20} aria-hidden="true" />
                    <h2 className="m-0 text-2xl font-bold text-text">About The Club</h2>
                  </div>
                  <p className="mb-5 text-base leading-7 text-text-soft">
                    {clubDetail.description}
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-app border border-border bg-muted p-4">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
                        Category
                      </p>
                      <p className="m-0 mt-2 text-lg font-bold text-text">
                        {formatClubCategory(clubDetail.category)}
                      </p>
                    </div>
                    <div className="rounded-app border border-border bg-muted p-4">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
                        Active Members
                      </p>
                      <p className="m-0 mt-2 text-lg font-bold text-text">
                        {formatMemberCount(clubDetail.membershipSummary.active)}
                      </p>
                    </div>
                    {clubDetail.canManage ? (
                      <div className="rounded-app border border-border bg-muted p-4">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-text-soft">
                          Pending Queue
                        </p>
                        <p className="m-0 mt-2 text-lg font-bold text-text">
                          {formatMemberCount(clubDetail.membershipSummary.pending)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-app border border-border bg-surface shadow-panel">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="m-0 text-xl font-bold text-text">Executive Committee</h2>
                  </div>
                  {clubDetail.executiveCommittee.length > 0 ? (
                    <div className="divide-y divide-border">
                      {clubDetail.executiveCommittee.map(executive => (
                        <article key={executive.id} className="px-5 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="m-0 text-base font-semibold text-text">
                                <UserProfileLink
                                  className="text-text hover:text-primary"
                                  name={executive.user.name}
                                  userId={executive.user.id}
                                />
                              </h3>
                              <p className="m-0 mt-1 text-sm text-text-soft">
                                {executive.executivePosition ?? executive.clubRole}
                              </p>
                              <p className="m-0 mt-1 text-xs text-text-muted">
                                {executive.user.department ?? executive.user.email}
                              </p>
                            </div>
                            <Tag color="magenta">{executive.clubRole}</Tag>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-10">
                      <Empty
                        description="No executive committee listed"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                </section>

                {canViewMembers ? (
                  <ClubMembersPanel
                    canManage={clubDetail.canManage}
                    isError={isClubMembersError}
                    isFetching={isClubMembersFetching}
                    isRoleUpdatePending={updateMembershipRole.isPending}
                    members={clubMembers}
                    onRefresh={() => refetchClubMembers()}
                    onUpdateRole={handleUpdateMembershipRole}
                    totalMembers={totalClubMembers}
                  />
                ) : null}

                {clubDetail.canManage ? (
                  <MembershipRequestsPanel
                    isError={isMembershipRequestsError}
                    isFetching={isMembershipRequestsFetching}
                    isReviewPending={reviewMembership.isPending}
                    onRefresh={() => refetchMembershipRequests()}
                    onReview={handleReview}
                    requests={membershipRequests}
                    totalRequests={totalMembershipRequests}
                  />
                ) : null}
              </div>

              <aside className="space-y-5">
                <section className="rounded-app border border-border bg-surface shadow-panel">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="m-0 text-xl font-bold text-text">Upcoming Events</h2>
                  </div>
                  {clubDetail.upcomingEvents.length > 0 ? (
                    <div className="divide-y divide-border">
                      {clubDetail.upcomingEvents.map(event => (
                        <article key={event.id} className="px-5 py-4">
                          <div className="flex gap-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-app bg-primary-soft text-primary">
                              <CalendarDays size={20} aria-hidden="true" />
                            </span>
                            <div>
                              <h3 className="m-0 text-base font-semibold text-text">
                                {event.title}
                              </h3>
                              <p className="m-0 mt-1 inline-flex items-center gap-1 text-sm text-text-soft">
                                <MapPin size={14} aria-hidden="true" />
                                {event.venue}
                              </p>
                              <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                                {formatDateTime(event.startsAt)}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-10">
                      <Empty
                        description="No upcoming events"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                </section>

                <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                  <h2 className="m-0 text-xl font-bold text-text">Club Contact</h2>
                  <div className="mt-4 space-y-3 text-sm text-text-soft">
                    <p className="m-0">
                      <span className="font-semibold text-text">Advisor:</span>{' '}
                      {clubDetail.facultyAdvisor.name}
                    </p>
                    {clubDetail.facultyAdvisor.department ? (
                      <p className="m-0">
                        <span className="font-semibold text-text">Department:</span>{' '}
                        {clubDetail.facultyAdvisor.department}
                      </p>
                    ) : null}
                    {clubDetail.contactEmail ? (
                      <p className="m-0 inline-flex items-center gap-2">
                        <Mail size={15} aria-hidden="true" />
                        {clubDetail.contactEmail}
                      </p>
                    ) : null}
                    <p className="m-0 inline-flex items-center gap-2">
                      <Users size={15} aria-hidden="true" />
                      {formatMemberCount(clubDetail.memberCount)} members
                    </p>
                  </div>
                </section>

                <section className="rounded-app border border-border bg-primary-soft p-5 shadow-panel">
                  <h2 className="m-0 text-lg font-bold text-text">Membership Scope</h2>
                  <p className="mb-0 mt-2 text-sm leading-6 text-text-soft">
                    {clubDetail.currentUserMembership
                      ? `Your current status is ${clubDetail.currentUserMembership.status}.`
                      : 'Request membership to participate in club-only activities.'}
                  </p>
                  <Link className="mt-4 inline-flex text-sm font-semibold text-primary" to="/clubs">
                    Return to directory
                  </Link>
                </section>
              </aside>
            </section>
          </>
        ) : null}
      </main>
    </AppShell>
  )
}
