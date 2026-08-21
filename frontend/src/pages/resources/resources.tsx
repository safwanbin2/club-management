import {
  Alert,
  App as AntApp,
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Pagination,
  Radio,
  Select,
  Skeleton,
  Statistic,
  Tag
} from 'antd'
import { CheckCircle2, ClipboardList, Plus, RefreshCw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { USER_ROLES } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import UserProfileLink from '@features/user-profile-link'
import useCreateResourceRequest from './data/use-create-resource-request'
import useManageableResourceClubs from './data/use-manageable-resource-clubs'
import useResourceRequestAnalytics from './data/use-resource-request-analytics'
import useResourceRequests from './data/use-resource-requests'
import useReviewResourceRequest from './data/use-review-resource-request'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  fromDateTimeLocal,
  getStatusColor,
  getTypeLabel,
  parsePage,
  parsePerPage,
  parseResourceStatus,
  parseResourceType
} from './shared/helpers'
import type {
  CreateResourceRequestPayload,
  ResourceRequestItem,
  ResourceRequestListPayload,
  ResourceRequestStatus,
  ResourceRequestType,
  ReviewResourceRequestPayload
} from './shared/types'

type ParamUpdates = Record<string, null | number | string | undefined>

type ResourceRequestFormValues = {
  clubId: string
  details: CreateResourceRequestPayload['details']
  type: ResourceRequestType
}

type ReviewFormValues = Omit<ReviewResourceRequestPayload, 'requestId'>

function canManageResources(role: null | string | undefined) {
  return role === USER_ROLES.clubExecutive || role === USER_ROLES.universityAdmin
}

function canReviewResources(role: null | string | undefined) {
  return role === USER_ROLES.universityAdmin
}

function buildCreatePayload(values: ResourceRequestFormValues): CreateResourceRequestPayload {
  return {
    clubId: values.clubId,
    details: {
      amount: values.type === 'funding' ? values.details.amount : undefined,
      description: values.details.description.trim(),
      requestedDate:
        values.type === 'room_booking' && values.details.requestedDate
          ? fromDateTimeLocal(values.details.requestedDate)
          : undefined,
      room: values.type === 'room_booking' ? values.details.room?.trim() : undefined,
      title: values.details.title.trim()
    },
    type: values.type
  }
}

