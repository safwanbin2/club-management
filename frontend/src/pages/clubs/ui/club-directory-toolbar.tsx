import { Button, Input, Select } from 'antd'
import { Filter, Search } from 'lucide-react'

import { USER_ROLES, type UserRole } from '@common/constants/roles'
import { CLUB_CATEGORY_OPTIONS, membershipFilterOptions, sortOptions } from '../shared/constants'
import type { ClubCategory, ClubMembershipStatus, ClubStatus } from '../shared/types'

type ClubDirectoryToolbarProps = {
  category?: ClubCategory
  membershipStatus?: ClubMembershipStatus | 'none'
  onCategoryChange: (category?: ClubCategory) => void
  onMembershipStatusChange: (status?: ClubMembershipStatus | 'none') => void
  onSearchChange: (value: string) => void
  onSortChange: (value: string) => void
  onStatusChange: (status?: ClubStatus) => void
  searchTerm: string
  sortValue: string
  status?: ClubStatus
  userRole?: UserRole
}

export default function ClubDirectoryToolbar({
  category,
  membershipStatus,
  onCategoryChange,
  onMembershipStatusChange,
  onSearchChange,
  onSortChange,
  onStatusChange,
  searchTerm,
  sortValue,
  status,
  userRole
}: ClubDirectoryToolbarProps) {
  return (
    <section className="space-y-4 rounded-app border border-border bg-surface p-4 shadow-panel">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
        <Input
          allowClear
          onChange={event => onSearchChange(event.target.value)}
          placeholder="Search clubs, advisors, categories..."
          prefix={<Search size={18} aria-hidden="true" />}
          value={searchTerm}
        />
        <Select<'all' | ClubMembershipStatus | 'none'>
          onChange={value => onMembershipStatusChange(value === 'all' ? undefined : value)}
          options={membershipFilterOptions}
          value={membershipStatus ?? 'all'}
        />
        <Select onChange={onSortChange} options={[...sortOptions]} value={sortValue} />
        {userRole === USER_ROLES.universityAdmin ? (
          <Select<'all' | ClubStatus>
            onChange={value => onStatusChange(value === 'all' ? undefined : value)}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Pending', value: 'pending' },
              { label: 'Disabled', value: 'disabled' }
            ]}
            value={status ?? 'all'}
          />
        ) : (
          <Button icon={<Filter size={16} />} onClick={() => onCategoryChange(undefined)}>
            Reset
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CLUB_CATEGORY_OPTIONS.map(option => (
          <Button
            key={option.value}
            onClick={() => onCategoryChange(option.value === 'all' ? undefined : option.value)}
            type={(category ?? 'all') === option.value ? 'primary' : 'default'}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  )
}
