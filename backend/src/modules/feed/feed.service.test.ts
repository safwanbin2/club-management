import { describe, expect, it } from 'vitest'

import { buildPostModerationUpdate, getVisibleCommentCountDelta } from './feed.service.js'

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
