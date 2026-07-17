import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import { canActorManageClub } from '../club/club.service.js'
import type { Club } from '../club/club.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import type { UserDto } from '../user/user.types.js'
import { PollVoteModel } from './poll-vote.model.js'
import type { PollVote } from './poll-vote.types.js'
import { PollModel } from './poll.model.js'
import type { Poll, PollOption } from './poll.types.js'
import type {
  CreatePollInput,
  PollListQuery,
  UpdatePollStatusInput,
  VotePollInput
} from './poll.validation.js'
import type { PollDto, PollListResult, PollVoteDto } from './poll.dto.types.js'

type ClubLean = Club & {
  _id: Types.ObjectId
}

type MembershipLean = Membership & {
  _id: Types.ObjectId
}

type PollLean = Poll & {
  _id: Types.ObjectId
}

type PollVoteLean = PollVote & {
  _id: Types.ObjectId
}

const defaultPagination = {
  currentPage: 1,
  currentTotal: 0,
  data: [],
  lastPage: 1,
  perPage: 10,
  total: 0
} satisfies PaginatedResult<unknown>

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id)
}

function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value)
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function slugOption(label: string, index: number) {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug || `option-${index + 1}`
}

function getPagination<TItem>(
  data: TItem[],
  total: number,
  page: number,
  perPage: number
): PaginatedResult<TItem> {
  return {
    currentPage: page,
    currentTotal: data.length,
    data,
    lastPage: Math.max(Math.ceil(total / perPage), 1),
    perPage,
    total
  }
}

function toClubDto(club: ClubLean) {
  return {
    category: club.category,
    id: club._id.toString(),
    logoUrl: club.logoUrl ?? null,
    name: club.name,
    slug: club.slug
  }
}

function toVoteDto(vote: PollVoteLean): PollVoteDto {
  return {
    createdAt: vote.createdAt.toISOString(),
    id: vote._id.toString(),
    selectedOptionIds: vote.selectedOptionIds,
    userId: vote.user.toString()
  }
}

export function validateVoteSelection(
  poll: Pick<Poll, 'options' | 'status' | 'type'>,
  selectedOptionIds: string[],
  now = new Date(),
  closesAt?: Date
) {
  if (poll.status !== 'open' || (closesAt && closesAt <= now)) {
    throw new ApplicationError('Poll is closed.', 409, 'POLL_CLOSED')
  }

  const uniqueSelections = [...new Set(selectedOptionIds)]

  if (uniqueSelections.length !== selectedOptionIds.length) {
    throw new ApplicationError('Duplicate poll options are not allowed.', 422, 'INVALID_POLL_VOTE')
  }

  if (poll.type === 'single_choice' && uniqueSelections.length !== 1) {
    throw new ApplicationError('Choose exactly one option.', 422, 'INVALID_POLL_VOTE')
  }

  const optionIds = new Set(poll.options.map(option => option.id))

  if (uniqueSelections.some(optionId => !optionIds.has(optionId))) {
    throw new ApplicationError('Poll option not found.', 422, 'INVALID_POLL_VOTE')
  }

  return uniqueSelections
}

async function closeExpiredPolls() {
  await PollModel.updateMany(
    {
      closesAt: { $lte: new Date() },
      status: 'open'
    },
    {
      $set: {
        status: 'closed'
      }
    }
  )
}

