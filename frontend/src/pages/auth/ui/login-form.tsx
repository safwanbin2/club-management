import { Alert, Button, Checkbox, Form, Input } from 'antd'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import useLogin from '../data/use-login'
import { getApiErrorMessage } from '../shared/helpers'
import type { LoginPayload } from '../shared/types'

export default function LoginForm() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard'

  const handleSubmit = (values: LoginPayload) => {
    login.mutate(values, {
      onSuccess: () => {
        navigate(redirectTo, { replace: true })
      }
    })
  }

  return (
    <Form<LoginPayload> layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      {login.isError ? (
        <Alert
          className="mb-5"
          message={getApiErrorMessage(login.error, 'Unable to sign in.')}
          showIcon
          type="error"
        />
      ) : null}

      <Form.Item
        label="Email address"
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

      <Form.Item
        label={
          <div className="flex w-full items-center justify-between gap-4">
            <span>Password</span>
            <Link className="text-sm font-semibold text-primary" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
        }
        name="password"
        rules={[{ message: 'Password is required.', required: true }]}
      >
        <Input.Password
          autoComplete="current-password"
          prefix={<Lock size={18} aria-hidden="true" />}
        />
      </Form.Item>

      <div className="mb-6 flex items-center justify-between gap-4">
        <Checkbox>Remember this device</Checkbox>
      </div>

      <Button
        block
        htmlType="submit"
        icon={<ArrowRight size={18} />}
        iconPosition="end"
        loading={login.isPending}
        type="primary"
      >
        Sign In
      </Button>

      <p className="mb-0 mt-6 text-center text-sm text-text-soft">
        New to CampusHub?{' '}
        <Link className="font-semibold text-primary" to="/register">
          Create a student account
        </Link>
      </p>
    </Form>
  )
}
