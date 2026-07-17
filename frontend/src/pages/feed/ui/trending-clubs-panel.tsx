import { Avatar, Button, Empty, Skeleton } from 'antd'
import { ArrowUpRight, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatCount, getEntityInitials } from '../shared/helpers'
import type { FeedTrendingClub } from '../shared/types'

type TrendingClubsPanelProps = {
  isPending: boolean
  clubs: FeedTrendingClub[]
}

export default function TrendingClubsPanel({ clubs, isPending }: TrendingClubsPanelProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 inline-flex items-center gap-2 text-lg font-bold text-text">
            <Flame aria-hidden="true" className="text-primary" size={19} />
            Trending Clubs
          </h2>
          <Link className="text-sm font-semibold text-primary" to="/clubs">
            See all
          </Link>
        </div>

        {isPending ? <Skeleton active paragraph={{ rows: 4 }} /> : null}

        {!isPending && clubs.length === 0 ? (
          <Empty description="No feed activity yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : null}

        {!isPending && clubs.length > 0 ? (
          <div className="space-y-4">
            {clubs.map(club => (
              <Link
                className="group flex items-center gap-3 rounded-app border border-transparent p-2 transition hover:border-border hover:bg-muted"
                key={club.id}
                to={`/clubs/${club.slug}`}
              >
                <Avatar className="bg-primary text-white" src={club.logoUrl ?? undefined}>
                  {getEntityInitials(club.name)}
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text">
                    {club.name}
                  </span>
                  <span className="block text-xs text-text-soft">
                    {formatCount(club.memberCount)} members • {formatCount(club.postCount)} posts
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="text-text-muted transition group-hover:text-primary"
                  size={16}
                />
              </Link>
            ))}
          </div>
        ) : null}

        <Button block className="mt-4" href="/clubs">
          Browse Clubs
        </Button>
      </section>
    </aside>
  )
}
