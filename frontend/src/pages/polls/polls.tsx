import {
  Alert,
  App as AntApp,
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  Modal,
  Pagination,
  Progress,
  Radio,
  Select,
  Tag
} from 'antd'
import { BarChart3, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { USER_ROLES } from '@common/constants/roles'
import { useAuthUser } from '@common/globalStates/use-auth-store'
import getApiErrorMessage from '@common/helpers/get-api-error-message'
import useDebouncedValue from '@common/hooks/use-debounced-value'
import AppShell from '@features/app-shell'
import useCreatePoll from './data/use-create-poll'
import useManageablePollClubs from './data/use-manageable-poll-clubs'
import usePolls from './data/use-polls'
import useUpdatePollStatus from './data/use-update-poll-status'
import useVotePoll from './data/use-vote-poll'
import {
  formatDateTime,
  formatPercent,
  parsePage,
  parsePerPage,
  parsePollScope,
  parsePollStatus
} from './shared/helpers'
import type { CreatePollPayload, PollItem, PollListPayload, PollScope } from './shared/types'

type ParamUpdates = Record<string, null | number | string | undefined>

type PollFormValues = {
  closesAt: string
  clubId: string
  options: string
  question: string
  status: CreatePollPayload['status']
  type: CreatePollPayload['type']
  visibility: CreatePollPayload['visibility']
}

function canCreatePolls(role: null | string | undefined) {
  return role === USER_ROLES.clubExecutive || role === USER_ROLES.universityAdmin
}

function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

export default function PollsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useAuthUser()
  const { message } = AntApp.useApp()
  const [form] = Form.useForm<PollFormValues>()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const urlSearchTerm = searchParams.get('search') ?? ''
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm)
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 350)
  const userCanCreate = canCreatePolls(user?.role)

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
      form.setFieldsValue({
        status: 'open',
        type: 'single_choice',
        visibility: 'public'
      })
    }
  }, [form, isCreateOpen])

  const payload: PollListPayload = useMemo(
    () => ({
      page: parsePage(searchParams.get('page')),
      perPage: parsePerPage(searchParams.get('perPage')),
      scope: parsePollScope(searchParams.get('scope')),
      search: urlSearchTerm,
      status: parsePollStatus(searchParams.get('status'))
    }),
    [searchParams, urlSearchTerm]
  )

  const {
    currentPollPage,
    isPollsError,
    isPollsFetching,
    isPollsPending,
    lastPollPage,
    polls,
    refetchPolls,
    totalPolls
  } = usePolls(payload)
  const { isManageablePollClubsPending, manageablePollClubs } =
    useManageablePollClubs(userCanCreate)
  const createPoll = useCreatePoll()
  const votePoll = useVotePoll()
  const updatePollStatus = useUpdatePollStatus()

  const handleCreatePoll = (values: PollFormValues) => {
    const options = values.options
      .split('\n')
      .map(option => option.trim())
      .filter(Boolean)

    createPoll.mutate(
      {
        closesAt: fromDateTimeLocal(values.closesAt),
        clubId: values.clubId,
        options,
        question: values.question.trim(),
        status: values.status,
        type: values.type,
        visibility: values.visibility
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Poll could not be created.'))
        },
        onSuccess: () => {
          message.success('Poll created.')
          setCreateOpen(false)
          form.resetFields()
        }
      }
    )
  }

  const handleVote = (poll: PollItem) => {
    votePoll.mutate(
      {
        pollId: poll.id,
        selectedOptionIds: selections[poll.id] ?? []
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Vote could not be recorded.'))
        },
        onSuccess: () => {
          message.success('Vote recorded.')
        }
      }
    )
  }

  const handleStatus = (poll: PollItem, status: 'closed' | 'open') => {
    updatePollStatus.mutate(
      {
        pollId: poll.id,
        status
      },
      {
        onError: error => {
          message.error(getApiErrorMessage(error, 'Poll could not be updated.'))
        },
        onSuccess: () => {
          message.success('Poll updated.')
        }
      }
    )
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Polls">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Club polls
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Polls</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Vote in club polls, review live results, and manage questions for clubs you lead.
            </p>
          </div>

          {userCanCreate ? (
            <Button icon={<Plus size={17} />} onClick={() => setCreateOpen(true)} type="primary">
              Create Poll
            </Button>
          ) : null}
        </section>

        <section className="grid gap-3 rounded-app border border-border bg-surface p-4 shadow-panel lg:grid-cols-[minmax(220px,1fr)_160px_150px_auto]">
          <Input
            allowClear
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search poll questions..."
            value={searchTerm}
          />
          <Select
            onChange={(scope: PollScope) => updateSearchParams({ page: 1, scope })}
            options={[
              { label: 'All Polls', value: 'all' },
              { label: 'My Clubs', value: 'myClubs' },
              { label: 'Voted', value: 'voted' },
              { label: 'Managed', value: 'managed' }
            ]}
            value={payload.scope}
          />
          <Select
            onChange={status => updateSearchParams({ page: 1, status })}
            options={[
              { label: 'Any Status', value: 'all' },
              { label: 'Open', value: 'open' },
              { label: 'Closed', value: 'closed' },
              { label: 'Draft', value: 'draft' }
            ]}
            value={payload.status}
          />
          <Button
            icon={<RefreshCw size={16} />}
            loading={isPollsFetching && !isPollsPending}
            onClick={() => refetchPolls()}
          >
            {totalPolls} polls
          </Button>
        </section>

        {isPollsError ? <Alert message="Polls could not load" showIcon type="error" /> : null}

        {!isPollsPending && polls.length === 0 ? (
          <section className="rounded-app border border-border bg-surface px-5 py-12 shadow-panel">
            <Empty
              description="No polls match these filters"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </section>
        ) : null}

        {polls.length > 0 ? (
          <section className="grid gap-5 xl:grid-cols-2" aria-label="Poll results">
            {polls.map(poll => {
              const selectedIds =
                selections[poll.id] ?? poll.currentUserVote?.selectedOptionIds ?? []

              return (
                <article
                  className="rounded-app border border-border bg-surface p-5 shadow-panel"
                  key={poll.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-sm font-semibold text-primary">{poll.club.name}</p>
                      <h2 className="m-0 mt-2 text-xl font-bold text-text">{poll.question}</h2>
                      <p className="m-0 mt-2 text-sm text-text-soft">
                        Closes {formatDateTime(poll.closesAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Tag color={poll.status === 'open' ? 'green' : 'default'}>{poll.status}</Tag>
                      <Tag>
                        {poll.type === 'single_choice' ? 'Single choice' : 'Multiple choice'}
                      </Tag>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {poll.type === 'single_choice' ? (
                      <Radio.Group
                        disabled={!poll.canVote || Boolean(poll.currentUserVote)}
                        onChange={event =>
                          setSelections(current => ({
                            ...current,
                            [poll.id]: [event.target.value]
                          }))
                        }
                        value={selectedIds[0]}
                      >
                        <div className="space-y-3">
                          {poll.options.map(option => (
                            <Radio className="block" key={option.id} value={option.id}>
                              {option.label}
                            </Radio>
                          ))}
                        </div>
                      </Radio.Group>
                    ) : (
                      <Checkbox.Group
                        disabled={!poll.canVote || Boolean(poll.currentUserVote)}
                        onChange={values =>
                          setSelections(current => ({
                            ...current,
                            [poll.id]: values.map(String)
                          }))
                        }
                        value={selectedIds}
                      >
                        <div className="space-y-3">
                          {poll.options.map(option => (
                            <Checkbox className="block" key={option.id} value={option.id}>
                              {option.label}
                            </Checkbox>
                          ))}
                        </div>
                      </Checkbox.Group>
                    )}

                    <div className="space-y-3 border-t border-border pt-4">
                      {poll.options.map(option => (
                        <div key={option.id}>
                          <div className="mb-1 flex justify-between gap-3 text-sm">
                            <span className="font-semibold text-text">{option.label}</span>
                            <span className="text-text-soft">
                              {option.voteCount} •{' '}
                              {formatPercent(option.voteCount, poll.totalVotes)}
                            </span>
                          </div>
                          <Progress
                            percent={
                              poll.totalVotes ? (option.voteCount / poll.totalVotes) * 100 : 0
                            }
                            showInfo={false}
                            strokeColor="#6a0032"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-text-soft">
                      <BarChart3 aria-hidden="true" size={16} />
                      {poll.totalVotes} vote(s)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {poll.canManage ? (
                        <Button
                          loading={
                            updatePollStatus.isPending &&
                            updatePollStatus.variables?.pollId === poll.id
                          }
                          onClick={() =>
                            handleStatus(poll, poll.status === 'open' ? 'closed' : 'open')
                          }
                        >
                          {poll.status === 'open' ? 'Close' : 'Reopen'}
                        </Button>
                      ) : null}
                      <Button
                        disabled={
                          !poll.canVote || Boolean(poll.currentUserVote) || selectedIds.length === 0
                        }
                        loading={votePoll.isPending && votePoll.variables?.pollId === poll.id}
                        onClick={() => handleVote(poll)}
                        type="primary"
                      >
                        {poll.currentUserVote ? 'Voted' : 'Submit Vote'}
                      </Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        ) : null}

        {lastPollPage > 1 || totalPolls > payload.perPage ? (
          <div className="flex justify-center rounded-app border border-border bg-surface p-4 shadow-panel">
            <Pagination
              current={currentPollPage}
              onChange={(page, perPage) => updateSearchParams({ page, perPage })}
              pageSize={payload.perPage}
              pageSizeOptions={[6, 8, 12, 24]}
              showSizeChanger
              total={totalPolls}
            />
          </div>
        ) : null}

        <Modal
          confirmLoading={createPoll.isPending}
          destroyOnClose
          okText="Create Poll"
          onCancel={() => setCreateOpen(false)}
          onOk={() => form.submit()}
          open={isCreateOpen}
          title="Create Poll"
          width="min(680px, calc(100vw - 32px))"
        >
          <Form form={form} layout="vertical" onFinish={handleCreatePoll} requiredMark={false}>
            <Form.Item label="Club" name="clubId" rules={[{ required: true }]}>
              <Select
                loading={isManageablePollClubsPending}
                options={manageablePollClubs.map(club => ({ label: club.name, value: club.slug }))}
              />
            </Form.Item>
            <Form.Item label="Question" name="question" rules={[{ required: true, min: 8 }]}>
              <Input maxLength={240} showCount />
            </Form.Item>
            <Form.Item
              extra="Enter one option per line."
              label="Options"
              name="options"
              rules={[{ required: true }]}
            >
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} />
            </Form.Item>
            <div className="grid gap-3 md:grid-cols-3">
              <Form.Item label="Type" name="type" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Single choice', value: 'single_choice' },
                    { label: 'Multiple choice', value: 'multiple_choice' }
                  ]}
                />
              </Form.Item>
              <Form.Item label="Visibility" name="visibility" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Anonymous', value: 'anonymous' }
                  ]}
                />
              </Form.Item>
              <Form.Item label="Status" name="status" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: 'Open', value: 'open' },
                    { label: 'Draft', value: 'draft' }
                  ]}
                />
              </Form.Item>
            </div>
            <Form.Item label="Closes at" name="closesAt" rules={[{ required: true }]}>
              <Input type="datetime-local" />
            </Form.Item>
          </Form>
        </Modal>
      </main>
    </AppShell>
  )
}
