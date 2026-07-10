import { Button, Popconfirm, Tag } from 'antd'
import { Clock3, LogOut, UserCheck, UserPlus } from 'lucide-react'

import type { ClubListItem } from '../shared/types'
import { formatMembershipStatus } from '../shared/helpers'

type ClubMembershipActionProps = {
  club: Pick<ClubListItem, 'currentUserMembership' | 'id' | 'slug' | 'status'>
  isLeavePending?: boolean
  isRequestPending?: boolean
  onLeave: (clubId: string) => void
  onRequest: (clubId: string) => void
  size?: 'middle' | 'small'
}

export default function ClubMembershipAction({
  club,
  isLeavePending,
  isRequestPending,
  onLeave,
  onRequest,
  size = 'middle'
}: ClubMembershipActionProps) {
  const membership = club.currentUserMembership
  const clubId = club.slug || club.id

  if (club.status !== 'active') {
    return <Tag color="default">Unavailable</Tag>
  }

  if (!membership || ['left', 'rejected'].includes(membership.status)) {
    return (
      <Button
        icon={<UserPlus size={16} />}
        loading={isRequestPending}
        onClick={() => onRequest(clubId)}
        size={size}
        type="primary"
      >
        Request Join
      </Button>
    )
  }

  if (membership.status === 'pending') {
    return (
      <Popconfirm
        okButtonProps={{ danger: true }}
        okText="Cancel"
        onConfirm={() => onLeave(clubId)}
        title="Cancel this membership request?"
      >
        <Button icon={<Clock3 size={16} />} loading={isLeavePending} size={size}>
          Pending
        </Button>
      </Popconfirm>
    )
  }

  if (['advisor', 'executive'].includes(membership.clubRole)) {
    return (
      <Tag className="m-0 inline-flex items-center gap-1 py-1" color="magenta">
        <UserCheck size={14} aria-hidden="true" />
        {membership.executivePosition ?? 'Executive'}
      </Tag>
    )
  }

  return (
    <Popconfirm
      okButtonProps={{ danger: true }}
      okText="Leave"
      onConfirm={() => onLeave(clubId)}
      title="Leave this club?"
    >
      <Button danger icon={<LogOut size={16} />} loading={isLeavePending} size={size}>
        {formatMembershipStatus(membership.status)}
      </Button>
    </Popconfirm>
  )
}
