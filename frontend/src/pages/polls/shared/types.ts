import type { PaginatedData } from '@common/types/api'
import type { EventClub } from '@pages/events/shared/types'

export type PollStatus = 'closed' | 'draft' | 'open'
export type PollType = 'multiple_choice' | 'single_choice'
export type PollVisibility = 'anonymous' | 'public'
export type PollScope = 'all' | 'managed' | 'myClubs' | 'voted'

export type PollOption = {
  id: string
  label: string
  voteCount: number
}

export type PollVote = {
  createdAt: string
  id: string
  selectedOptionIds: string[]
  userId: string
}

export type PollItem = {
  canManage: boolean
  canVote: boolean
  closesAt: string
  club: EventClub
  createdAt: string
  currentUserVote: PollVote | null
  id: string
  options: PollOption[]
  question: string
  status: PollStatus
  totalVotes: number
  type: PollType
  updatedAt: string
  visibility: PollVisibility
}

export type PollListPayload = {
  page: number
  perPage: number
  scope: PollScope
  search: string
  status: PollStatus | 'all'
}

export type CreatePollPayload = {
  closesAt: string
  clubId: string
  options: string[]
  question: string
  status: Extract<PollStatus, 'draft' | 'open'>
  type: PollType
  visibility: PollVisibility
}

export type VotePollPayload = {
  pollId: string
  selectedOptionIds: string[]
}

export type UpdatePollStatusPayload = {
  pollId: string
  status: Extract<PollStatus, 'closed' | 'open'>
}

export type PollListResponse = PaginatedData<PollItem>
