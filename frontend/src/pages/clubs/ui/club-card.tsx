import { Tag } from 'antd'
import { ArrowRight, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { ClubListItem } from '../shared/types'
import {
  formatClubCategory,
  formatClubStatus,
  formatMemberCount,
  formatMembershipStatus
} from '../shared/helpers'
import ClubMembershipAction from './club-membership-action'
import ClubVisual from './club-visual'

type ClubCardProps = {
  club: ClubListItem
  isLeavePending?: boolean
  isRequestPending?: boolean
  onLeave: (clubId: string) => void
  onRequest: (clubId: string) => void
}

export default function ClubCard({
  club,
  isLeavePending,
  isRequestPending,
  onLeave,
  onRequest
}: ClubCardProps) {
  const membership = club.currentUserMembership

  return (
    <article className="overflow-hidden rounded-app border border-border bg-surface shadow-panel">
      <Link className="block h-44 border-b border-border" to={`/clubs/${club.slug}`}>
        <ClubVisual club={club} />
      </Link>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Tag color="blue">{formatClubCategory(club.category)}</Tag>
          <Tag color={club.status === 'active' ? 'green' : 'gold'}>
            {formatClubStatus(club.status)}
          </Tag>
          {membership ? (
            <Tag color={membership.status === 'active' ? 'green' : 'gold'}>
              {formatMembershipStatus(membership.status)}
            </Tag>
          ) : null}
          {club.canManage ? (
            <Tag className="inline-flex items-center gap-1" color="magenta">
              <ShieldCheck size={13} aria-hidden="true" />
              Manage
            </Tag>
          ) : null}
        </div>

        <div>
          <Link className="group inline-flex items-start gap-2" to={`/clubs/${club.slug}`}>
            <h2 className="m-0 text-xl font-bold text-text group-hover:text-primary">
              {club.name}
            </h2>
            <ArrowRight
              className="mt-1 text-primary opacity-0 transition group-hover:opacity-100"
              size={16}
            />
          </Link>
          <p className="mb-0 mt-2 line-clamp-3 text-sm leading-6 text-text-soft">
            {club.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-soft">
            <Users size={17} aria-hidden="true" />
            {formatMemberCount(club.memberCount)} members
          </span>
          <ClubMembershipAction
            club={club}
            isLeavePending={isLeavePending}
            isRequestPending={isRequestPending}
            onLeave={onLeave}
            onRequest={onRequest}
            size="small"
          />
        </div>
      </div>
    </article>
  )
}
