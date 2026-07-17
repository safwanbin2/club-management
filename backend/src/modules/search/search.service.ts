import { Types } from 'mongoose'

import { USER_ROLES } from '../../constants/roles.js'
import { ClubModel } from '../club/club.model.js'
import type { Club } from '../club/club.types.js'
import { EventModel } from '../event/event.model.js'
import type { Event } from '../event/event.types.js'
import { PostModel } from '../feed/post.model.js'
import type { Post } from '../feed/post.types.js'
import { MembershipModel } from '../membership/membership.model.js'
import { UserModel, type User } from '../user/user.model.js'
import type { UserDto } from '../user/user.types.js'
import type { SearchResult, SearchResultGroup, SearchResultType } from './search.dto.types.js'
import type { SearchQuery } from './search.validation.js'

type ClubLean = Club & { _id: Types.ObjectId }
type EventLean = Event & { _id: Types.ObjectId }
type PostLean = Post & { _id: Types.ObjectId }
type UserLean = User & { _id: Types.ObjectId }

const searchTypes: SearchResultType[] = ['clubs', 'events', 'posts', 'profiles']

export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, ' ')
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildPattern(query: string) {
  return new RegExp(escapeRegex(query), 'i')
}

function isUniversityAdmin(actor: UserDto) {
  return actor.role === USER_ROLES.universityAdmin
}

async function getActiveMembershipClubIds(actor: UserDto) {
  if (isUniversityAdmin(actor)) {
    return null
  }

  const memberships = await MembershipModel.find({
    status: 'active',
    user: new Types.ObjectId(actor.id)
  }).lean()

  return memberships.map(membership => membership.club)
}

function getVisibilityFilter(actor: UserDto, activeClubIds: null | Types.ObjectId[]) {
  if (isUniversityAdmin(actor)) {
    return {}
  }

  return {
    $or: [{ visibility: 'public' }, { club: { $in: activeClubIds ?? [] }, visibility: 'members' }]
  }
}

function summarize(value: string, maxLength = 140) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value
}

function group(
  type: SearchResultType,
  title: string,
  items: SearchResultGroup['items']
): SearchResultGroup {
  return {
    items,
    title,
    total: items.length,
    type
  }
}

async function searchClubs(pattern: RegExp, limit: number) {
  const clubs = (await ClubModel.find({
    deletedAt: null,
    status: 'active',
    $or: [{ category: pattern }, { description: pattern }, { name: pattern }]
  })
    .sort({ name: 1 })
    .limit(limit)
    .lean()) as ClubLean[]

  return group(
    'clubs',
    'Clubs',
    clubs.map(club => ({
      description: summarize(club.description),
      id: club._id.toString(),
      meta: club.category,
      path: `/clubs/${club.slug}`,
      title: club.name,
      type: 'clubs'
    }))
  )
}

async function searchEvents(
  pattern: RegExp,
  limit: number,
  actor: UserDto,
  activeClubIds: null | Types.ObjectId[]
) {
  const events = (await EventModel.find({
    deletedAt: null,
    status: { $in: ['completed', 'published'] },
    ...getVisibilityFilter(actor, activeClubIds),
    $or: [{ description: pattern }, { title: pattern }, { venue: pattern }]
  })
    .sort({ startsAt: 1 })
    .limit(limit)
    .lean()) as EventLean[]
  const clubs = (await ClubModel.find({
    _id: { $in: events.map(event => event.club) }
  }).lean()) as ClubLean[]
  const clubsById = new Map(clubs.map(club => [club._id.toString(), club]))

  return group(
    'events',
    'Events',
    events.map(event => ({
      description: summarize(event.description),
      id: event._id.toString(),
      meta: `${clubsById.get(event.club.toString())?.name ?? 'Club'} • ${event.startsAt.toDateString()}`,
      path: `/events?search=${encodeURIComponent(event.title)}`,
      title: event.title,
      type: 'events'
    }))
  )
}

async function searchPosts(
  pattern: RegExp,
  limit: number,
  actor: UserDto,
  activeClubIds: null | Types.ObjectId[]
) {
  const posts = (await PostModel.find({
    deletedAt: null,
    moderationStatus: 'visible',
    ...getVisibilityFilter(actor, activeClubIds),
    $or: [{ body: pattern }, { title: pattern }, { type: pattern }]
  })
    .sort({ pinned: -1, createdAt: -1 })
    .limit(limit)
    .lean()) as PostLean[]
  const clubs = (await ClubModel.find({
    _id: { $in: posts.flatMap(post => (post.club ? [post.club] : [])) }
  }).lean()) as ClubLean[]
  const clubsById = new Map(clubs.map(club => [club._id.toString(), club]))

  return group(
    'posts',
    'Feed Posts',
    posts.map(post => ({
      description: summarize(post.body),
      id: post._id.toString(),
      meta: `${post.type}${post.club ? ` • ${clubsById.get(post.club.toString())?.name ?? 'Club'}` : ''}`,
      path: `/feed?search=${encodeURIComponent(post.title ?? post.body.slice(0, 40))}`,
      title: post.title ?? summarize(post.body, 80),
      type: 'posts'
    }))
  )
}

async function searchProfiles(pattern: RegExp, limit: number, actor: UserDto) {
  const visibilityFilter = isUniversityAdmin(actor)
    ? {}
    : {
        $or: [
          { _id: new Types.ObjectId(actor.id) },
          { profileVisibility: { $in: ['public', 'university'] } }
        ]
      }
  const users = (await UserModel.find({
    deletedAt: null,
    status: 'active',
    ...visibilityFilter,
    $or: [{ department: pattern }, { name: pattern }, { studentId: pattern }]
  })
    .sort({ name: 1 })
    .limit(limit)
    .lean()) as UserLean[]

  return group(
    'profiles',
    'Profiles',
    users.map(user => ({
      description: [user.department, user.studentId].filter(Boolean).join(' • ') || user.role,
      id: user._id.toString(),
      meta: user.role,
      path: user._id.toString() === actor.id ? '/profile' : `/profiles/${user._id.toString()}`,
      title: user.name,
      type: 'profiles'
    }))
  )
}

export async function search(query: SearchQuery, actor: UserDto): Promise<SearchResult> {
  const normalizedQuery = normalizeSearchQuery(query.q)

  if (normalizedQuery.length < 2) {
    return {
      groups: [],
      query: normalizedQuery
    }
  }

  const pattern = buildPattern(normalizedQuery)
  const activeClubIds = await getActiveMembershipClubIds(actor)
  const requestedTypes =
    query.type === 'all' ? searchTypes : searchTypes.filter(searchType => searchType === query.type)
  const groups = await Promise.all(
    requestedTypes.map(searchType => {
      if (searchType === 'clubs') {
        return searchClubs(pattern, query.limit)
      }

      if (searchType === 'events') {
        return searchEvents(pattern, query.limit, actor, activeClubIds)
      }

      if (searchType === 'posts') {
        return searchPosts(pattern, query.limit, actor, activeClubIds)
      }

      return searchProfiles(pattern, query.limit, actor)
    })
  )

  return {
    groups,
    query: normalizedQuery
  }
}
