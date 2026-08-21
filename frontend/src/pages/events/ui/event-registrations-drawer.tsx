import {
  Alert,
  Avatar,
  Button,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Segmented,
  Skeleton,
  Space,
  Tag
} from 'antd'
import { CheckCircle2, RefreshCw, Users, XCircle } from 'lucide-react'
import { useState } from 'react'

import UserProfileLink from '@features/user-profile-link'
import { formatDateTime, formatRegistrationStatus, getEntityInitials } from '../shared/helpers'
import type { EventItem, EventRegistrationListItem, EventRegistrationStatus } from '../shared/types'

type EventRegistrationsDrawerProps = {
  event: EventItem | null
  isError: boolean
  isOpen: boolean
  isPending: boolean
  isReviewPending: boolean
  onClose: () => void
  onReview: (registrationId: string, action: 'approve' | 'decline', remarks?: string) => void
  onRetry: () => void
  onStatusChange: (status: EventRegistrationStatus) => void
  registrations: EventRegistrationListItem[]
  status: EventRegistrationStatus
  totalRegistrations: number
}

export default function EventRegistrationsDrawer({
  event,
  isError,
  isOpen,
  isPending,
  isReviewPending,
  onClose,
  onReview,
  onRetry,
  onStatusChange,
  registrations,
  status,
  totalRegistrations
}: EventRegistrationsDrawerProps) {
  const [decliningRegistration, setDecliningRegistration] =
    useState<EventRegistrationListItem | null>(null)
  const [form] = Form.useForm<{ remarks: string }>()

  const closeDeclineModal = () => {
    setDecliningRegistration(null)
    form.resetFields()
  }

  return (
    <>
      <Drawer
        destroyOnClose
        onClose={onClose}
        open={isOpen}
        title={
          <span className="inline-flex items-center gap-2">
            <Users aria-hidden="true" size={18} />
            Event Registrations
          </span>
        }
        width="min(620px, 100vw)"
      >
      {event ? (
        <div className="mb-4 rounded-app border border-border bg-muted p-4">
          <p className="m-0 text-sm font-semibold text-text-soft">{event.club.name}</p>
          <h2 className="m-0 mt-1 text-lg font-bold text-text">{event.title}</h2>
          <p className="m-0 mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
        </div>
      ) : null}

      <div className="mb-4 min-w-0 overflow-x-auto">
        <Segmented
          block
          onChange={value => onStatusChange(value as EventRegistrationStatus)}
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Registered', value: 'registered' },
            { label: 'Waitlisted', value: 'waitlisted' },
            { label: 'Declined', value: 'declined' },
            { label: 'Cancelled', value: 'cancelled' }
          ]}
          value={status}
        />
      </div>

      {isError ? (
        <Alert
          action={
            <Button icon={<RefreshCw size={15} />} onClick={onRetry}>
              Retry
            </Button>
          }
          className="mb-4"
          message="Registrations could not load"
          showIcon
          type="error"
        />
      ) : null}

      {isPending ? <Skeleton active avatar paragraph={{ rows: 5 }} /> : null}

      {!isPending && registrations.length === 0 ? (
        <Empty
          description={`No ${formatRegistrationStatus(status).toLowerCase()} attendees`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : null}

      {!isPending && registrations.length > 0 ? (
        <List
          dataSource={registrations}
          footer={
            <span className="text-sm font-semibold text-text-soft">
              {totalRegistrations} {formatRegistrationStatus(status).toLowerCase()}
            </span>
          }
          renderItem={registration => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    className="bg-primary text-white"
                    src={registration.user.avatarUrl ?? undefined}
                  >
                    {getEntityInitials(registration.user.name)}
                  </Avatar>
                }
                description={
                  <div className="space-y-1 text-sm text-text-soft">
                    <p className="m-0">
                      {registration.user.email}
                      {registration.waitlistPosition
                        ? ` • Waitlist #${registration.waitlistPosition}`
                        : ''}
                    </p>
                    {registration.paymentTransactionId ? (
                      <p className="m-0 font-mono text-xs">
                        Txn: {registration.paymentTransactionId}
                      </p>
                    ) : null}
                    {registration.paymentReviewRemarks ? (
                      <p className="m-0 text-xs">Reason: {registration.paymentReviewRemarks}</p>
                    ) : null}
                  </div>
                }
                title={
                  <span className="flex flex-wrap items-center gap-2">
                    <UserProfileLink
                      className="font-semibold text-text hover:text-primary"
                      name={registration.user.name}
                      userId={registration.user.id}
                    />
                    <Tag
                      color={
                        registration.status === 'registered'
                          ? 'green'
                          : registration.status === 'pending'
                            ? 'blue'
                            : registration.status === 'declined'
                              ? 'red'
                              : registration.status === 'waitlisted'
                                ? 'gold'
                                : 'default'
                      }
                    >
                      {formatRegistrationStatus(registration.status)}
                    </Tag>
                  </span>
                }
              />
              {registration.status === 'pending' ? (
                <Space wrap>
                  <Button
                    icon={<CheckCircle2 size={15} />}
                    loading={isReviewPending}
                    onClick={() => onReview(registration.id, 'approve')}
                    size="small"
                    type="primary"
                  >
                    Approve
                  </Button>
                  <Button
                    danger
                    icon={<XCircle size={15} />}
                    loading={isReviewPending}
                    onClick={() => setDecliningRegistration(registration)}
                    size="small"
                  >
                    Decline
                  </Button>
                </Space>
              ) : null}
            </List.Item>
          )}
        />
      ) : null}
      </Drawer>

      <Modal
        centered
        confirmLoading={isReviewPending}
        destroyOnClose
        okButtonProps={{ danger: true }}
        okText="Decline Registration"
        onCancel={closeDeclineModal}
        onOk={() => form.submit()}
        open={Boolean(decliningRegistration)}
        title="Decline Registration"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={values => {
            if (decliningRegistration) {
              onReview(decliningRegistration.id, 'decline', values.remarks.trim())
            }
            closeDeclineModal()
          }}
          preserve={false}
          requiredMark={false}
        >
          <Form.Item
            label="Reason"
            name="remarks"
            rules={[{ message: 'Decline reason is required.', required: true }]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
