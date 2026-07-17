import {
  Alert,
  App as AntApp,
  Avatar,
  Badge,
  Button,
  Empty,
  Form,
  Input,
  List,
  Popconfirm,
  Skeleton,
  Tag,
  Tooltip
} from 'antd'
import { MessageSquare, Pin, PinOff, RefreshCw, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useChatClubs from './data/use-chat-clubs'
import useChatMessages from './data/use-chat-messages'
import useMarkChatRead from './data/use-mark-chat-read'
import useModerateChatMessage from './data/use-moderate-chat-message'
import useSendChatMessage from './data/use-send-chat-message'
import { formatDateTime, getInitials } from './shared/helpers'
import type { ChatMessage, SendChatMessagePayload } from './shared/types'

type ChatFormValues = Pick<SendChatMessagePayload, 'body'>

function MessageActions({
  message,
  onModerate
}: {
  message: ChatMessage
  onModerate: (message: ChatMessage, action: 'delete' | 'pin' | 'unpin') => void
}) {
  if (!message.canModerate || message.deletedAt) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <Tooltip title={message.pinned ? 'Unpin message' : 'Pin message'}>
        <Button
          aria-label={message.pinned ? 'Unpin message' : 'Pin message'}
          icon={message.pinned ? <PinOff size={15} /> : <Pin size={15} />}
          onClick={() => onModerate(message, message.pinned ? 'unpin' : 'pin')}
          shape="circle"
          size="small"
          type="text"
        />
      </Tooltip>
      <Popconfirm
        okButtonProps={{ danger: true }}
        okText="Delete"
        onConfirm={() => onModerate(message, 'delete')}
        title="Delete this message?"
      >
        <Button
          aria-label="Delete message"
          danger
          icon={<Trash2 size={15} />}
          shape="circle"
          size="small"
          type="text"
        />
      </Popconfirm>
    </div>
  )
}

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { message: toast } = AntApp.useApp()
  const [form] = Form.useForm<ChatFormValues>()
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastReadKeyRef = useRef('')
  const selectedClubId = searchParams.get('clubId')
  const { chatClubs, isChatClubsError, isChatClubsPending, refetchChatClubs } = useChatClubs()
  const selectedClub = useMemo(
    () => chatClubs.find(club => club.id === selectedClubId) ?? chatClubs[0] ?? null,
    [chatClubs, selectedClubId]
  )
  const activeClubId = selectedClub?.id ?? null
  const {
    chatMessages,
    isChatMessagesError,
    isChatMessagesFetching,
    isChatMessagesPending,
    refetchChatMessages
  } = useChatMessages(activeClubId)
  const sendMessage = useSendChatMessage()
  const moderateMessage = useModerateChatMessage()
  const markRead = useMarkChatRead()

  useEffect(() => {
    if (!selectedClubId && selectedClub) {
      setSearchParams({ clubId: selectedClub.id })
    }
  }, [selectedClub, selectedClubId, setSearchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [chatMessages.length, activeClubId])

  const unreadMessageIds = useMemo(
    () =>
      chatMessages
        .filter(chatMessage => !chatMessage.isOwn && !chatMessage.deletedAt)
        .map(chatMessage => chatMessage.id),
    [chatMessages]
  )

  useEffect(() => {
    if (activeClubId && unreadMessageIds.length > 0) {
      const readKey = `${activeClubId}:${unreadMessageIds.join(',')}`

      if (lastReadKeyRef.current === readKey) {
        return
      }

      lastReadKeyRef.current = readKey
      markRead.mutate({ clubId: activeClubId, messageIds: unreadMessageIds })
    }
  }, [activeClubId, markRead, unreadMessageIds])

  const handleSend = (values: ChatFormValues) => {
    if (!activeClubId) {
      return
    }

    sendMessage.mutate(
      {
        body: values.body.trim(),
        clubId: activeClubId
      },
      {
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Message could not be sent.'))
        },
        onSuccess: () => {
          form.resetFields()
        }
      }
    )
  }

  const handleModerate = (chatMessage: ChatMessage, action: 'delete' | 'pin' | 'unpin') => {
    moderateMessage.mutate(
      {
        action,
        messageId: chatMessage.id
      },
      {
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Message could not be updated.'))
        }
      }
    )
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Club chat">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Club channels
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Chat</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Message club members in private channels for the clubs you belong to.
            </p>
          </div>
          <Button
            icon={<RefreshCw size={16} />}
            loading={isChatMessagesFetching}
            onClick={() => {
              void refetchChatClubs()
              void refetchChatMessages()
            }}
            type="primary"
          >
            Refresh
          </Button>
        </section>

        {isChatClubsError || isChatMessagesError ? (
          <Alert message="Chat could not load" showIcon type="error" />
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-app border border-border bg-surface shadow-panel">
            <div className="border-b border-border p-4">
              <h2 className="m-0 text-lg font-bold text-text">Channels</h2>
            </div>
            {isChatClubsPending ? (
              <div className="p-4">
                <Skeleton active paragraph={{ rows: 5 }} />
              </div>
            ) : null}
            {!isChatClubsPending && chatClubs.length === 0 ? (
              <div className="px-4 py-10">
                <Empty description="No club chats yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : null}
            {chatClubs.length > 0 ? (
              <div className="max-h-[620px] overflow-y-auto p-3">
                {chatClubs.map(club => {
                  const isActive = club.id === activeClubId

                  return (
                    <button
                      className={[
                        'mb-2 flex w-full items-center gap-3 rounded-app border px-3 py-3 text-left transition',
                        isActive
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-border bg-muted text-text-soft hover:border-primary/30'
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      key={club.id}
                      onClick={() => setSearchParams({ clubId: club.id })}
                      type="button"
                    >
                      <span className="grid size-10 place-items-center rounded-app bg-surface text-primary">
                        <MessageSquare aria-hidden="true" size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{club.name}</span>
                        <span className="block truncate text-xs">
                          {club.lastMessageAt
                            ? formatDateTime(club.lastMessageAt)
                            : 'No messages yet'}
                        </span>
                      </span>
                      <Badge count={club.unreadCount} size="small" />
                    </button>
                  )
                })}
              </div>
            ) : null}
          </aside>

          <section className="flex min-h-[640px] flex-col rounded-app border border-border bg-surface shadow-panel">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <h2 className="m-0 text-lg font-bold text-text">
                  {selectedClub?.name ?? 'Select a channel'}
                </h2>
                {selectedClub ? (
                  <p className="m-0 mt-1 text-sm text-text-soft">{selectedClub.category}</p>
                ) : null}
              </div>
              {isChatMessagesFetching ? <Tag color="processing">Live</Tag> : <Tag>Live</Tag>}
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/40 p-4">
              {isChatMessagesPending && activeClubId ? (
                <Skeleton active paragraph={{ rows: 8 }} />
              ) : null}
              {!isChatMessagesPending && activeClubId && chatMessages.length === 0 ? (
                <div className="grid h-full place-items-center">
                  <Empty description="No messages yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : null}
              {!activeClubId ? (
                <div className="grid h-full place-items-center">
                  <Empty description="Choose a club channel" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              ) : null}
              {chatMessages.length > 0 ? (
                <List
                  dataSource={chatMessages}
                  renderItem={chatMessage => (
                    <List.Item className="border-0 px-0">
                      <div
                        className={[
                          'flex w-full gap-3',
                          chatMessage.isOwn ? 'justify-end' : 'justify-start'
                        ].join(' ')}
                      >
                        {!chatMessage.isOwn ? (
                          <Avatar
                            className="bg-primary"
                            src={chatMessage.author.avatarUrl ?? undefined}
                          >
                            {getInitials(chatMessage.author.name)}
                          </Avatar>
                        ) : null}
                        <div
                          className={[
                            'max-w-[min(680px,78%)] rounded-app border px-4 py-3 shadow-sm',
                            chatMessage.isOwn
                              ? 'border-primary/20 bg-primary text-white'
                              : 'border-border bg-surface text-text'
                          ].join(' ')}
                        >
                          <div className="mb-1 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold">{chatMessage.author.name}</span>
                            <span className="text-xs opacity-80">
                              {formatDateTime(chatMessage.createdAt)}
                            </span>
                          </div>
                          {chatMessage.deletedAt ? (
                            <p className="m-0 text-sm italic opacity-80">Message removed</p>
                          ) : (
                            <p className="m-0 whitespace-pre-wrap text-sm leading-6">
                              {chatMessage.body}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-xs opacity-80">
                              {chatMessage.pinned ? <Tag color="gold">Pinned</Tag> : null}
                              Seen by {chatMessage.seenCount}
                            </span>
                            <MessageActions message={chatMessage} onModerate={handleModerate} />
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-border p-4">
              <Form form={form} layout="vertical" onFinish={handleSend} requiredMark={false}>
                <Form.Item className="mb-0" name="body" rules={[{ required: true }]}>
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 5 }}
                    disabled={!activeClubId}
                    maxLength={1000}
                    placeholder="Write a message..."
                  />
                </Form.Item>
                <div className="mt-3 flex justify-end">
                  <Button
                    disabled={!activeClubId}
                    htmlType="submit"
                    icon={<Send size={16} />}
                    loading={sendMessage.isPending}
                    type="primary"
                  >
                    Send
                  </Button>
                </div>
              </Form>
            </div>
          </section>
        </section>
      </main>
    </AppShell>
  )
}
