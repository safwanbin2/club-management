import type { FilterQuery, Types } from 'mongoose'
import mongoose from 'mongoose'

import { CAPABILITIES, roleHasCapability } from '../../constants/capabilities.js'
import { USER_ROLES } from '../../constants/roles.js'
import type { PaginatedResult } from '../../types/pagination.js'
import { ApplicationError } from '../../utils/application-error.js'
import { ClubModel } from '../club/club.model.js'
import { canActorManageClub } from '../club/club.service.js'
import type { Club } from '../club/club.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import type { Membership } from '../membership/membership.types.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import { CommentModel } from './comment.model.js'
import type { Comment } from './comment.types.js'
import { PostLikeModel } from './post-like.model.js'
import { PostModel } from './post.model.js'
import type { ModerationStatus, Post } from './post.types.js'
import type {
  CreateFeedCommentInput,
  CreateFeedPostInput,
  FeedCommentsQuery,
  FeedListQuery,
  ModerateFeedCommentInput,
  ModerateFeedPostInput
} from './feed.validation.js'
import type {
  FeedAuthorDto,
  FeedClubDto,
  FeedCommentDto,
  FeedCommentListResult,
  FeedManageableClubDto,
  FeedPostDto,
  FeedPostListResult,
  FeedTrendingClubDto,
  PostModerationUpdate
} from './feed.types.js'

type ClubLean = Club & {
  _id: Types.ObjectId
}

type CommentLean = Comment & {
  _id: Types.ObjectId
}

type MembershipLean = Membership & {
  _id: Types.ObjectId
}

type PostLean = Post & {
  _id: Types.ObjectId
}

