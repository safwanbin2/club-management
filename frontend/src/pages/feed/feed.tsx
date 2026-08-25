import { Alert, App as AntApp, Button, Empty, Pagination } from 'antd'
import { Megaphone, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { USER_ROLES } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import useCreateFeedPost from './data/use-create-feed-post'
import useCreatePostComment from './data/use-create-post-comment'
import useFeedManageableClubs from './data/use-feed-manageable-clubs'
import useFeedPostableClubs from './data/use-feed-postable-clubs'
import useFeedPosts from './data/use-feed-posts'
import useFeedTrendingClubs from './data/use-feed-trending-clubs'
import useModerateFeedComment from './data/use-moderate-feed-comment'
import useModerateFeedPost from './data/use-moderate-feed-post'
import usePostComments from './data/use-post-comments'
import useTogglePostLike from './data/use-toggle-post-like'
import { parseFeedPostType, parseFeedSort, parsePage, parsePerPage } from './shared/helpers'
import type {
  CreateFeedPostPayload,
  FeedListPayload,
  FeedPost,
  ModerateFeedPostPayload
} from './shared/types'
import FeedCommentsDrawer from './ui/feed-comments-drawer'
import FeedCreatePostModal from './ui/feed-create-post-modal'
import FeedPostCard from './ui/feed-post-card'
import FeedSkeleton from './ui/feed-skeleton'
import FeedToolbar from './ui/feed-toolbar'
import TrendingClubsPanel from './ui/trending-clubs-panel'

type ParamUpdates = Record<string, null | number | string | undefined>

function canCreateFeedPost(role: null | string | undefined) {
  return Boolean(role)
}

function canPublishManagedFeedPost(role: null | string | undefined) {
  return role === USER_ROLES.clubExecutive || role === USER_ROLES.universityAdmin
}

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<null | string>(null)
  const urlSearchTerm = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350)
  const userCanCreate = canCreateFeedPost(user?.role)
  const userCanPublishManagedContent = canPublishManagedFeedPost(user?.role)

  const updateSearchParams = useCallback(
    (updates: ParamUpdates) => {
      const nextParams = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          nextParams.delete(key)
        } else {
          nextParams.set(key, String(value))
        }
      })

      setSearchParams(nextParams)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    setSearchTerm(urlSearchTerm)
  }, [urlSearchTerm])

  useEffect(() => {
    const trimmedSearchTerm = debouncedSearchTerm.trim()

    if (trimmedSearchTerm !== urlSearchTerm) {
      updateSearchParams({ page: 1, search: trimmedSearchTerm })
    }
  }, [debouncedSearchTerm, updateSearchParams, urlSearchTerm])

  const payload: FeedListPayload = useMemo(
    () => ({
      page: parsePage(searchParams.get('page')),
      perPage: parsePerPage(searchParams.get('perPage')),
      search: urlSearchTerm,
      sort: parseFeedSort(searchParams.get('sort')),
      type: parseFeedPostType(searchParams.get('type'))
    }),
    [searchParams, urlSearchTerm]
  )

  const {
    currentFeedPage,
    feedPosts,
    isFeedError,
    isFeedFetching,
    isFeedPending,
    lastFeedPage,
    refetchFeed,
    totalFeedPosts
  } = useFeedPosts(payload)
  const { isTrendingClubsPending, trendingClubs } = useFeedTrendingClubs()
  const { isManageableClubsPending, manageableClubs } = useFeedManageableClubs(
    userCanPublishManagedContent
  )
  const { isPostableClubsPending, postableClubs } = useFeedPostableClubs(userCanCreate)
  const createFeedPost = useCreateFeedPost()
  const togglePostLike = useTogglePostLike()
  const createPostComment = useCreatePostComment()
  const moderateFeedPost = useModerateFeedPost()
  const moderateFeedComment = useModerateFeedComment()
  const selectedPost = feedPosts.find(post => post.id === selectedPostId) ?? null
  const { comments, isCommentsError, isCommentsPending, refetchComments } = usePostComments(
    selectedPostId,
    Boolean(selectedPostId)
  )

  const handleCreatePost = (values: CreateFeedPostPayload) => {
    createFeedPost.mutate(values, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Post could not be published.'))
      },
      onSuccess: () => {
        message.success('Post published.')
        setCreateOpen(false)
      }
    })
  }

  const handleLike = (post: FeedPost) => {
    togglePostLike.mutate(post.id, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Post reaction could not be updated.'))
      }
    })
  }

  const handleModeratePost = (payload: ModerateFeedPostPayload) => {
    moderateFeedPost.mutate(payload, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Post could not be updated.'))
      },
      onSuccess: () => {
        message.success('Post updated.')
      }
    })
  }

  const handleCreateComment = (body: string, reset: () => void) => {
    if (!selectedPostId) {
      return
    }

    createPostComment.mutate(
      {
        body,
        postId: selectedPostId
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Comment could not be posted.'))
        },
        onSuccess: () => {
          reset()
          message.success('Comment posted.')
        }
      }
    )
  }

  const handleModerateComment = (commentId: string) => {
    if (!selectedPostId) {
      return
    }

    moderateFeedComment.mutate(
      {
        commentId,
        moderationStatus: 'deleted',
        postId: selectedPostId
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Comment could not be removed.'))
        },
        onSuccess: () => {
          message.success('Comment removed.')
        }
      }
    )
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="News feed">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Campus feed
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Latest Updates</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Follow announcements, event updates, polls, achievements, and club posts across
              campus.
            </p>
          </div>

          {userCanCreate ? (
            <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)} type="primary">
              Create Post
            </Button>
          ) : null}
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0 space-y-5">
            <FeedToolbar
              isRefreshing={isFeedFetching && !isFeedPending}
              onRefresh={() => refetchFeed()}
              onSearchChange={setSearchTerm}
              onSortChange={sort => updateSearchParams({ page: 1, sort })}
              onTypeChange={type => updateSearchParams({ page: 1, type })}
              searchTerm={searchTerm}
              sort={payload.sort}
              totalPosts={totalFeedPosts}
              type={payload.type}
            />

            {isFeedError ? (
              <Alert
                action={
                  <Button icon={<RefreshCw size={16} />} onClick={() => refetchFeed()}>
                    Retry
                  </Button>
                }
                message="News feed could not load"
                showIcon
                type="error"
              />
            ) : null}

            {isFeedPending ? <FeedSkeleton /> : null}

            {!isFeedPending && feedPosts.length === 0 ? (
              <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
                <Empty
                  description="No feed posts match these filters"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    onClick={() =>
                      updateSearchParams({
                        page: 1,
                        perPage: null,
                        search: null,
                        sort: null,
                        type: null
                      })
                    }
                  >
                    Clear Filters
                  </Button>
                </Empty>
              </section>
            ) : null}

            {feedPosts.length > 0 ? (
              <section className="space-y-5" aria-label="Feed posts">
                {feedPosts.map(post => (
                  <FeedPostCard
                    isLikePending={togglePostLike.isPending && togglePostLike.variables === post.id}
                    isModerationPending={
                      moderateFeedPost.isPending && moderateFeedPost.variables?.postId === post.id
                    }
                    key={post.id}
                    onComments={activePost => setSelectedPostId(activePost.id)}
                    onLike={handleLike}
                    onModerate={handleModeratePost}
                    post={post}
                  />
                ))}
              </section>
            ) : null}

            {lastFeedPage > 1 || totalFeedPosts > payload.perPage ? (
              <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
                <Pagination
                  current={currentFeedPage}
                  onChange={(page, perPage) => updateSearchParams({ page, perPage })}
                  pageSize={payload.perPage}
                  pageSizeOptions={[5, 8, 12, 20]}
                  showSizeChanger
                  total={totalFeedPosts}
                />
              </div>
            ) : null}

            {isFeedFetching && !isFeedPending ? (
              <p className="m-0 text-center text-sm font-semibold text-text-soft">
                Refreshing feed...
              </p>
            ) : null}
          </section>

          <aside className="space-y-5">
            <TrendingClubsPanel clubs={trendingClubs} isPending={isTrendingClubsPending} />

            <section className="rounded-app border border-border bg-primary p-5 text-white shadow-panel">
              <Megaphone aria-hidden="true" size={24} />
              <h2 className="mb-2 mt-4 text-xl font-bold">Feed Snapshot</h2>
              <p className="m-0 text-sm leading-6 text-white/80">
                {totalFeedPosts} visible update(s) across announcements, events, polls,
                achievements, and club posts.
              </p>
            </section>
          </aside>
        </div>

        <FeedCreatePostModal
          clubs={postableClubs}
          manageableClubs={manageableClubs}
          isOpen={isCreateOpen}
          isPending={
            isPostableClubsPending || (userCanPublishManagedContent && isManageableClubsPending)
          }
          isSubmitting={createFeedPost.isPending}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreatePost}
        />

        <FeedCommentsDrawer
          comments={comments}
          isError={isCommentsError}
          isOpen={Boolean(selectedPostId)}
          isPending={isCommentsPending}
          isSubmitting={createPostComment.isPending}
          moderatingCommentId={moderateFeedComment.variables?.commentId ?? null}
          onClose={() => setSelectedPostId(null)}
          onModerate={comment => handleModerateComment(comment.id)}
          onRetry={() => refetchComments()}
          onSubmit={handleCreateComment}
          post={selectedPost}
        />
      </main>
    </AppShell>
  )
}
