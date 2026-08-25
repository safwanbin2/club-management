import {
  Alert,
  Avatar,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Skeleton,
  Tag,
  Tooltip
} from 'antd'
import { MessageSquare, RefreshCw, Trash2 } from 'lucide-react'

import UserProfileLink from '@features/user-profile-link'
import { formatRelativeTime, getEntityInitials } from '../shared/helpers'
import type { FeedComment, FeedPost } from '../shared/types'

type CommentFormValues = {
  body: string
}

type FeedCommentsDrawerProps = {
  comments: FeedComment[]
  isError: boolean
  isOpen: boolean
  isPending: boolean
  isSubmitting: boolean
  moderatingCommentId: null | string
  onClose: () => void
  onModerate: (comment: FeedComment) => void
  onRetry: () => void
  onSubmit: (body: string, reset: () => void) => void
  post: FeedPost | null
}

export default function FeedCommentsDrawer({
  comments,
  isError,
  isOpen,
  isPending,
  isSubmitting,
  moderatingCommentId,
  onClose,
  onModerate,
  onRetry,
  onSubmit,
  post
}: FeedCommentsDrawerProps) {
  const [form] = Form.useForm<CommentFormValues>()

  const handleFinish = (values: CommentFormValues) => {
    onSubmit(values.body.trim(), () => form.resetFields())
  }

  return (
    <Drawer
      destroyOnClose
      onClose={onClose}
      open={isOpen}
      title={
        <span className="inline-flex items-center gap-2">
          <MessageSquare aria-hidden="true" size={18} />
          Comments
        </span>
      }
      width="min(520px, 100vw)"
    >
      {post ? (
        <div className="mb-4 rounded-app border border-border bg-muted p-4">
          <p className="m-0 text-sm font-semibold text-text-soft">{post.club?.name}</p>
          <h2 className="m-0 mt-1 text-lg font-bold text-text">{post.title ?? 'Feed post'}</h2>
        </div>
      ) : null}

      {isError ? (
        <Alert
          action={
            <Button icon={<RefreshCw size={15} />} onClick={onRetry}>
              Retry
            </Button>
          }
          className="mb-4"
          message="Comments could not load"
          showIcon
          type="error"
        />
      ) : null}

      {isPending ? <Skeleton active avatar paragraph={{ rows: 4 }} /> : null}

      {!isPending && comments.length === 0 ? (
        <Empty description="No comments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : null}

      {!isPending && comments.length > 0 ? (
        <List
          className="mb-5"
          dataSource={comments}
          renderItem={comment => (
            <List.Item
              actions={
                comment.canModerate
                  ? [
                      <Tooltip key="delete" title="Remove comment">
                        <Button
                          aria-label="Remove comment"
                          danger
                          icon={<Trash2 size={15} />}
                          loading={moderatingCommentId === comment.id}
                          onClick={() => onModerate(comment)}
                          type="text"
                        />
                      </Tooltip>
                    ]
                  : undefined
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    className="bg-primary text-white"
                    src={comment.author.avatarUrl ?? undefined}
                  >
                    {getEntityInitials(comment.author.name)}
                  </Avatar>
                }
                description={
                  <span className="space-y-2">
                    <span className="block whitespace-pre-line text-sm text-text">
                      {comment.body}
                    </span>
                    {comment.moderationStatus !== 'visible' ? (
                      <Tag className="m-0" color="warning">
                        {comment.moderationStatus}
                      </Tag>
                    ) : null}
                  </span>
                }
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    <UserProfileLink
                      className="font-semibold text-text hover:text-primary"
                      name={comment.author.name}
                      userId={comment.author.id}
                    />
                    <span className="text-xs font-normal text-text-muted">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </span>
                }
              />
            </List.Item>
          )}
        />
      ) : null}

      {post?.canComment ? (
        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            label="Add comment"
            name="body"
            rules={[
              { message: 'Write a comment.', required: true },
              { min: 2, message: 'Comment must be at least 2 characters.' }
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} maxLength={1000} showCount />
          </Form.Item>
          <Button htmlType="submit" loading={isSubmitting} type="primary">
            Post Comment
          </Button>
        </Form>
      ) : null}
    </Drawer>
  )
}
