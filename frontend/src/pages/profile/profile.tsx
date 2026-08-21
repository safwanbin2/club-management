import { Alert, App as AntApp, Avatar, Button, Empty, Form, Input, List, Tag } from 'antd'
import { Award, Building2, RefreshCw, Save, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ROLE_LABELS } from '@common/constants/roles'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useProfile from './data/use-profile'
import useUpdateProfile from './data/use-update-profile'
import { formatDateTime, getInitials } from './shared/helpers'
import type { UpdateOwnProfilePayload } from './shared/types'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { message } = AntApp.useApp()
  const { isProfileError, isProfilePending, profile, refetchProfile } = useProfile(userId)
  const updateProfile = useUpdateProfile()
  const [form] = Form.useForm<UpdateOwnProfilePayload>()

  const handleFinish = (values: UpdateOwnProfilePayload) => {
    updateProfile.mutate(values, {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Profile could not be updated.'))
      },
      onSuccess: () => {
        message.success('Profile updated.')
      }
    })
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Profile">
        {isProfileError ? <Alert message="Profile could not load" showIcon type="error" /> : null}

        {!profile && !isProfilePending ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="Profile unavailable" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </section>
        ) : null}

        {profile ? (
          <>
            <section className="grid gap-5 rounded-app border border-border bg-surface p-5 shadow-panel lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
              <Avatar
                className="bg-primary text-white"
                size={84}
                src={profile.user.avatarUrl ?? undefined}
              >
                {getInitials(profile.user.name)}
              </Avatar>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  {ROLE_LABELS[profile.user.role]}
                </p>
                <h1 className="m-0 text-3xl font-bold text-text">{profile.user.name}</h1>
                <p className="mb-0 mt-2 text-text-soft">
                  {[profile.user.department, profile.user.studentId].filter(Boolean).join(' • ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button icon={<RefreshCw size={16} />} onClick={() => refetchProfile()}>
                  Refresh
                </Button>
                {profile.isOwnProfile ? (
                  <Button onClick={() => navigate('/settings')} type="primary">
                    Account Settings
                  </Button>
                ) : null}
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-5">
                {profile.isOwnProfile ? (
                  <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                    <h2 className="m-0 mb-4 inline-flex items-center gap-2 text-xl font-bold text-text">
                      <UserRound aria-hidden="true" size={20} />
                      Private Profile
                    </h2>
                    <Form
                      form={form}
                      initialValues={{
                        avatarUrl: profile.user.avatarUrl ?? undefined,
                        department: profile.user.department ?? undefined,
                        name: profile.user.name,
                        studentId: profile.user.studentId ?? undefined
                      }}
                      layout="vertical"
                      onFinish={handleFinish}
                      requiredMark={false}
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Student ID" name="studentId">
                          <Input />
                        </Form.Item>
                        <Form.Item label="Department" name="department">
                          <Input />
                        </Form.Item>
                        <Form.Item label="Avatar URL" name="avatarUrl">
                          <Input placeholder="https://..." />
                        </Form.Item>
                      </div>
                      <Button
                        htmlType="submit"
                        icon={<Save size={16} />}
                        loading={updateProfile.isPending}
                        type="primary"
                      >
                        Save Profile
                      </Button>
                    </Form>
                  </section>
                ) : null}

                <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                  <h2 className="m-0 mb-4 inline-flex items-center gap-2 text-xl font-bold text-text">
                    <Building2 aria-hidden="true" size={20} />
                    Clubs
                  </h2>
                  {profile.clubs.length === 0 ? (
                    <Empty description="No clubs yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {profile.clubs.map(club => (
                        <Link
                          className="rounded-app border border-border bg-muted p-4 transition hover:border-primary/30"
                          key={club.id}
                          to={`/clubs/${club.slug}`}
                        >
                          <span className="block font-bold text-text">{club.name}</span>
                          <span className="mt-1 block text-sm text-text-soft">
                            {club.executivePosition ?? club.clubRole}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                  <h2 className="m-0 mb-4 text-xl font-bold text-text">Activity Timeline</h2>
                  <List
                    dataSource={profile.activityTimeline}
                    locale={{ emptyText: 'No recent activity' }}
                    renderItem={activity => (
                      <List.Item>
                        <List.Item.Meta
                          description={`${activity.description} • ${formatDateTime(activity.at)}`}
                          title={<span className="font-semibold text-text">{activity.title}</span>}
                        />
                      </List.Item>
                    )}
                  />
                </section>
              </div>

              <aside className="space-y-5">
                <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
                  <h2 className="m-0 mb-4 inline-flex items-center gap-2 text-xl font-bold text-text">
                    <Award aria-hidden="true" size={20} />
                    Badges
                  </h2>
                  {profile.badges.length === 0 ? (
                    <Empty description="No badges yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <div className="space-y-3">
                      {profile.badges.map(badge => (
                        <div
                          className="rounded-app border border-border bg-muted p-3"
                          key={badge.id}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="m-0 font-bold text-text">{badge.title}</p>
                              <p className="m-0 mt-1 text-sm text-text-soft">{badge.description}</p>
                            </div>
                            <Tag color="purple">{badge.badgeType.replaceAll('_', ' ')}</Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </aside>
            </section>
          </>
        ) : null}
      </main>
    </AppShell>
  )
}
