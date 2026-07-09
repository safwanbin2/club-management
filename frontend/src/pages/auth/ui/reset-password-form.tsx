import { Alert, Button, Form, Input } from 'antd'
import { ArrowRight, KeyRound, Lock } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import useResetPassword from '../data/use-reset-password'
import { getApiErrorMessage } from '../shared/helpers'

type ResetFormValues = {
  confirmPassword: string
  password: string
  token: string
}

export default function ResetPasswordForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetPassword = useResetPassword()
  const initialToken = searchParams.get('token') ?? ''

  const handleSubmit = ({ confirmPassword: _confirmPassword, ...payload }: ResetFormValues) => {
    resetPassword.mutate(payload, {
      onSuccess: () => {
        navigate('/login', { replace: true })
      }
    })
  }

  return (
    <Form<ResetFormValues>
      initialValues={{ token: initialToken }}
      layout="vertical"
      requiredMark={false}
      onFinish={handleSubmit}
    >
      {resetPassword.isError ? (
        <Alert
          className="mb-5"
          message={getApiErrorMessage(resetPassword.error, 'Unable to update your password.')}
          showIcon
          type="error"
        />
      ) : null}

      <Form.Item
        label="Reset token"
        name="token"
        rules={[{ message: 'Reset token is required.', required: true }]}
      >
        <Input prefix={<KeyRound size={18} aria-hidden="true" />} placeholder="Paste reset token" />
      </Form.Item>

      <Form.Item
        label="New password"
        name="password"
        rules={[
          { message: 'Password is required.', required: true },
          { min: 8, message: 'Use at least 8 characters.' },
          {
            pattern: /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/,
            message: 'Use uppercase, lowercase, and a number.'
          }
        ]}
      >
        <Input.Password
          autoComplete="new-password"
          prefix={<Lock size={18} aria-hidden="true" />}
        />
      </Form.Item>

      <Form.Item
        dependencies={['password']}
        label="Confirm password"
        name="confirmPassword"
        rules={[
          { message: 'Confirm your password.', required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }

              return Promise.reject(new Error('Passwords do not match.'))
            }
          })
        ]}
      >
        <Input.Password
          autoComplete="new-password"
          prefix={<Lock size={18} aria-hidden="true" />}
        />
      </Form.Item>

      <Button
        block
        htmlType="submit"
        icon={<ArrowRight size={18} />}
        iconPosition="end"
        loading={resetPassword.isPending}
        type="primary"
      >
        Update Password
      </Button>

      <p className="mb-0 mt-6 text-center text-sm text-text-soft">
        Back to{' '}
        <Link className="font-semibold text-primary" to="/login">
          sign in
        </Link>
      </p>
    </Form>
  )
}
