import { Types } from 'mongoose'

import { CAPABILITIES, roleHasCapability } from '../../constants/capabilities.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import type { Club } from '../club/club.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { ChatMessageModel } from './chat-message.model.js'
import type { ChatAttachment, ChatMessage } from './chat-message.types.js'
import type {
  ChatMessageListQuery,
  CreateChatMessageInput,
  MarkChatReadInput,
  ModerateChatMessageInput
} from './chat.validation.js'
import type { ChatClubDto, ChatMessageDto, ChatMessageListResult } from './chat.dto.types.js'

type ChatMessageLean = ChatMessage & { _id: Types.ObjectId }
type ClubLean = Club & { _id: Types.ObjectId }
type UserLean = User & { _id: Types.ObjectId }

const defaultPagination = {
  currentPage: 1,
  currentTotal: 0,
  data: [],
  lastPage: 1,
  perPage: 30,
  total: 0
} satisfies PaginatedResult<unknown>

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

function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApplicationError('Invalid identifier.', 400, 'INVALID_ID')
  }

  return new Types.ObjectId(id)
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

export function assertChatMessageContent(body: string, attachments: ChatAttachment[]) {
  if (!body.trim() && attachments.length === 0) {
    throw new ApplicationError('Message content is required.', 422, 'VALIDATION')
  }
}

async function findActiveClub(identifier: string) {
  const club = (await ClubModel.findOne({
    deletedAt: null,
    status: 'active',
    ...(Types.ObjectId.isValid(identifier)
      ? { _id: new Types.ObjectId(identifier) }
      : { slug: identifier })
  }).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club was not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

async function canAccessClubChat(actor: UserDto, clubId: Types.ObjectId) {
  if (isUniversityAdmin(actor)) {
    return true
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.chatAccessClub)) {
    return false
  }

  return Boolean(
    await MembershipModel.exists({
      club: clubId,
      status: 'active',
      user: toObjectId(actor.id)
    })
  )
}

async function canModerateClubChat(actor: UserDto, clubId: Types.ObjectId) {
  if (isUniversityAdmin(actor)) {
    return true
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.chatModerateClub)) {
    return false
  }

  return Boolean(
    await MembershipModel.exists({
      club: clubId,
      clubRole: { $in: ['advisor', 'executive'] },
      status: 'active',
      user: toObjectId(actor.id)
    })
  )
}

async function assertCanAccessClubChat(actor: UserDto, clubId: Types.ObjectId) {
  if (!(await canAccessClubChat(actor, clubId))) {
    throw new ApplicationError('You do not have access to this club chat.', 403, 'FORBIDDEN')
  }
}

function toUserDto(user: UserLean | undefined, fallbackId: Types.ObjectId) {
  return {
    avatarUrl: user?.avatarUrl ?? null,
    id: user?._id.toString() ?? fallbackId.toString(),
    name: user?.name ?? 'Unknown user',
    role: user?.role ?? USER_ROLES.student
  }
}

async function createChatMessageDtos(rows: ChatMessageLean[], actor: UserDto) {
  const userIds = [...new Set(rows.map(row => row.author.toString()))].map(
    id => new Types.ObjectId(id)
  )
  const clubIds = [...new Set(rows.map(row => row.club.toString()))].map(
    id => new Types.ObjectId(id)
  )
  const [users, manageableClubIds] = await Promise.all([
    UserModel.find({ _id: { $in: userIds } }).lean() as Promise<UserLean[]>,
    Promise.all(
      clubIds.map(async clubId => [await canModerateClubChat(actor, clubId), clubId] as const)
    )
  ])
  const usersById = new Map(users.map(user => [user._id.toString(), user]))
  const manageableClubSet = new Set(
    manageableClubIds.filter(([canModerate]) => canModerate).map(([, clubId]) => clubId.toString())
  )

  return rows.map<ChatMessageDto>(row => {
    const deletedAt = row.deletedAt?.toISOString() ?? null
    const canModerate = manageableClubSet.has(row.club.toString())

    return {
      attachments: deletedAt ? [] : row.attachments,
      author: toUserDto(usersById.get(row.author.toString()), row.author),
      body: deletedAt ? '' : row.body,
      canModerate,
      clubId: row.club.toString(),
      createdAt: row.createdAt.toISOString(),
      deletedAt,
      id: row._id.toString(),
      isOwn: row.author.toString() === actor.id,
      parentMessageId: row.parentMessage?.toString() ?? null,
      pinned: row.pinned,
      seenCount: row.seenBy.length,
      updatedAt: row.updatedAt.toISOString()
    }
  })
}