type UserLean = User & {
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

function formatDate(value: Date) {
  return value.toISOString()
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

function toAuthorDto(user: UserLean | undefined, fallbackId: Types.ObjectId): FeedAuthorDto {
  if (!user) {
    return {
      avatarUrl: null,
      id: fallbackId.toString(),
      name: 'Unknown user',
      role: 'unknown'
    }
  }

  return {
    avatarUrl: user.avatarUrl ?? null,
    id: user._id.toString(),
    name: user.name,
    role: user.role
  }
}

function toClubDto(club: ClubLean): FeedClubDto {
  return {
    category: club.category,
    id: club._id.toString(),
    logoUrl: club.logoUrl ?? null,
    name: club.name,
    slug: club.slug
  }
}

function mapCounts(rows: { _id: Types.ObjectId; count: number }[]) {
  return new Map(rows.map(row => [row._id.toString(), row.count]))
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

async function getManageableClubIdSet(actor: UserDto, clubIds: Types.ObjectId[]) {
  if (clubIds.length === 0) {
    return new Set<string>()
  }

  if (isUniversityAdmin(actor)) {
    return new Set(clubIds.map(clubId => clubId.toString()))
  }

  if (!roleHasCapability(actor.role, CAPABILITIES.feedCreateClub)) {
    return new Set<string>()
  }

  const memberships = (await MembershipModel.find({
    club: { $in: clubIds },
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  return new Set(memberships.map(membership => membership.club.toString()))
}

async function assertActorCanManageClub(actor: UserDto, clubId: Types.ObjectId) {
  if (await canActorManageClub(actor, clubId)) {
    return
  }

  throw new ApplicationError('You cannot manage feed posts for this club.', 403, 'FORBIDDEN')
}

async function findActiveClub(identifier: string) {
  const filter: FilterQuery<Club> = {
    deletedAt: null,
    status: 'active',
    ...(isObjectId(identifier) ? { _id: toObjectId(identifier) } : { slug: identifier })
  }

  const club = (await ClubModel.findOne(filter).lean()) as ClubLean | null

  if (!club) {
    throw new ApplicationError('Club not found.', 404, 'CLUB_NOT_FOUND')
  }

  return club
}

async function buildFeedVisibilityClause(actor: UserDto): Promise<FilterQuery<Post> | null> {
  if (isUniversityAdmin(actor)) {
    return null
  }

  const activeClubIds = await getActiveMembershipClubIds(actor)

  return {
    $or: [
      { visibility: 'public' },
      {
        club: { $in: activeClubIds ?? [] },
        visibility: 'members'
      }
    ]
  }
}

async function buildFeedFilter(query: FeedListQuery, actor: UserDto): Promise<FilterQuery<Post>> {
  const filter: FilterQuery<Post> = {
    deletedAt: null,
    moderationStatus: 'visible'
  }
  const clauses: FilterQuery<Post>[] = []

  if (query.type) {
    filter.type = query.type
  }

  if (query.clubId) {
    const club = await findActiveClub(query.clubId)
    filter.club = club._id
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), 'i')
    clauses.push({
      $or: [{ title: regex }, { body: regex }]
    })
  }

  const visibilityClause = await buildFeedVisibilityClause(actor)

  if (visibilityClause) {
    clauses.push(visibilityClause)
  }

  if (clauses.length > 0) {
    filter.$and = clauses
  }

  return filter
}

async function actorCanAccessPost(post: PostLean, actor: UserDto) {
  if (post.visibility === 'public' || isUniversityAdmin(actor)) {
    return true
  }

  if (!post.club) {
    return false
  }

  const membership = await MembershipModel.exists({
    club: post.club,
    status: 'active',
    user: toObjectId(actor.id)
  })

  return Boolean(membership)
}

async function findAccessiblePost(postId: string, actor: UserDto) {
  if (!isObjectId(postId)) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  const post = (await PostModel.findOne({
    _id: toObjectId(postId),
    deletedAt: null,
    moderationStatus: 'visible'
  }).lean()) as PostLean | null

  if (!post || !(await actorCanAccessPost(post, actor))) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  return post
}

async function findManageablePost(postId: string, actor: UserDto) {
  if (!isObjectId(postId)) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  const post = (await PostModel.findOne({
    _id: toObjectId(postId),
    deletedAt: null
  }).lean()) as PostLean | null

  if (!post?.club) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  await assertActorCanManageClub(actor, post.club)
  return post
}

async function createPostDtos(posts: PostLean[], actor: UserDto): Promise<FeedPostDto[]> {
  if (posts.length === 0) {
    return []
  }

  const postIds = posts.map(post => post._id)
  const clubIds = posts
    .map(post => post.club)
    .filter((clubId): clubId is Types.ObjectId => Boolean(clubId))
  const uniqueClubIds = [...new Map(clubIds.map(clubId => [clubId.toString(), clubId])).values()]
  const userIds = [...new Map(posts.map(post => [post.author.toString(), post.author])).values()]

  const [users, clubs, likes, manageableClubIds] = await Promise.all([
    UserModel.find({ _id: { $in: userIds }, deletedAt: null }).lean(),
    ClubModel.find({ _id: { $in: uniqueClubIds }, deletedAt: null }).lean(),
    PostLikeModel.find({ post: { $in: postIds }, user: toObjectId(actor.id) }).lean(),
    getManageableClubIdSet(actor, uniqueClubIds)
  ])

  const usersById = new Map((users as UserLean[]).map(user => [user._id.toString(), user]))
  const clubsById = new Map((clubs as ClubLean[]).map(club => [club._id.toString(), club]))
  const likedPostIds = new Set(likes.map(like => like.post.toString()))
  const canComment = roleHasCapability(actor.role, CAPABILITIES.commentsCreate)

  return posts.map(post => {
    const club = post.club ? clubsById.get(post.club.toString()) : undefined

    return {
      author: toAuthorDto(usersById.get(post.author.toString()), post.author),
      body: post.body,
      canComment,
      canManage: post.club ? manageableClubIds.has(post.club.toString()) : false,
      club: club ? toClubDto(club) : null,
      commentCount: post.commentCount,
      createdAt: formatDate(post.createdAt),
      highlighted: post.highlighted,
      id: post._id.toString(),
      images: post.images,
      likeCount: post.likeCount,
      likedByCurrentUser: likedPostIds.has(post._id.toString()),
      moderationStatus: post.moderationStatus,
      pinned: post.pinned,
      relatedEventId: post.relatedEvent ? post.relatedEvent.toString() : null,
      relatedPollId: post.relatedPoll ? post.relatedPoll.toString() : null,
      title: post.title ?? null,
      type: post.type,
      updatedAt: formatDate(post.updatedAt),
      visibility: post.visibility
    }
  })
}

async function createCommentDtos(
  comments: CommentLean[],
  actor: UserDto,
  canModerate: boolean
): Promise<FeedCommentDto[]> {
  if (comments.length === 0) {
    return []
  }

  const userIds = [
    ...new Map(comments.map(comment => [comment.author.toString(), comment.author])).values()
  ]
  const users = (await UserModel.find({
    _id: { $in: userIds },
    deletedAt: null
  }).lean()) as UserLean[]
  const usersById = new Map(users.map(user => [user._id.toString(), user]))

  return comments.map(comment => ({
    author: toAuthorDto(usersById.get(comment.author.toString()), comment.author),
    body: comment.body,
    canModerate,
    createdAt: formatDate(comment.createdAt),
    id: comment._id.toString(),
    moderationStatus: comment.moderationStatus,
    updatedAt: formatDate(comment.updatedAt)
  }))
}

export function getVisibleCommentCountDelta(
  previousStatus: ModerationStatus,
  nextStatus: ModerationStatus
) {
  const wasVisible = previousStatus === 'visible'
  const willBeVisible = nextStatus === 'visible'

  if (wasVisible === willBeVisible) {
    return 0
  }

  return willBeVisible ? 1 : -1
}

export function buildPostModerationUpdate(
  input: ModerateFeedPostInput,
  changedAt = new Date()
): PostModerationUpdate {
  const update: PostModerationUpdate = {}

  if (input.highlighted !== undefined) {
    update.highlighted = input.highlighted
  }

  if (input.pinned !== undefined) {
    update.pinned = input.pinned
  }

  if (input.moderationStatus !== undefined) {
    update.moderationStatus = input.moderationStatus

    if (input.moderationStatus === 'deleted') {
      update.deletedAt = changedAt
      update.pinned = false
    } else if (input.moderationStatus === 'visible') {
      update.deletedAt = null
    }
  }

  return update
}

export async function listFeedPosts(
  query: FeedListQuery,
  actor: UserDto
): Promise<FeedPostListResult> {
  const filter = await buildFeedFilter(query, actor)
  const sort: Record<string, 1 | -1> =
    query.sort === 'popular'
      ? { commentCount: -1, createdAt: -1, likeCount: -1, pinned: -1 }
      : { createdAt: -1, pinned: -1 }
  const skip = (query.page - 1) * query.perPage
  const [total, posts] = await Promise.all([
    PostModel.countDocuments(filter),
    PostModel.find(filter).sort(sort).skip(skip).limit(query.perPage).lean()
  ])
  const postRows = posts as PostLean[]

  if (postRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as FeedPostListResult
  }

  return getPagination(await createPostDtos(postRows, actor), total, query.page, query.perPage)
}

export async function listTrendingClubs(actor: UserDto): Promise<FeedTrendingClubDto[]> {
  const filter = await buildFeedFilter(
    {
      page: 1,
      perPage: 20,
      search: '',
      sort: 'popular'
    },
    actor
  )
  const rows = (await PostModel.aggregate([
    {
      $match: {
        ...filter,
        club: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$club',
        latestPostAt: { $max: '$createdAt' },
        postCount: { $sum: 1 }
      }
    },
    {
      $sort: {
        postCount: -1,
        latestPostAt: -1
      }
    },
    {
      $limit: 6
    }
  ])) as { _id: Types.ObjectId; postCount: number }[]

  if (rows.length === 0) {
    return []
  }

  const clubIds = rows.map(row => row._id)
  const [clubs, memberCounts] = await Promise.all([
    ClubModel.find({ _id: { $in: clubIds }, deletedAt: null, status: 'active' }).lean(),
    MembershipModel.aggregate([
      {
        $match: {
          club: { $in: clubIds },
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$club',
          count: { $sum: 1 }
        }
      }
    ])
  ])
  const clubsById = new Map((clubs as ClubLean[]).map(club => [club._id.toString(), club]))
  const countsByClubId = mapCounts(memberCounts as { _id: Types.ObjectId; count: number }[])

  return rows
    .map(row => {
      const club = clubsById.get(row._id.toString())

      if (!club) {
        return null
      }

      return {
        ...toClubDto(club),
        memberCount: countsByClubId.get(row._id.toString()) ?? 0,
        postCount: row.postCount
      }
    })
    .filter((club): club is FeedTrendingClubDto => Boolean(club))
}

export async function listManageableClubs(actor: UserDto): Promise<FeedManageableClubDto[]> {
  if (isUniversityAdmin(actor)) {
    const clubs = (await ClubModel.find({
      deletedAt: null,
      status: 'active'
    })
      .sort({ name: 1 })
      .lean()) as ClubLean[]

    return clubs.map(toClubDto)
  }

  const memberships = (await MembershipModel.find({
    clubRole: { $in: ['advisor', 'executive'] },
    status: 'active',
    user: toObjectId(actor.id)
  }).lean()) as MembershipLean[]

  if (memberships.length === 0) {
    return []
  }

  const clubs = (await ClubModel.find({
    _id: { $in: memberships.map(membership => membership.club) },
    deletedAt: null,
    status: 'active'
  })
    .sort({ name: 1 })
    .lean()) as ClubLean[]

  return clubs.map(toClubDto)
}

export async function createFeedPost(input: CreateFeedPostInput, actor: UserDto) {
  const club = await findActiveClub(input.clubId)
  await assertActorCanManageClub(actor, club._id)

  const post = await PostModel.create({
    author: toObjectId(actor.id),
    body: input.body,
    club: club._id,
    commentCount: 0,
    highlighted: input.highlighted ?? input.type === 'announcement',
    images: input.images,
    likeCount: 0,
    moderationStatus: 'visible',
    pinned: input.pinned,
    relatedEvent: null,
    relatedPoll: null,
    title: input.title ?? null,
    type: input.type,
    visibility: input.visibility
  })

  const [dto] = await createPostDtos([post.toObject() as PostLean], actor)
  return dto
}

export async function togglePostLike(postId: string, actor: UserDto) {
  const post = await findAccessiblePost(postId, actor)
  const likeFilter = {
    post: post._id,
    user: toObjectId(actor.id)
  }
  const existingLike = await PostLikeModel.findOne(likeFilter).lean()

  if (existingLike) {
    await PostLikeModel.deleteOne(likeFilter)
    await PostModel.updateOne({ _id: post._id }, { $inc: { likeCount: -1 } })
    await PostModel.updateOne({ _id: post._id, likeCount: { $lt: 0 } }, { $set: { likeCount: 0 } })
  } else {
    try {
      await PostLikeModel.create(likeFilter)
      await PostModel.updateOne({ _id: post._id }, { $inc: { likeCount: 1 } })
    } catch (error) {
      if (!(error instanceof mongoose.mongo.MongoServerError) || error.code !== 11000) {
        throw error
      }
    }
  }

  const updatedPost = (await PostModel.findById(post._id).lean()) as PostLean | null

  if (!updatedPost) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  const [dto] = await createPostDtos([updatedPost], actor)
  return dto
}

export async function listPostComments(
  postId: string,
  query: FeedCommentsQuery,
  actor: UserDto
): Promise<FeedCommentListResult> {
  const post = await findAccessiblePost(postId, actor)
  const canModerate = post.club ? await canActorManageClub(actor, post.club) : false
  const filter: FilterQuery<Comment> = {
    deletedAt: null,
    post: post._id,
    ...(canModerate ? {} : { moderationStatus: 'visible' })
  }
  const skip = (query.page - 1) * query.perPage
  const [total, comments] = await Promise.all([
    CommentModel.countDocuments(filter),
    CommentModel.find(filter).sort({ createdAt: 1, _id: 1 }).skip(skip).limit(query.perPage).lean()
  ])
  const commentRows = comments as CommentLean[]

  if (commentRows.length === 0) {
    return {
      ...defaultPagination,
      currentPage: query.page,
      perPage: query.perPage,
      total
    } as FeedCommentListResult
  }

  return getPagination(
    await createCommentDtos(commentRows, actor, canModerate),
    total,
    query.page,
    query.perPage
  )
}

export async function createPostComment(
  postId: string,
  input: CreateFeedCommentInput,
  actor: UserDto
) {
  const post = await findAccessiblePost(postId, actor)
  const comment = await CommentModel.create({
    author: toObjectId(actor.id),
    body: input.body,
    deletedAt: null,
    moderationStatus: 'visible',
    post: post._id
  })

  await PostModel.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } })

  const canModerate = post.club ? await canActorManageClub(actor, post.club) : false
  const [dto] = await createCommentDtos([comment.toObject() as CommentLean], actor, canModerate)
  return dto
}

export async function moderatePost(postId: string, input: ModerateFeedPostInput, actor: UserDto) {
  const post = await findManageablePost(postId, actor)
  const update = buildPostModerationUpdate(input)
  const updatedPost = (await PostModel.findByIdAndUpdate(
    post._id,
    {
      $set: update
    },
    { new: true }
  ).lean()) as PostLean | null

  if (!updatedPost) {
    throw new ApplicationError('Post not found.', 404, 'POST_NOT_FOUND')
  }

  const [dto] = await createPostDtos([updatedPost], actor)
  return dto
}

export async function moderateComment(
  postId: string,
  commentId: string,
  input: ModerateFeedCommentInput,
  actor: UserDto
) {
  const post = await findManageablePost(postId, actor)

  if (!isObjectId(commentId)) {
    throw new ApplicationError('Comment not found.', 404, 'COMMENT_NOT_FOUND')
  }

  const comment = (await CommentModel.findOne({
    _id: toObjectId(commentId),
    post: post._id
  }).lean()) as CommentLean | null

  if (!comment) {
    throw new ApplicationError('Comment not found.', 404, 'COMMENT_NOT_FOUND')
  }

  const countDelta = getVisibleCommentCountDelta(comment.moderationStatus, input.moderationStatus)
  const updatedComment = (await CommentModel.findByIdAndUpdate(
    comment._id,
    {
      $set: {
        deletedAt: input.moderationStatus === 'deleted' ? new Date() : null,
        moderationStatus: input.moderationStatus
      }
    },
    { new: true }
  ).lean()) as CommentLean | null

  if (!updatedComment) {
    throw new ApplicationError('Comment not found.', 404, 'COMMENT_NOT_FOUND')
  }

  if (countDelta !== 0) {
    await PostModel.updateOne({ _id: post._id }, { $inc: { commentCount: countDelta } })
    await PostModel.updateOne(
      { _id: post._id, commentCount: { $lt: 0 } },
      { $set: { commentCount: 0 } }
    )
  }

  const [dto] = await createCommentDtos([updatedComment], actor, true)
  return dto
}