export default function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const [createForm] = Form.useForm<ResourceRequestFormValues>()
  const [reviewForm] = Form.useForm<ReviewFormValues>()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<null | ResourceRequestItem>(null)
  const urlSearchTerm = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350)
  const userCanManage = canManageResources(user?.role)
  const userCanReview = canReviewResources(user?.role)
  const requestType = Form.useWatch('type', createForm)

  const updateSearchParams = useCallback(
    (updates: ParamUpdates) => {
      const nextParams = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          nextParams.delete(key)
        } else {
          nextParams.set(key, String(value))
        }
      })

      setSearchParams(nextParams)
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    setSearchTerm(urlSearchTerm)
  }, [urlSearchTerm])

  useEffect(() => {
    const trimmedSearchTerm = debouncedSearchTerm.trim()

    if (trimmedSearchTerm !== urlSearchTerm) {
      updateSearchParams({ page: 1, search: trimmedSearchTerm })
    }
  }, [debouncedSearchTerm, updateSearchParams, urlSearchTerm])

  useEffect(() => {
    if (isCreateOpen) {
      createForm.setFieldsValue({ type: 'funding' })
    }
  }, [createForm, isCreateOpen])

  useEffect(() => {
    if (selectedReview) {
      reviewForm.setFieldsValue({ remarks: selectedReview.remarks ?? '', status: 'approved' })
    }
  }, [reviewForm, selectedReview])

  const payload: ResourceRequestListPayload = useMemo(
    () => ({
      clubId: searchParams.get('clubId') ?? undefined,
      page: parsePage(searchParams.get('page')),
      perPage: parsePerPage(searchParams.get('perPage')),
      search: urlSearchTerm,
      status: parseResourceStatus(searchParams.get('status')),
      type: parseResourceType(searchParams.get('type'))
    }),
    [searchParams, urlSearchTerm]
  )

  const {
    currentResourceRequestPage,
    isResourceRequestsError,
    isResourceRequestsFetching,
    isResourceRequestsPending,
    lastResourceRequestPage,
    refetchResourceRequests,
    resourceRequests,
    totalResourceRequests
  } = useResourceRequests(payload)
  const { analytics, isResourceAnalyticsPending } = useResourceRequestAnalytics()
  const { isManageableResourceClubsPending, manageableResourceClubs } =
    useManageableResourceClubs(userCanManage)
  const createRequest = useCreateResourceRequest()
  const reviewRequest = useReviewResourceRequest()

  const handleCreate = (values: ResourceRequestFormValues) => {
    createRequest.mutate(buildCreatePayload(values), {
      onError: error => {
        message.error(getApiErrorMessage(error, 'Resource request could not be submitted.'))
      },
      onSuccess: () => {
        message.success('Resource request submitted.')
        setCreateOpen(false)
        createForm.resetFields()
      }
    })
  }

  const handleReview = (values: ReviewFormValues) => {
    if (!selectedReview) {
      return
    }

    reviewRequest.mutate(
      {
        remarks: values.remarks?.trim() ?? '',
        requestId: selectedReview.id,
        status: values.status
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Resource request could not be reviewed.'))
        },
        onSuccess: () => {
          message.success('Resource request reviewed.')
          setSelectedReview(null)
          reviewForm.resetFields()
        }
      }
    )
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Resource requests">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Requests
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Resources</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Submit funding and room booking requests, then track approvals and remarks.
            </p>
          </div>

          {userCanManage ? (
            <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)} type="primary">
              New Request
            </Button>
          ) : null}
        </section>

        <section
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          aria-label="Resource request analytics"
        >
          {isResourceAnalyticsPending ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                className="rounded-app border border-border bg-surface p-5 shadow-panel"
                key={index}
              >
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <Statistic title="Pending Requests" value={analytics?.pending ?? 0} />
              </div>
              <div className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <Statistic title="Approved" value={analytics?.approved ?? 0} />
              </div>
              <div className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <Statistic
                  title="Pending Funding"
                  value={formatMoney(analytics?.amountPending ?? 0)}
                />
              </div>
              <div className="rounded-app border border-border bg-surface p-5 shadow-panel">
                <Statistic title="Room Queue" value={analytics?.roomBookingsPending ?? 0} />
              </div>
            </>
          )}
        </section>

        <section className="grid gap-3 rounded-app border border-border bg-surface p-4 shadow-panel lg:grid-cols-[minmax(220px,1fr)_170px_160px_200px_auto]">
          <Input
            allowClear
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search requests..."
            value={searchTerm}
          />
          <Select
            onChange={(status: ResourceRequestStatus | 'all') =>
              updateSearchParams({ page: 1, status })
            }
            options={[
              { label: 'Any Status', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Rejected', value: 'rejected' }
            ]}
            value={payload.status}
          />
          <Select
            onChange={(type: ResourceRequestType | 'all') => updateSearchParams({ page: 1, type })}
            options={[
              { label: 'Any Type', value: 'all' },
              { label: 'Funding', value: 'funding' },
              { label: 'Room Booking', value: 'room_booking' }
            ]}
            value={payload.type}
          />
          <Select
            allowClear
            loading={isManageableResourceClubsPending}
            onChange={clubId => updateSearchParams({ clubId, page: 1 })}
            options={manageableResourceClubs.map(club => ({
              label: club.name,
              value: club.id
            }))}
            placeholder="All clubs"
            value={payload.clubId}
          />
          <Button
            icon={<RefreshCw size={16} />}
            loading={isResourceRequestsFetching && !isResourceRequestsPending}
            onClick={() => refetchResourceRequests()}
          >
            {totalResourceRequests} requests
          </Button>
        </section>

        {isResourceRequestsError ? (
          <Alert message="Resource requests could not load" showIcon type="error" />
        ) : null}

        {!isResourceRequestsPending && resourceRequests.length === 0 ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty description="No resource requests found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </section>
        ) : null}

        {resourceRequests.length > 0 ? (
          <section className="rounded-app border border-border bg-surface shadow-panel">
            <List
              dataSource={resourceRequests}
              loading={isResourceRequestsPending}
              renderItem={request => (
                <List.Item
                  actions={[
                    <Link key="club" to={`/clubs/${request.club.slug}`}>
                      Club
                    </Link>,
                    userCanReview && request.status === 'pending' ? (
                      <Button
                        key="review"
                        onClick={() => setSelectedReview(request)}
                        type="primary"
                      >
                        Review
                      </Button>
                    ) : null
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <span className="grid size-11 place-items-center rounded-app bg-primary-soft text-primary">
                        <ClipboardList aria-hidden="true" size={19} />
                      </span>
                    }
                    description={
                      <span className="block space-y-2 text-sm text-text-soft">
                        <span className="block">{request.details.description}</span>
                        <span className="block">
                          {request.type === 'funding' && request.details.amount
                            ? `Amount: ${formatMoney(request.details.amount)}`
                            : null}
                          {request.type === 'room_booking'
                            ? `Room: ${request.details.room ?? 'TBD'}${
                                request.details.requestedDate
                                  ? ` • ${formatDateTime(request.details.requestedDate)}`
                                  : ''
                              }`
                            : null}
                        </span>
                        <span className="block text-xs text-text-muted">
                          Requested by{' '}
                          <UserProfileLink
                            className="font-semibold text-text-muted hover:text-primary"
                            name={request.requestedBy.name}
                            userId={request.requestedBy.id}
                          />{' '}
                          on {formatDate(request.createdAt)}
                        </span>
                        {request.remarks ? (
                          <span className="block rounded-app bg-muted px-3 py-2 text-xs text-text-soft">
                            {request.remarks}
                          </span>
                        ) : null}
                      </span>
                    }
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-text">{request.details.title}</span>
                        <Tag color={getStatusColor(request.status)}>{request.status}</Tag>
                        <Tag>{getTypeLabel(request.type)}</Tag>
                        <Tag>{request.club.name}</Tag>
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </section>
        ) : null}

        {lastResourceRequestPage > 1 ? (
          <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
            <Pagination
              current={currentResourceRequestPage}
              onChange={page => updateSearchParams({ page })}
              pageSize={payload.perPage}
              total={totalResourceRequests}
            />
          </div>
        ) : null}
      </main>

      <Modal
        confirmLoading={createRequest.isPending}
        destroyOnHidden
        okText="Submit Request"
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        open={isCreateOpen}
        title="New Resource Request"
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} requiredMark={false}>
          <Form.Item label="Type" name="type" rules={[{ required: true }]}>
            <Radio.Group
              options={[
                { label: 'Funding', value: 'funding' },
                { label: 'Room Booking', value: 'room_booking' }
              ]}
            />
          </Form.Item>
          <Form.Item label="Club" name="clubId" rules={[{ required: true }]}>
            <Select
              loading={isManageableResourceClubsPending}
              options={manageableResourceClubs.map(club => ({
                label: club.name,
                value: club.id
              }))}
              placeholder="Select a club"
            />
          </Form.Item>
          <Form.Item label="Title" name={['details', 'title']} rules={[{ required: true }]}>
            <Input maxLength={160} />
          </Form.Item>
          <Form.Item
            label="Description"
            name={['details', 'description']}
            rules={[{ required: true }]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} maxLength={800} />
          </Form.Item>

          {requestType === 'room_booking' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Form.Item label="Room" name={['details', 'room']} rules={[{ required: true }]}>
                <Input maxLength={120} />
              </Form.Item>
              <Form.Item
                label="Requested date"
                name={['details', 'requestedDate']}
                rules={[{ required: true }]}
              >
                <Input type="datetime-local" />
              </Form.Item>
            </div>
          ) : (
            <Form.Item label="Amount" name={['details', 'amount']} rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} precision={0} prefix="$" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        confirmLoading={reviewRequest.isPending}
        destroyOnHidden
        okText="Save Review"
        onCancel={() => setSelectedReview(null)}
        onOk={() => reviewForm.submit()}
        open={Boolean(selectedReview)}
        title="Review Resource Request"
      >
        {selectedReview ? (
          <div className="mb-4 rounded-app border border-border bg-muted p-4">
            <p className="m-0 font-bold text-text">{selectedReview.details.title}</p>
            <p className="m-0 mt-1 text-sm text-text-soft">
              {selectedReview.club.name} • {getTypeLabel(selectedReview.type)}
            </p>
          </div>
        ) : null}
        <Form form={reviewForm} layout="vertical" onFinish={handleReview} requiredMark={false}>
          <Form.Item label="Decision" name="status" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="approved">
                <CheckCircle2 className="mr-1 inline" size={15} />
                Approve
              </Radio.Button>
              <Radio.Button value="rejected">
                <XCircle className="mr-1 inline" size={15} />
                Reject
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  )
}
