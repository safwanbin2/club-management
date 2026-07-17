import { Empty, Form, Input, InputNumber, Modal, Select } from 'antd'
import { useEffect } from 'react'

import { fromDateTimeLocal, toDateTimeLocal } from '../shared/helpers'
import type {
  CreateEventPayload,
  EventClub,
  EventItem,
  EventStatus,
  UpdateEventPayload
} from '../shared/types'

type EventFormValues = {
  bannerUrl?: string
  capacity: number
  clubId?: string
  description: string
  endsAt: string
  registrationDeadline: string
  startsAt: string
  status: EventStatus
  title: string
  venue: string
  visibility: CreateEventPayload['visibility']
}

type EventFormModalProps = {
  clubs: EventClub[]
  event: EventItem | null
  isClubsPending: boolean
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateEventPayload | UpdateEventPayload) => void
}

export default function EventFormModal({
  clubs,
  event,
  isClubsPending,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit
}: EventFormModalProps) {
  const [form] = Form.useForm<EventFormValues>()
  const isEditing = Boolean(event)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (event) {
      form.setFieldsValue({
        bannerUrl: event.bannerUrl ?? undefined,
        capacity: event.capacity,
        description: event.description,
        endsAt: toDateTimeLocal(event.endsAt),
        registrationDeadline: toDateTimeLocal(event.registrationDeadline),
        startsAt: toDateTimeLocal(event.startsAt),
        status: event.status,
        title: event.title,
        venue: event.venue,
        visibility: event.visibility
      })
      return
    }

    form.setFieldsValue({
      capacity: 50,
      status: 'published',
      visibility: 'public'
    })
  }, [event, form, isOpen])

  const handleFinish = (values: EventFormValues) => {
    const payload = {
      bannerUrl: values.bannerUrl?.trim() || undefined,
      capacity: values.capacity,
      description: values.description.trim(),
      endsAt: fromDateTimeLocal(values.endsAt),
      registrationDeadline: fromDateTimeLocal(values.registrationDeadline),
      startsAt: fromDateTimeLocal(values.startsAt),
      status: values.status,
      title: values.title.trim(),
      venue: values.venue.trim(),
      visibility: values.visibility
    }

    if (event) {
      onSubmit({
        ...payload,
        eventId: event.id
      })
      return
    }

    onSubmit({
      ...payload,
      clubId: values.clubId ?? '',
      status: values.status === 'draft' ? 'draft' : 'published'
    })
  }

  return (
    <Modal
      centered
      confirmLoading={isSubmitting}
      destroyOnClose
      okText={isEditing ? 'Save Event' : 'Create Event'}
      onCancel={onClose}
      onOk={() => form.submit()}
      open={isOpen}
      title={isEditing ? 'Edit Event' : 'Create Event'}
      width="min(720px, calc(100vw - 32px))"
    >
      {!isEditing && clubs.length === 0 && !isClubsPending ? (
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
          {!isEditing ? (
            <Form.Item
              label="Club"
              name="clubId"
              rules={[{ message: 'Choose a club.', required: true }]}
            >
              <Select
                loading={isClubsPending}
                options={clubs.map(club => ({ label: club.name, value: club.slug }))}
                placeholder="Select club"
              />
            </Form.Item>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <Form.Item
              label="Title"
              name="title"
              rules={[{ message: 'Event title is required.', required: true }]}
            >
              <Input maxLength={160} showCount />
            </Form.Item>

            <Form.Item
              label="Venue"
              name="venue"
              rules={[{ message: 'Venue is required.', required: true }]}
            >
              <Input maxLength={160} />
            </Form.Item>
          </div>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { message: 'Description is required.', required: true },
              { min: 20, message: 'Description must be at least 20 characters.' }
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} maxLength={4000} showCount />
          </Form.Item>

          <div className="grid gap-3 md:grid-cols-3">
            <Form.Item
              label="Starts"
              name="startsAt"
              rules={[{ message: 'Start date is required.', required: true }]}
            >
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item
              label="Ends"
              name="endsAt"
              rules={[{ message: 'End date is required.', required: true }]}
            >
              <Input type="datetime-local" />
            </Form.Item>

            <Form.Item
              label="Registration deadline"
              name="registrationDeadline"
              rules={[{ message: 'Registration deadline is required.', required: true }]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Form.Item
              label="Capacity"
              name="capacity"
              rules={[{ message: 'Capacity is required.', required: true }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>

            <Form.Item label="Status" name="status" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Published', value: 'published' },
                  { label: 'Draft', value: 'draft' },
                  ...(isEditing
                    ? [
                        { label: 'Completed', value: 'completed' },
                        { label: 'Cancelled', value: 'cancelled' }
                      ]
                    : [])
                ]}
              />
            </Form.Item>

            <Form.Item label="Visibility" name="visibility" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: 'Public', value: 'public' },
                  { label: 'Members only', value: 'members' }
                ]}
              />
            </Form.Item>

            <Form.Item label="Banner URL" name="bannerUrl">
              <Input placeholder="https://..." />
            </Form.Item>
          </div>
        </Form>
      )}
    </Modal>
  )
}
