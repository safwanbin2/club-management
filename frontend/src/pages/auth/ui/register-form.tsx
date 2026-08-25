import { Alert, Button, Form, Input, Select } from 'antd'
import { ArrowRight, IdCard, Lock, Mail, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import {
  EAST_DELTA_EMAIL_DOMAIN_ERROR,
  EAST_DELTA_EMAIL_SUFFIX,
  EAST_DELTA_PROGRAM_OPTIONS,
  isEastDeltaEmail
} from '@common/constants/east-delta-university'
import useRegister from '../data/use-register'
import { getApiErrorMessage } from '../shared/helpers'
import type { RegisterPayload } from '../shared/types'

type RegisterFormValues = RegisterPayload & {
  confirmPassword: string
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const register = useRegister()

  const handleSubmit = ({ confirmPassword: _confirmPassword, ...payload }: RegisterFormValues) => {
    register.mutate(payload, {
      onSuccess: () => {
        navigate('/dashboard', { replace: true })
      }
    })
  }

  return (
    <Form<RegisterFormValues> layout="vertical" requiredMark={false} onFinish={handleSubmit}>
      {register.isError ? (
        <Alert
          className="mb-5"
          message={getApiErrorMessage(register.error, 'Unable to create this account.')}
          showIcon
          type="error"
        />
      ) : null}

      <Form.Item
        label="Full name"
        name="name"
        rules={[{ message: 'Name is required.', required: true }]}
      >
        <Input
          autoComplete="name"
          prefix={<User size={18} aria-hidden="true" />}
          placeholder="Aisha Rahman"
        />
      </Form.Item>

      <Form.Item
        label="University email"
        name="email"
        rules={[
          { message: 'Email is required.', required: true },
          { message: 'Enter a valid email.', type: 'email' },
          {
            validator(_, value: string | undefined) {
              if (!value || isEastDeltaEmail(value)) {
                return Promise.resolve()
              }

              return Promise.reject(new Error(EAST_DELTA_EMAIL_DOMAIN_ERROR))
            }
          }
        ]}
        validateFirst
      >
        <Input
          autoComplete="email"
          prefix={<Mail size={18} aria-hidden="true" />}
          placeholder={`name${EAST_DELTA_EMAIL_SUFFIX}`}
        />
      </Form.Item>

      <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
        <Form.Item label="Student ID" name="studentId">
          <Input prefix={<IdCard size={18} aria-hidden="true" />} placeholder="2026-1234" />
        </Form.Item>

        <Form.Item label="Department / Program" name="department">
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={EAST_DELTA_PROGRAM_OPTIONS}
            placeholder="Select your program"
          />
        </Form.Item>
      </div>

      <Form.Item
        label="Password"
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
        loading={register.isPending}
        type="primary"
      >
        Create Student Account
      </Button>

      <p className="mb-0 mt-6 text-center text-sm text-text-soft">
        Already registered?{' '}
        <Link className="font-semibold text-primary" to="/login">
          Sign in
        </Link>
      </p>
    </Form>
  )
}
