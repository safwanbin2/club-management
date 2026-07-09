import type { Types } from 'mongoose'

export type PollStatus = 'closed' | 'draft' | 'open'

export type PollType = 'multiple_choice' | 'single_choice'

export type PollVisibility = 'anonymous' | 'public'

export type PollOption = {
  id: string
  label: string
  voteCount: number
}

export type Poll = {
  closesAt: Date
  club: Types.ObjectId
  createdAt: Date
  createdBy: Types.ObjectId
  deletedAt: Date | null
  options: PollOption[]
  question: string
  status: PollStatus
  totalVotes: number
  type: PollType
  updatedAt: Date
  visibility: PollVisibility
}
