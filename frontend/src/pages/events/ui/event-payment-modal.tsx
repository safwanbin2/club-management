import { Alert, Form, Input, Modal } from 'antd'
import { WalletCards } from 'lucide-react'
import { useEffect } from 'react'

import { formatEventFee } from '../shared/helpers'
import type { EventItem } from '../shared/types'

type EventPaymentModalProps = {
  event: EventItem | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (event: EventItem, paymentTransactionId: string) => void
}

type EventPaymentFormValues = {
  paymentTransactionId: string
}

export default function EventPaymentModal({
  event,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit
}: EventPaymentModalProps) {
  const [form] = Form.useForm<EventPaymentFormValues>()

  useEffect(() => {
    if (isOpen) {
      form.resetFields()
    }
  }, [form, isOpen])

  return (
    <Modal
      centered
      confirmLoading={isSubmitting}
      destroyOnClose
      okText="Submit Registration"
      onCancel={onClose}
      onOk={() => form.submit()}
      open={isOpen}
      title="Submit bKash Payment"
      width="min(520px, calc(100vw - 32px))"
    >
      {event ? (
        <div className="space-y-4">
          <Alert
            icon={<WalletCards size={18} />}
            message={`${formatEventFee(event.feeAmount)} send money to ${event.bkashNumber}`}
            showIcon
            type="info"
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={values => onSubmit(event, values.paymentTransactionId.trim())}
            preserve={false}
            requiredMark={false}
          >
            <Form.Item
              extra="Send money outside the app first, then paste the bKash transaction ID here."
              label="bKash transaction ID"
              name="paymentTransactionId"
              rules={[
                { message: 'Transaction ID is required.', required: true },
                { min: 3, message: 'Transaction ID must be at least 3 characters.' }
              ]}
            >
              <Input maxLength={120} placeholder="Transaction ID" />
            </Form.Item>
          </Form>
        </div>
      ) : null}
    </Modal>
  )
}
