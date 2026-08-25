import { Button, Form, Input, Modal, Select, Space, Switch } from 'antd'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import type { CreateFeedPostPayload, FeedClub } from '../shared/types'

const GENERAL_FEED_VALUE = '__campus_feed__'

type FeedPostFormValues = {
  body: string
  clubId: string
  highlighted?: boolean
  images?: string[]
  pinned?: boolean
  title?: string
  type: CreateFeedPostPayload['type']
  visibility: CreateFeedPostPayload['visibility']
}

type FeedCreatePostModalProps = {
  clubs: FeedClub[]
  manageableClubs: FeedClub[]
  isOpen: boolean
  isPending: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateFeedPostPayload) => void
}

export default function FeedCreatePostModal({
  clubs,
  manageableClubs,
  isOpen,
  isPending,
  isSubmitting,
  onClose,
  onSubmit
}: FeedCreatePostModalProps) {
  const [form] = Form.useForm<FeedPostFormValues>()
  const selectedClubId = Form.useWatch('clubId', form)
  const manageableClubIds = useMemo(
    () => new Set(manageableClubs.map(club => club.slug)),
    [manageableClubs]
  )
  const isGeneralPost = !selectedClubId || selectedClubId === GENERAL_FEED_VALUE
  const canPublishManagedContent = !isGeneralPost && manageableClubIds.has(selectedClubId)

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        clubId: GENERAL_FEED_VALUE,
        highlighted: false,
        images: [],
        pinned: false,
        type: 'post',
        visibility: 'public'
      })
    }
  }, [form, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (isGeneralPost) {
      form.setFieldsValue({
        highlighted: false,
        pinned: false,
        type: 'post',
        visibility: 'public'
      })
      return
    }

    if (!canPublishManagedContent) {
      form.setFieldsValue({
        highlighted: false,
        pinned: false,
        type: 'post'
      })
    }
  }, [canPublishManagedContent, form, isGeneralPost, isOpen])

  const handleFinish = (values: FeedPostFormValues) => {
    const clubId = values.clubId === GENERAL_FEED_VALUE ? undefined : values.clubId

    onSubmit({
      body: values.body.trim(),
      clubId,
      highlighted: Boolean(values.highlighted),
      images: (values.images ?? []).map(image => image.trim()).filter(Boolean),
      pinned: Boolean(values.pinned),
      title: values.title?.trim() || undefined,
      type: values.type,
      visibility: values.visibility
    })
  }

  return (
    <Modal
      centered
      confirmLoading={isSubmitting}
      destroyOnClose
      okText="Publish"
      onCancel={onClose}
      onOk={() => form.submit()}
      open={isOpen}
      title="Create Feed Post"
      width="min(680px, calc(100vw - 32px))"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        preserve={false}
        requiredMark={false}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Form.Item label="Post to" name="clubId" rules={[{ required: true }]}>
            <Select
              loading={isPending}
              options={[
                { label: 'Campus feed', value: GENERAL_FEED_VALUE },
                ...clubs.map(club => ({
                  label: club.name,
                  value: club.slug
                }))
              ]}
            />
          </Form.Item>

          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Select
              options={
                canPublishManagedContent
                  ? [
                      { label: 'Post', value: 'post' },
                      { label: 'Announcement', value: 'announcement' },
                      { label: 'Achievement', value: 'achievement' }
                    ]
                  : [{ label: 'Post', value: 'post' }]
              }
            />
          </Form.Item>
        </div>

        <Form.Item label="Title" name="title">
          <Input maxLength={140} placeholder="Optional headline" showCount />
        </Form.Item>

        <Form.Item
          label="Body"
          name="body"
          rules={[
            { message: 'Write the post body.', required: true },
            { min: 10, message: 'Post body must be at least 10 characters.' }
          ]}
        >
          <Input.TextArea autoSize={{ minRows: 5, maxRows: 8 }} maxLength={4000} showCount />
        </Form.Item>

        <div className="grid gap-3 md:grid-cols-3">
          <Form.Item label="Visibility" name="visibility" rules={[{ required: true }]}>
            <Select
              options={
                isGeneralPost
                  ? [{ label: 'Public', value: 'public' }]
                  : [
                      { label: 'Public', value: 'public' },
                      { label: 'Members only', value: 'members' }
                    ]
              }
            />
          </Form.Item>

          <Form.Item label="Pin post" name="pinned" valuePropName="checked">
            <Switch disabled={!canPublishManagedContent} />
          </Form.Item>

          <Form.Item label="Highlight" name="highlighted" valuePropName="checked">
            <Switch disabled={!canPublishManagedContent} />
          </Form.Item>
        </div>

        <Form.List name="images">
          {(fields, { add, remove }) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-text">Image URLs</span>
                <Button icon={<Plus size={15} />} onClick={() => add('')} size="small">
                  Add URL
                </Button>
              </div>
              {fields.map(field => (
                <Space.Compact block key={field.key}>
                  <Form.Item
                    className="mb-2 flex-1"
                    name={field.name}
                    rules={[{ type: 'url', message: 'Use a valid image URL.' }]}
                  >
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Button
                    aria-label="Remove image URL"
                    icon={<Trash2 size={15} />}
                    onClick={() => remove(field.name)}
                  />
                </Space.Compact>
              ))}
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}
