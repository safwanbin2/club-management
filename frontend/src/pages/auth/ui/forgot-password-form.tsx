import { Alert, Button, Form, Input } from 'antd'
import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

import useForgotPassword from '../data/use-forgot-password'
import { getApiErrorMessage } from '../shared/helpers'
import type { ForgotPasswordPayload } from '../shared/types'

export default function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword()
  const resetToken = forgotPassword.data?.data.resetToken

  const handleSubmit = (values: ForgotPasswordPayload) => {
    forgotPassword.mutate(values)
  }

  return (
    <Form<ForgotPasswordPayload> layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      {forgotPassword.isError ? (
        <Alert
          className="mb-5"
          message={getApiErrorMessage(forgotPassword.error, 'Unable to start password recovery.')}
          showIcon
          type="error"
        />
      ) : null}

      {forgotPassword.isSuccess ? (
        <Alert
          className="mb-5"
          description={
            resetToken ? (
              <span>
                Local demo reset token:{' '}
                <Link
                  className="font-semibold text-primary"
                  to={`/reset-password?token=${resetToken}`}
                >
                  open reset form
                </Link>
              </span>
            ) : undefined
          }
          message="Password reset instructions sent."
          showIcon
          type="success"
        />
      ) : null}

      <Form.Item
        label="University email"
        name="email"
        rules={[
          { message: 'Email is required.', required: true },
          { message: 'Enter a valid email.', type: 'email' }
        ]}
      >
        <Input
          autoComplete="email"
          prefix={<Mail size={18} aria-hidden="true" />}
          placeholder="name@university.edu"
        />
      </Form.Item>

      <Button
        block
        htmlType="submit"
        icon={<ArrowRight size={18} />}
        iconPosition="end"
        loading={forgotPassword.isPending}
        type="primary"
      >
        Send Reset Instructions
      </Button>

      <p className="mb-0 mt-6 text-center text-sm text-text-soft">
        Remember your password?{' '}
        <Link className="font-semibold text-primary" to="/login">
          Sign in
        </Link>
      </p>
    </Form>
  )
}