async function getAccessibleClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    const clubs = (await ClubModel.find({ deletedAt: null, status: 'active' }).lean()) as ClubLean[]
    return clubs.map(club => club._id)
  }

  const memberships = await MembershipModel.find({
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()

  return memberships.map(membership => membership.club)
}

export async function listChatClubs(actor: UserDto): Promise<ChatClubDto[]> {
  const clubIds = await getAccessibleClubIds(actor)

  if (clubIds.length === 0) {
    return []
  }

  const [clubs, lastMessages, unreadCounts] = await Promise.all([
    ClubModel.find({ _id: { $in: clubIds }, deletedAt: null, status: 'active' })
      .sort({ name: 1 })
      .lean() as Promise<ClubLean[]>,
    ChatMessageModel.aggregate<{ _id: Types.ObjectId; lastMessageAt: Date }>([
      { $match: { club: { $in: clubIds }, deletedAt: null } },
      { $group: { _id: '$club', lastMessageAt: { $max: '$createdAt' } } }
    ]),
    ChatMessageModel.aggregate<{ _id: Types.ObjectId; unreadCount: number }>([
      {
        $match: {
          author: { $ne: toObjectId(actor.id) },
          club: { $in: clubIds },
          deletedAt: null,
          'seenBy.user': { $ne: toObjectId(actor.id) }
        }
      },
      { $group: { _id: '$club', unreadCount: { $sum: 1 } } }
    ])
  ])
  const lastMessageByClub = new Map(
    lastMessages.map(row => [row._id.toString(), row.lastMessageAt.toISOString()])
  )
  const unreadByClub = new Map(unreadCounts.map(row => [row._id.toString(), row.unreadCount]))

  return clubs.map(club => ({
    category: club.category,
    id: club._id.toString(),
    lastMessageAt: lastMessageByClub.get(club._id.toString()) ?? null,
    name: club.name,
    slug: club.slug,
    unreadCount: unreadByClub.get(club._id.toString()) ?? 0
  }))
}

export async function listChatMessages(
  clubId: string,
  query: ChatMessageListQuery,
  actor: UserDto
): Promise<ChatMessageListResult> {
  const club = await findActiveClub(clubId)
  await assertCanAccessClubChat(actor, club._id)

  const skip = (query.page - 1) * query.perPage
  const [total, rows] = await Promise.all([
    ChatMessageModel.countDocuments({ club: club._id }),
    ChatMessageModel.find({ club: club._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.perPage)
      .lean()
  ])

  if (rows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as ChatMessageListResult
  }

  const messages = await createChatMessageDtos((rows as ChatMessageLean[]).reverse(), actor)
  return getPagination(messages, total, query.page, query.perPage)
}

export async function createChatMessage(
  clubId: string,
  input: CreateChatMessageInput,
  actor: UserDto
) {
  const club = await findActiveClub(clubId)
  await assertCanAccessClubChat(actor, club._id)
  assertChatMessageContent(input.body, input.attachments)

  const message = (await ChatMessageModel.create({
    attachments: input.attachments,
    author: toObjectId(actor.id),
    body: input.body.trim(),
    club: club._id,
    deletedAt: null,
    parentMessage: input.parentMessageId ? toObjectId(input.parentMessageId) : null,
    pinned: false,
    seenBy: [{ seenAt: new Date(), user: toObjectId(actor.id) }]
  })) as ChatMessageLean

  const [dto] = await createChatMessageDtos([message], actor)
  return dto
}

export async function moderateChatMessage(
  messageId: string,
  input: ModerateChatMessageInput,
  actor: UserDto
) {
  const message = (await ChatMessageModel.findById(
    toObjectId(messageId)
  ).lean()) as ChatMessageLean | null

  if (!message) {
    throw new ApplicationError('Chat message was not found.', 404, 'MESSAGE_NOT_FOUND')
  }

  if (!(await canModerateClubChat(actor, message.club))) {
    throw new ApplicationError('You cannot moderate this club chat.', 403, 'FORBIDDEN')
  }

  const updates =
    input.action === 'delete'
      ? { deletedAt: new Date(), pinned: false }
      : { pinned: input.action === 'pin' }

  const updated = (await ChatMessageModel.findByIdAndUpdate(
    message._id,
    { $set: updates },
    { new: true }
  ).lean()) as ChatMessageLean | null

  if (!updated) {
    throw new ApplicationError('Chat message was not found.', 404, 'MESSAGE_NOT_FOUND')
  }

  const [dto] = await createChatMessageDtos([updated], actor)
  return dto
}

export async function markChatRead(clubId: string, input: MarkChatReadInput, actor: UserDto) {
  const club = await findActiveClub(clubId)
  await assertCanAccessClubChat(actor, club._id)

  const result = await ChatMessageModel.updateMany(
    {
      _id: { $in: input.messageIds.map(toObjectId) },
      club: club._id,
      'seenBy.user': { $ne: toObjectId(actor.id) }
    },
    {
      $push: {
        seenBy: {
          seenAt: new Date(),
          user: toObjectId(actor.id)
        }
      }
    }
  )

  return {
    markedRead: result.modifiedCount
  }
}
