import { Alert, Button, Empty, Popconfirm, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Check, RefreshCw, X } from 'lucide-react'

import type { ClubMembershipRequest } from '../shared/types'
import { formatDateTime } from '../shared/helpers'

type MembershipRequestsPanelProps = {
  isError: boolean
  isFetching: boolean
  isReviewPending: boolean
  onRefresh: () => void
  onReview: (request: ClubMembershipRequest, action: 'approve' | 'reject') => void
  requests: ClubMembershipRequest[]
  totalRequests: number
}

export default function MembershipRequestsPanel({
  isError,
  isFetching,
  isReviewPending,
  onRefresh,
  onReview,
  requests,
  totalRequests
}: MembershipRequestsPanelProps) {
  const columns: ColumnsType<ClubMembershipRequest> = [
    {
      dataIndex: ['user', 'name'],
      key: 'student',
      render: (_, request) => (
        <div>
          <p className="m-0 font-semibold text-text">{request.user.name}</p>
          <p className="m-0 text-xs text-text-soft">{request.user.email}</p>
        </div>
      ),
      title: 'Student'
    },
    {
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: value => <span className="text-sm text-text-soft">{formatDateTime(value)}</span>,
      title: 'Requested'
    },
    {
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color="gold">{status}</Tag>,
      title: 'Status'
    },
    {
      key: 'actions',
      render: (_, request) => (
        <div className="flex justify-end gap-2">
          <Popconfirm
            okText="Approve"
            onConfirm={() => onReview(request, 'approve')}
            title="Approve this membership request?"
          >
            <Button
              icon={<Check size={16} />}
              loading={isReviewPending}
              size="small"
              type="primary"
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            okButtonProps={{ danger: true }}
            okText="Reject"
            onConfirm={() => onReview(request, 'reject')}
            title="Reject this membership request?"
          >
            <Button danger icon={<X size={16} />} loading={isReviewPending} size="small">
              Reject
            </Button>
          </Popconfirm>
        </div>
      ),
      title: ''
    }
  ]

  return (
    <section className="rounded-app border border-border bg-surface shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="m-0 text-xl font-bold text-text">Membership Requests</h2>
          <p className="m-0 text-sm text-text-soft">{totalRequests} pending request(s)</p>
        </div>
        <Button icon={<RefreshCw size={16} />} onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <div className="px-5 pt-5">
          <Alert message="Membership requests could not load" showIcon type="error" />
        </div>
      ) : null}

      <Table
        columns={columns}
        dataSource={requests}
        loading={isFetching}
        locale={{
          emptyText: (
            <Empty description="No pending requests" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )
        }}
        pagination={false}
        rowKey="id"
        scroll={{ x: 720 }}
      />
    </section>
  )
}
