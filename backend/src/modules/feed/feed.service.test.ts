import { describe, expect, it } from 'vitest'

import {
  buildFeedPostCreationPlan,
  buildPostModerationUpdate,
  getVisibleCommentCountDelta
} from './feed.service.js'

describe('feed.service moderation helpers', () => {
  it('calculates comment count deltas when visibility changes', () => {
    expect(getVisibleCommentCountDelta('visible', 'hidden')).toBe(-1)
    expect(getVisibleCommentCountDelta('hidden', 'visible')).toBe(1)
    expect(getVisibleCommentCountDelta('flagged', 'hidden')).toBe(0)
    expect(getVisibleCommentCountDelta('visible', 'visible')).toBe(0)
  })

  it('builds a delete moderation update that clears pinning', () => {
    const changedAt = new Date('2026-07-17T10:00:00.000Z')
    const update = buildPostModerationUpdate(
      {
        moderationStatus: 'deleted',
        pinned: true
      },
      changedAt
    )

    expect(update).toEqual({
      deletedAt: changedAt,
      moderationStatus: 'deleted',
      pinned: false
    })
  })

  it('keeps non-delete moderation updates narrowly scoped', () => {
    expect(
      buildPostModerationUpdate({
        highlighted: true,
        moderationStatus: 'visible'
      })
    ).toMatchObject({
      deletedAt: null,
      highlighted: true,
      moderationStatus: 'visible'
    })
  })
})

describe('feed.service post creation rules', () => {
  it('allows authenticated users to publish regular public posts without a club', () => {
    expect(
      buildFeedPostCreationPlan({
        actorCanManageClub: false,
        actorIsActiveClubMember: false,
        clubId: null,
        highlighted: undefined,
        pinned: false,
        type: 'post',
        visibility: 'public'
      })
    ).toEqual({
      clubId: null,
      highlighted: false,
      pinned: false,
      type: 'post',
      visibility: 'public'
    })
  })

  it('allows active club members to publish regular posts in their club', () => {
    expect(
      buildFeedPostCreationPlan({
        actorCanManageClub: false,
        actorIsActiveClubMember: true,
        clubId: 'club-1',
        highlighted: true,
        pinned: true,
        type: 'post',
        visibility: 'members'
      })
    ).toEqual({
      clubId: 'club-1',
      highlighted: false,
      pinned: false,
      type: 'post',
      visibility: 'members'
    })
  })

  it('keeps announcements scoped to club managers', () => {
    expect(() =>
      buildFeedPostCreationPlan({
        actorCanManageClub: false,
        actorIsActiveClubMember: true,
        clubId: 'club-1',
        highlighted: undefined,
        pinned: false,
        type: 'announcement',
        visibility: 'public'
      })
    ).toThrow('Only club managers can publish announcement posts.')
  })
})
