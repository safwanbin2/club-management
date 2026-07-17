import type { PaginatedResult } from '../../types/pagination.js'
import type { EventClubDto } from '../event/event.dto.types.js'
import type { PollStatus, PollType, PollVisibility } from './poll.types.js'

export type PollOptionDto = {
  id: string
  label: string
  voteCount: number
}

export type PollVoteDto = {
  createdAt: string
  id: string
  selectedOptionIds: string[]
  userId: string
}

export type PollDto = {
  canManage: boolean
  canVote: boolean
  closesAt: string
  club: EventClubDto
  createdAt: string
  currentUserVote: PollVoteDto | null
  id: string
  options: PollOptionDto[]
  question: string
  status: PollStatus
  totalVotes: number
  type: PollType
  updatedAt: string
  visibility: PollVisibility
}

export type PollListResult = PaginatedResult<PollDto>
