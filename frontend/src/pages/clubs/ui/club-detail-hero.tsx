import { Button, Tag } from 'antd'
import { ArrowLeft, Mail, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ClubDetail } from '../shared/types'
import { formatClubCategory, formatMemberCount, formatMembershipStatus } from '../shared/helpers'
import ClubMembershipAction from './club-membership-action'
import ClubVisual from './club-visual'

type ClubDetailHeroProps = {
  club: ClubDetail
  isLeavePending?: boolean
  isRequestPending?: boolean
  onLeave: (clubId: string) => void
  onRequest: (clubId: string) => void
}

export default function ClubDetailHero({
  club,
  isLeavePending,
  isRequestPending,
  onLeave,
  onRequest
}: ClubDetailHeroProps) {
  return (
    <section className="overflow-hidden rounded-app border border-border bg-surface shadow-panel">
      <div className="relative min-h-[340px]">
        <ClubVisual club={club} className="absolute inset-0" variant="hero" />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative flex min-h-[340px] flex-col justify-between p-5 text-white lg:p-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-white"
            to="/clubs"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back to directory
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <Tag color="magenta">{formatClubCategory(club.category)}</Tag>
                {club.currentUserMembership ? (
                  <Tag color={club.currentUserMembership.status === 'active' ? 'green' : 'gold'}>
                    {formatMembershipStatus(club.currentUserMembership.status)}
                  </Tag>
                ) : null}
                {club.canManage ? <Tag color="purple">Executive Access</Tag> : null}
              </div>
              <h1 className="m-0 max-w-4xl text-4xl font-bold lg:text-5xl">{club.name}</h1>
              <p className="mb-0 mt-4 max-w-3xl text-base text-white/90">{club.description}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-white/90">
                <span className="inline-flex items-center gap-2">
                  <Users size={17} aria-hidden="true" />
                  {formatMemberCount(club.memberCount)} active members
                </span>
                {club.contactEmail ? (
                  <span className="inline-flex items-center gap-2">
                    <Mail size={17} aria-hidden="true" />
                    {club.contactEmail}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ClubMembershipAction
                club={club}
                isLeavePending={isLeavePending}
                isRequestPending={isRequestPending}
                onLeave={onLeave}
                onRequest={onRequest}
              />
              {club.socialLinks.website ? (
                <Button href={club.socialLinks.website} target="_blank">
                  Website
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
