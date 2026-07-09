import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import AuthShell from './ui/auth-shell'
import ForgotPasswordForm from './ui/forgot-password-form'
import LoginForm from './ui/login-form'
import RegisterForm from './ui/register-form'
import ResetPasswordForm from './ui/reset-password-form'

type AuthPageProps = {
  footer?: ReactNode
  form: ReactNode
  subtitle: string
  title: string
}

function AuthPage({ footer, form, subtitle, title }: AuthPageProps) {
  return (
    <AuthShell footer={footer} subtitle={subtitle} title={title}>
      {form}
    </AuthShell>
  )
}

const legalFooter = (
  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
    <Link to="/login">Privacy Policy</Link>
    <Link to="/login">Support</Link>
    <Link to="/login">Terms</Link>
  </div>
)

export function LoginPage() {
  return (
    <AuthPage
      footer={legalFooter}
      form={<LoginForm />}
      subtitle="Manage your organization, memberships, and campus activity."
      title="Welcome Back"
    />
  )
}

export function RegisterPage() {
  return (
    <AuthPage
      footer={legalFooter}
      form={<RegisterForm />}
      subtitle="Create your student profile and start joining university clubs."
      title="Create Student Account"
    />
  )
}

export function ForgotPasswordPage() {
  return (
    <AuthPage
      form={<ForgotPasswordForm />}
      subtitle="Enter your university email and we will send a secure reset link."
      title="Reset Access"
    />
  )
}

export function ResetPasswordPage() {
  return (
    <AuthPage
      form={<ResetPasswordForm />}
      subtitle="Choose a new password for your CampusHub account."
      title="Set New Password"
    />
  )
}