async function getActiveMembershipClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    return null
  }

  const memberships = (await MembershipModel.find({
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return memberships.map(membership => membership.club)
}

async function getManagedClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    const clubs = (await ClubModel.find({ deletedAt: null, status: 'active' }).lean()) as ClubLean[]
    return clubs.map(club => club._id)
  }

  const memberships = (await MembershipModel.find({
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return memberships.map(membership => membership.club)
}

async function getManageableClubIdSet(actor: UserDto, clubIds: Types.ObjectId[]) {
  if (clubIds.length === 0) {
    return new Set<string>()
  }

  if (isUniversityAdmin(actor)) {
    return new Set(clubIds.map(clubId => clubId.toString()))
  }

  const memberships = (await MembershipModel.find({
    club: { $in: clubIds },
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return new Set(memberships.map(membership => membership.club.toString()))
}

async function findActiveClub(identifier: string) {
  const club = (await ClubModel.findOne({
    deletedAt: null,
    status: 'active',
    ...(isObjectId(identifier) ? { _id: toObjectId(identifier) } : { slug: identifier })
  }).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

async function findPoll(pollId: string) {
  if (!isObjectId(pollId)) {
    throw new ApplicationError('Poll not found.', 404, 'POLL_NOT_FOUND')
  }

  const poll = (await PollModel.findOne({
    _id: toObjectId(pollId),
    deletedAt: null
  }).lean()) as PollLean | null

  if (!poll) {
    throw new ApplicationError('Poll not found.', 404, 'POLL_NOT_FOUND')
  }

  if (poll.status === 'open' && poll.closesAt <= new Date()) {
    const closedPoll = (await PollModel.findByIdAndUpdate(
      poll._id,
      { $set: { status: 'closed' } },
      { new: true }
    ).lean()) as PollLean
    return closedPoll
  }

  return poll
}

async function assertActiveClubMember(actor: UserDto, clubId: Types.ObjectId) {
  const membership = await MembershipModel.exists({
    club: clubId,
    status: 'active',
    user: toObjectId(actor.id)
  })

  if (!membership) {
    throw new ApplicationError('Only active club members can vote in this poll.', 403, 'FORBIDDEN')
  }
}

async function createPollDtos(polls: PollLean[], actor: UserDto): Promise<PollDto[]> {
  if (polls.length === 0) {
    return []
  }

  const pollIds = polls.map(poll => poll._id)
  const clubIds = [...new Map(polls.map(poll => [poll.club.toString(), poll.club])).values()]
  const [clubs, votes, manageableClubIds, activeClubIds] = await Promise.all([
    ClubModel.find({ _id: { $in: clubIds }, deletedAt: null }).lean(),
    PollVoteModel.find({ poll: { $in: pollIds }, user: toObjectId(actor.id) }).lean(),
    getManageableClubIdSet(actor, clubIds),
    getActiveMembershipClubIds(actor)
  ])
  const clubsById = new Map((clubs as ClubLean[]).map(club => [club._id.toString(), club]))
  const votesByPollId = new Map((votes as PollVoteLean[]).map(vote => [vote.poll.toString(), vote]))
  const activeClubIdSet = activeClubIds
    ? new Set(activeClubIds.map(clubId => clubId.toString()))
    : null

  return polls
    .map(poll => {
      const club = clubsById.get(poll.club.toString())

      if (!club) {
        return null
      }

      return {
        canManage: manageableClubIds.has(poll.club.toString()),
        canVote:
          poll.status === 'open' &&
          poll.closesAt > new Date() &&
          (activeClubIdSet === null || activeClubIdSet.has(poll.club.toString())),
        closesAt: poll.closesAt.toISOString(),
        club: toClubDto(club),
        createdAt: poll.createdAt.toISOString(),
        currentUserVote: votesByPollId.get(poll._id.toString())
          ? toVoteDto(votesByPollId.get(poll._id.toString())!)
          : null,
        id: poll._id.toString(),
        options: poll.options,
        question: poll.question,
        status: poll.status,
        totalVotes: poll.totalVotes,
        type: poll.type,
        updatedAt: poll.updatedAt.toISOString(),
        visibility: poll.visibility
      }
    })
    .filter((poll): poll is PollDto => Boolean(poll))
}

async function buildPollFilter(query: PollListQuery, actor: UserDto): Promise<FilterQuery<Poll>> {
  const filter: FilterQuery<Poll> = {
    deletedAt: null
  }

  if (query.status !== 'all') {
    filter.status = query.status
  } else if (!isUniversityAdmin(actor)) {
    filter.status = { $ne: 'draft' }
  }

  if (query.search) {
    filter.question = new RegExp(escapeRegex(query.search), 'i')
  }

  if (query.scope === 'myClubs') {
    filter.club = { $in: (await getActiveMembershipClubIds(actor)) ?? [] }
  }

  if (query.scope === 'managed') {
    filter.club = { $in: await getManagedClubIds(actor) }
  }

  if (query.scope === 'voted') {
    const votes = (await PollVoteModel.find({
      user: toObjectId(actor.id)
    }).lean()) as PollVoteLean[]
    filter._id = { $in: votes.map(vote => vote.poll) }
  }

  return filter
}

export async function listPolls(query: PollListQuery, actor: UserDto): Promise<PollListResult> {
  await closeExpiredPolls()
  const filter = await buildPollFilter(query, actor)
  const skip = (query.page - 1) * query.perPage
  const [total, polls] = await Promise.all([
    PollModel.countDocuments(filter),
    PollModel.find(filter).sort({ status: -1, closesAt: 1 }).skip(skip).limit(query.perPage).lean()
  ])
  const pollRows = polls as PollLean[]

  if (pollRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as PollListResult
  }

  return getPagination(await createPollDtos(pollRows, actor), total, query.page, query.perPage)
}

export async function listManageablePollClubs(actor: UserDto) {
  const clubIds = await getManagedClubIds(actor)
  const clubs = (await ClubModel.find({ _id: { $in: clubIds }, deletedAt: null, status: 'active' })
    .sort({ name: 1 })
    .lean()) as ClubLean[]
  return clubs.map(toClubDto)
}

export async function createPoll(input: CreatePollInput, actor: UserDto) {
  const club = await findActiveClub(input.clubId)

  if (!(await canActorManageClub(actor, club._id))) {
    throw new ApplicationError('You cannot create polls for this club.', 403, 'FORBIDDEN')
  }

  const usedOptionIds = new Set<string>()
  const options: PollOption[] = input.options.map((label, index) => {
    let id = slugOption(label, index)

    while (usedOptionIds.has(id)) {
      id = `${id}-${index + 1}`
    }

    usedOptionIds.add(id)

    return {
      id,
      label,
      voteCount: 0
    }
  })
  const poll = await PollModel.create({
    closesAt: new Date(input.closesAt),
    club: club._id,
    createdBy: toObjectId(actor.id),
    deletedAt: null,
    options,
    question: input.question,
    status: input.status,
    totalVotes: 0,
    type: input.type,
    visibility: input.visibility
  })
  const [dto] = await createPollDtos([poll.toObject() as PollLean], actor)
  return dto
}

export async function updatePollStatus(
  pollId: string,
  input: UpdatePollStatusInput,
  actor: UserDto
) {
  const poll = await findPoll(pollId)

  if (!(await canActorManageClub(actor, poll.club))) {
    throw new ApplicationError('You cannot manage this poll.', 403, 'FORBIDDEN')
  }

  const updatedPoll = (await PollModel.findByIdAndUpdate(
    poll._id,
    { $set: { status: input.status } },
    { new: true }
  ).lean()) as PollLean
  const [dto] = await createPollDtos([updatedPoll], actor)
  return dto
}

export async function votePoll(pollId: string, input: VotePollInput, actor: UserDto) {
  const poll = await findPoll(pollId)
  await assertActiveClubMember(actor, poll.club)
  const selectedOptionIds = validateVoteSelection(
    poll,
    input.selectedOptionIds,
    new Date(),
    poll.closesAt
  )
  const existingVote = await PollVoteModel.exists({
    poll: poll._id,
    user: toObjectId(actor.id)
  })

  if (existingVote) {
    throw new ApplicationError('You have already voted in this poll.', 409, 'POLL_ALREADY_VOTED')
  }

  await PollVoteModel.create({
    poll: poll._id,
    selectedOptionIds,
    user: toObjectId(actor.id)
  })

  const updatedOptions = poll.options.map(option => ({
    ...option,
    voteCount: selectedOptionIds.includes(option.id) ? option.voteCount + 1 : option.voteCount
  }))
  const updatedPoll = (await PollModel.findByIdAndUpdate(
    poll._id,
    {
      $set: {
        options: updatedOptions
      },
      $inc: {
        totalVotes: 1
      }
    },
    { new: true }
  ).lean()) as PollLean
  const [dto] = await createPollDtos([updatedPoll], actor)
  return dto
}
