import { Avatar, Button, Dropdown, Tag, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import {
  BarChart3,
  CalendarDays,
  EyeOff,
  FileText,
  Globe2,
  Heart,
  Lock,
  Megaphone,
  MessageSquare,
  MoreHorizontal,
  Pin,
  PinOff,
  Sparkles,
  Trophy
} from 'lucide-react'

import { FEED_POST_TYPE_TONES } from '../shared/constants'
import {
  formatCount,
  formatFeedPostType,
  formatRelativeTime,
  getEntityInitials
} from '../shared/helpers'
import type { FeedPost, ModerateFeedPostPayload } from '../shared/types'
import UserProfileLink from '@features/user-profile-link'

type FeedPostCardProps = {
  isLikePending: boolean
  isModerationPending: boolean
  onComments: (post: FeedPost) => void
  onLike: (post: FeedPost) => void
  onModerate: (payload: ModerateFeedPostPayload) => void
  post: FeedPost
}

function getPostIcon(type: FeedPost['type']) {
  if (type === 'announcement') {
    return Megaphone
  }

  if (type === 'event') {
    return CalendarDays
  }

  if (type === 'poll') {
    return BarChart3
  }

  if (type === 'achievement') {
    return Trophy
  }

  return FileText
}

export default function FeedPostCard({
  isLikePending,
  isModerationPending,
  onComments,
  onLike,
  onModerate,
  post
}: FeedPostCardProps) {
  const TypeIcon = getPostIcon(post.type)
  const menuItems: MenuProps['items'] = post.canManage
    ? [
        {
          icon: post.pinned ? <PinOff size={15} /> : <Pin size={15} />,
          key: 'pin',
          label: post.pinned ? 'Unpin post' : 'Pin post'
        },
        {
          icon: <Sparkles size={15} />,
          key: 'highlight',
          label: post.highlighted ? 'Remove highlight' : 'Highlight post'
        },
        {
          type: 'divider'
        },
        {
          danger: true,
          icon: <EyeOff size={15} />,
          key: 'hide',
          label: 'Hide post'
        }
      ]
    : []

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'pin') {
      onModerate({
        pinned: !post.pinned,
        postId: post.id
      })
    }

    if (key === 'highlight') {
      onModerate({
        highlighted: !post.highlighted,
        postId: post.id
      })
    }

    if (key === 'hide') {
      onModerate({
        moderationStatus: 'hidden',
        postId: post.id
      })
    }
  }

  return (
    <article
      className={[
        'rounded-app border bg-surface p-5 shadow-panel',
        post.highlighted || post.type === 'announcement' ? 'border-primary/30' : 'border-border'
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <Avatar
          className="shrink-0 bg-primary text-white"
          size={48}
          src={post.club?.logoUrl ?? post.author.avatarUrl ?? undefined}
        >
          {getEntityInitials(post.club?.name ?? post.author.name)}
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 truncate text-lg font-bold text-text">
              {post.club ? (
                post.club.name
              ) : (
                <UserProfileLink
                  className="text-text hover:text-primary"
                  name={post.author.name}
                  userId={post.author.id}
                />
              )}
            </h2>
            <Tag className={`m-0 border ${FEED_POST_TYPE_TONES[post.type]}`}>
              <span className="inline-flex items-center gap-1">
                <TypeIcon aria-hidden="true" size={13} />
                {formatFeedPostType(post.type)}
              </span>
            </Tag>
            {post.pinned ? (
              <Tag className="m-0 border-primary/20 bg-primary-soft text-primary">Pinned</Tag>
            ) : null}
          </div>
          <p className="m-0 mt-1 flex flex-wrap items-center gap-1 text-sm text-text-soft">
            <UserProfileLink
              className="text-text-soft hover:text-primary"
              name={post.author.name}
              userId={post.author.id}
            />
            <span>• {formatRelativeTime(post.createdAt)}</span>
          </p>
        </div>

        {post.canManage ? (
          <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
            <Button
              aria-label="Post actions"
              icon={<MoreHorizontal size={17} />}
              loading={isModerationPending}
              type="text"
            />
          </Dropdown>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {post.title ? <h3 className="m-0 text-xl font-bold text-text">{post.title}</h3> : null}
        <p className="m-0 whitespace-pre-line text-base leading-7 text-text">{post.body}</p>

        {post.images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {post.images.map(image => (
              <img
                alt=""
                className="aspect-video w-full rounded-app border border-border object-cover"
                key={image}
                src={image}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={post.likedByCurrentUser ? 'Unlike post' : 'Like post'}>
            <Button
              aria-label={post.likedByCurrentUser ? 'Unlike post' : 'Like post'}
              icon={<Heart fill={post.likedByCurrentUser ? 'currentColor' : 'none'} size={17} />}
              loading={isLikePending}
              onClick={() => onLike(post)}
              type={post.likedByCurrentUser ? 'primary' : 'default'}
            >
              {formatCount(post.likeCount)}
            </Button>
          </Tooltip>

          <Button icon={<MessageSquare size={17} />} onClick={() => onComments(post)}>
            {formatCount(post.commentCount)}
          </Button>
        </div>

        <span className="inline-flex items-center gap-1 text-sm font-semibold text-text-soft">
          {post.visibility === 'members' ? (
            <Lock aria-hidden="true" size={15} />
          ) : (
            <Globe2 aria-hidden="true" size={15} />
          )}
          {post.visibility === 'members' ? 'Members only' : 'Public'}
        </span>
      </div>
    </article>
  )
}
