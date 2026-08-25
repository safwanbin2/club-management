import { Alert, Avatar, Button, Empty, Form, Input, List, Modal, Skeleton, Space, Tag } from 'antd'
import { RefreshCw, ShieldCheck, UserRoundCog, Users } from 'lucide-react'
import { useState } from 'react'

import UserProfileLink from '@features/user-profile-link'
import { getClubInitials } from '../shared/helpers'
import type { ClubMember } from '../shared/types'

type ClubMembersPanelProps = {
  canManage: boolean
  isError: boolean
  isFetching: boolean
  isRoleUpdatePending: boolean
  members: ClubMember[]
  onRefresh: () => void
  onUpdateRole: (
    member: ClubMember,
    clubRole: 'executive' | 'member',
    executivePosition?: string
  ) => void
  totalMembers: number
}

type PromoteFormValues = {
  executivePosition: string
}

export default function ClubMembersPanel({
  canManage,
  isError,
  isFetching,
  isRoleUpdatePending,
  members,
  onRefresh,
  onUpdateRole,
  totalMembers
}: ClubMembersPanelProps) {
  const [promotingMember, setPromotingMember] = useState<ClubMember | null>(null)
  const [form] = Form.useForm<PromoteFormValues>()

  const closePromoteModal = () => {
    setPromotingMember(null)
    form.resetFields()
  }

  return (
    <section className="rounded-app border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Users className="text-primary" size={19} aria-hidden="true" />
          <div>
            <h2 className="m-0 text-xl font-bold text-text">Club Members</h2>
            <p className="m-0 text-sm text-text-soft">{totalMembers} active members</p>
          </div>
        </div>
        <Button icon={<RefreshCw size={15} />} loading={isFetching} onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <Alert className="m-5" message="Members could not load" showIcon type="error" />
      ) : null}

      {isFetching && members.length === 0 ? (
        <div className="p-5">
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </div>
      ) : null}

      {!isFetching && members.length === 0 ? (
        <div className="px-5 py-10">
          <Empty description="No active members yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : null}

      {members.length > 0 ? (
        <List
          dataSource={members}
          renderItem={member => (
            <List.Item
              actions={
                canManage
                  ? [
                      member.clubRole === 'member' ? (
                        <Button
                          icon={<ShieldCheck size={15} />}
                          key="promote"
                          loading={isRoleUpdatePending}
                          onClick={() => setPromotingMember(member)}
                          size="small"
                        >
                          Promote
                        </Button>
                      ) : (
                        <Button
                          icon={<UserRoundCog size={15} />}
                          key="demote"
                          loading={isRoleUpdatePending}
                          onClick={() => onUpdateRole(member, 'member')}
                          size="small"
                        >
                          Make Member
                        </Button>
                      )
                    ]
                  : undefined
              }
              className="px-5"
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    className="bg-primary text-white"
                    src={member.user.avatarUrl ?? undefined}
                  >
                    {getClubInitials(member.user.name)}
                  </Avatar>
                }
                description={
                  <span className="text-sm text-text-soft">
                    {member.executivePosition ?? member.user.department ?? member.user.email}
                  </span>
                }
                title={
                  <Space wrap>
                    <UserProfileLink
                      className="font-semibold text-text hover:text-primary"
                      name={member.user.name}
                      userId={member.user.id}
                    />
                    <Tag color={member.clubRole === 'member' ? 'default' : 'magenta'}>
                      {member.clubRole}
                    </Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : null}

      <Modal
        centered
        confirmLoading={isRoleUpdatePending}
        destroyOnClose
        okText="Promote"
        onCancel={closePromoteModal}
        onOk={() => form.submit()}
        open={Boolean(promotingMember)}
        title="Promote To Executive"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={values => {
            if (promotingMember) {
              onUpdateRole(promotingMember, 'executive', values.executivePosition.trim())
            }
            closePromoteModal()
          }}
          preserve={false}
          requiredMark={false}
        >
          <Form.Item
            label="Executive position"
            name="executivePosition"
            rules={[{ message: 'Executive position is required.', required: true }]}
          >
            <Input maxLength={120} placeholder="Secretary, Treasurer, Event Lead..." />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
