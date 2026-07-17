import { Alert, App as AntApp, Button, Form, Input, Select, Skeleton, Switch } from 'antd'
import { KeyRound, Save, Settings as SettingsIcon } from 'lucide-react'
import { useEffect } from 'react'

import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useAccountSettings from './data/use-account-settings'
import useChangePassword from './data/use-change-password'
import useUpdateAccountSettings from './data/use-update-account-settings'
import type { ChangePasswordPayload, UpdateAccountSettingsPayload } from './shared/types'

export default function SettingsPage() {
  const { message } = AntApp.useApp()
  const { accountSettings, isAccountSettingsError, isAccountSettingsPending } = useAccountSettings()
  const updateSettings = useUpdateAccountSettings()
  const changePassword = useChangePassword()
  const [settingsForm] = Form.useForm<UpdateAccountSettingsPayload>()
  const [passwordForm] = Form.useForm<ChangePasswordPayload>()

  useEffect(() => {
    if (accountSettings) {
      settingsForm.setFieldsValue({
        notificationPreferences: accountSettings.notificationPreferences,
        profileVisibility: accountSettings.profileVisibility
      })
    }
  }, [accountSettings, settingsForm])

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Settings">
        <section>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Account
          </p>
          <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Settings</h1>
          <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
            Manage profile visibility, notification preferences, and password security.
          </p>
        </section>

        {isAccountSettingsError ? (
          <Alert message="Settings could not load" showIcon type="error" />
        ) : null}
        {isAccountSettingsPending ? <Skeleton active paragraph={{ rows: 6 }} /> : null}

        {accountSettings ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <h2 className="m-0 mb-4 inline-flex items-center gap-2 text-xl font-bold text-text">
                <SettingsIcon aria-hidden="true" size={20} />
                Preferences
              </h2>
              <Form
                form={settingsForm}
                layout="vertical"
                onFinish={values =>
                  updateSettings.mutate(values, {
                    onError: error => {
                      message.error(getApiErrorMessage(error, 'Settings could not be updated.'))
                    },
                    onSuccess: () => {
                      message.success('Settings updated.')
                    }
                  })
                }
                requiredMark={false}
              >
                <Form.Item label="Public profile visibility" name="profileVisibility">
                  <Select
                    options={[
                      { label: 'Public', value: 'public' },
                      { label: 'University only', value: 'university' },
                      { label: 'Private', value: 'private' }
                    ]}
                  />
                </Form.Item>

                <div className="grid gap-3 md:grid-cols-2">
                  <Form.Item
                    label="In-app notifications"
                    name={['notificationPreferences', 'inApp']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Email digest"
                    name={['notificationPreferences', 'emailDigest']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Event reminders"
                    name={['notificationPreferences', 'eventReminders']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Membership updates"
                    name={['notificationPreferences', 'membershipUpdates']}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <Button
                  htmlType="submit"
                  icon={<Save size={16} />}
                  loading={updateSettings.isPending}
                  type="primary"
                >
                  Save Settings
                </Button>
              </Form>
            </section>

            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <h2 className="m-0 mb-4 inline-flex items-center gap-2 text-xl font-bold text-text">
                <KeyRound aria-hidden="true" size={20} />
                Password
              </h2>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={values =>
                  changePassword.mutate(values, {
                    onError: error => {
                      message.error(getApiErrorMessage(error, 'Password could not be changed.'))
                    },
                    onSuccess: () => {
                      message.success('Password changed.')
                      passwordForm.resetFields()
                    }
                  })
                }
                requiredMark={false}
              >
                <Form.Item
                  label="Current password"
                  name="currentPassword"
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>
                <Form.Item
                  label="New password"
                  name="newPassword"
                  rules={[{ required: true }, { min: 8, message: 'Use at least 8 characters.' }]}
                >
                  <Input.Password />
                </Form.Item>
                <Button htmlType="submit" loading={changePassword.isPending}>
                  Change Password
                </Button>
              </Form>
            </section>
          </section>
        ) : null}
      </main>
    </AppShell>
  )
}
