import { Button, Empty, Form, Input, Modal, Select, Space, Switch } from 'antd'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

import type { CreateFeedPostPayload, FeedClub } from '../shared/types'

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
  isOpen: boolean
  isPending: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateFeedPostPayload) => void
}

export default function FeedCreatePostModal({
  clubs,
  isOpen,
  isPending,
  isSubmitting,
  onClose,
  onSubmit
}: FeedCreatePostModalProps) {
  const [form] = Form.useForm<FeedPostFormValues>()

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        highlighted: false,
        images: [],
        pinned: false,
        type: 'post',
        visibility: 'public'
      })
    }
  }, [form, isOpen])

  const handleFinish = (values: FeedPostFormValues) => {
    onSubmit({
      body: values.body.trim(),
      clubId: values.clubId,
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
      {clubs.length === 0 && !isPending ? (
        <Empty
          description="You do not manage any active clubs yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          preserve={false}
          requiredMark={false}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Form.Item
              label="Club"
              name="clubId"
              rules={[{ message: 'Choose a club.', required: true }]}
            >
              <Select
                loading={isPending}
                options={clubs.map(club => ({
                  label: club.name,
                  value: club.slug
                }))}
                placeholder="Select club"
              />
            </Form.Item>

            <Form.Item label="Type" name="type" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Post', value: 'post' },
                  { label: 'Announcement', value: 'announcement' },
                  { label: 'Achievement', value: 'achievement' }
                ]}
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
                options={[
                  { label: 'Public', value: 'public' },
                  { label: 'Members only', value: 'members' }
                ]}
              />
            </Form.Item>

            <Form.Item label="Pin post" name="pinned" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label="Highlight" name="highlighted" valuePropName="checked">
              <Switch />
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
      )}
    </Modal>
  )
}
