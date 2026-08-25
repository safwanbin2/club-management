import { App as AntApp, Button, Empty, Form, Input, Skeleton, Tag } from 'antd'
import { Bot, Gauge, History, Search, Send, Sparkles } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import getApiErrorMessage from '@common/helpers/get-api-error-message'
import AppShell from '@features/app-shell'
import useSendAssistantMessage from './data/use-send-assistant-message'
import {
  createPendingAssistantExchangeMessages,
  formatAssistantTime,
  replaceAssistantPendingMessage,
  replaceAssistantPendingMessageWithError
} from './shared/helpers'
import type { AssistantMessage, AssistantToolTrace } from './shared/types'

type AssistantFormValues = {
  message: string
}

const suggestedPrompts = [
  'Summarize my dashboard',
  'What events are coming up?',
  'Search robotics clubs',
  'Do I have any resource request updates?'
]

const capabilityItems = [
  {
    description: 'Role-aware dashboard metrics and current work queues.',
    icon: Gauge,
    label: 'Workspace Analytics'
  },
  {
    description: 'Clubs, events, feed posts, and public profiles you can access.',
    icon: Search,
    label: 'Campus Search'
  },
  {
    description: 'Upcoming events, approvals, resources, and campus activity.',
    icon: Sparkles,
    label: 'Operational Context'
  }
]

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user'
  const isError = message.status === 'error'
  const isPending = message.status === 'pending'

  return (
    <article className={['flex w-full', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[min(760px,88%)] rounded-app border px-4 py-3 shadow-sm',
          isUser
            ? 'border-primary/20 bg-primary text-white'
            : isError
              ? 'border-accent-red/30 bg-red-50 text-text'
              : 'border-border bg-surface text-text'
        ].join(' ')}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold">{isUser ? 'You' : 'Campus Hub Assistant'}</span>
          <span className="flex items-center gap-2 text-xs opacity-80">
            {isPending ? <Tag color="processing">Thinking</Tag> : null}
            {isError ? <Tag color="error">Error</Tag> : null}
            {formatAssistantTime(message.createdAt)}
          </span>
        </div>
        {isPending ? (
          <div aria-busy="true" aria-live="polite">
            <p className="m-0 mb-3 text-sm text-text-soft">{message.content}</p>
            <Skeleton active paragraph={{ rows: 2 }} title={false} />
          </div>
        ) : (
          <p className="m-0 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        )}
        {message.toolsUsed.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.toolsUsed.map(tool => (
              <Tag
                color={tool.status === 'success' ? 'green' : 'red'}
                key={`${message.id}-${tool.name}`}
              >
                {tool.label}
              </Tag>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function RecentTools({ tools }: { tools: AssistantToolTrace[] }) {
  if (tools.length === 0) {
    return <Empty description="No tools used yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  return (
    <ul className="m-0 space-y-3 p-0">
      {tools.map((tool, index) => (
        <li
          className="flex items-center justify-between gap-3 rounded-app border border-border bg-muted px-3 py-2 text-sm"
          key={`${tool.name}-${index}`}
        >
          <span className="font-semibold text-text">{tool.label}</span>
          <Tag color={tool.status === 'success' ? 'green' : 'red'}>{tool.status}</Tag>
        </li>
      ))}
    </ul>
  )
}

export default function AssistantPage() {
  const { message: toast } = AntApp.useApp()
  const [form] = Form.useForm<AssistantFormValues>()
  const transcriptRef = useRef<HTMLDivElement>(null)
  const pendingAssistantMessageIdRef = useRef<null | string>(null)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [previousInteractionId, setPreviousInteractionId] = useState<string>()
  const sendAssistantMessage = useSendAssistantMessage()

  const recentTools = useMemo(
    () =>
      messages
        .flatMap(message => message.toolsUsed)
        .slice(-5)
        .reverse(),
    [messages]
  )
  const isWaitingForAssistant =
    sendAssistantMessage.isPending || messages.some(message => message.status === 'pending')

  const scrollTranscript = () => {
    window.requestAnimationFrame(() => {
      transcriptRef.current?.scrollTo({
        behavior: 'smooth',
        top: transcriptRef.current.scrollHeight
      })
    })
  }

  const submitPrompt = (prompt: string) => {
    const message = prompt.trim()

    if (!message || pendingAssistantMessageIdRef.current) {
      return
    }

    const interactionIdForRequest = previousInteractionId
    const { assistantMessageId, messages: optimisticMessages } =
      createPendingAssistantExchangeMessages(message)

    pendingAssistantMessageIdRef.current = assistantMessageId
    setMessages(currentMessages => [...currentMessages, ...optimisticMessages])
    form.resetFields()
    scrollTranscript()

    sendAssistantMessage.mutate(
      {
        message,
        previousInteractionId: interactionIdForRequest
      },
      {
        onError: error => {
          const errorMessage = getApiErrorMessage(error, 'Assistant could not respond.')

          setMessages(currentMessages =>
            replaceAssistantPendingMessageWithError(
              currentMessages,
              assistantMessageId,
              errorMessage
            )
          )
          pendingAssistantMessageIdRef.current = null
          toast.error(errorMessage)
          scrollTranscript()
        },
        onSuccess: response => {
          setMessages(currentMessages =>
            replaceAssistantPendingMessage(currentMessages, assistantMessageId, response)
          )
          setPreviousInteractionId(response.interactionId ?? interactionIdForRequest)
          pendingAssistantMessageIdRef.current = null
          scrollTranscript()
        }
      }
    )
  }

  const handleFinish = (values: AssistantFormValues) => {
    submitPrompt(values.message)
  }

  return (
    <AppShell>
      <main className="space-y-6 px-5 py-6 lg:px-8" aria-label="Campus assistant">
        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Campus intelligence
            </p>
            <h1 className="m-0 text-3xl font-bold text-text lg:text-4xl">Assistant</h1>
            <p className="mb-0 mt-3 max-w-3xl text-base text-text-soft">
              Ask about your workspace, campus activity, events, clubs, approvals, and analytics.
            </p>
          </div>
          <Button
            disabled={isWaitingForAssistant}
            icon={<History size={16} />}
            onClick={() => {
              setMessages([])
              setPreviousInteractionId(undefined)
            }}
          >
            New chat
          </Button>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="flex min-h-[680px] flex-col rounded-app border border-border bg-surface shadow-panel">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-app bg-primary-soft text-primary">
                  <Bot aria-hidden="true" size={21} />
                </span>
                <div>
                  <h2 className="m-0 text-lg font-bold text-text">Campus Hub Assistant</h2>
                  <p className="m-0 mt-1 text-sm text-text-soft">Gemini-powered campus support</p>
                </div>
              </div>
              {isWaitingForAssistant ? <Tag color="processing">Thinking</Tag> : <Tag>Ready</Tag>}
            </div>

            <div ref={transcriptRef} className="flex-1 overflow-y-auto bg-muted/40 p-4">
              {messages.length === 0 ? (
                <div className="grid min-h-[460px] place-items-center">
                  <div className="max-w-xl text-center">
                    <Empty
                      description="Start a campus conversation"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {suggestedPrompts.map(prompt => (
                        <Button
                          disabled={isWaitingForAssistant}
                          key={prompt}
                          onClick={() => submitPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border p-4">
              <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
                <Form.Item
                  className="mb-0"
                  label="Prompt"
                  name="message"
                  rules={[{ message: 'Enter a prompt.', required: true }]}
                >
                  <Input.TextArea
                    autoSize={{ maxRows: 5, minRows: 2 }}
                    maxLength={2000}
                    placeholder="Ask about events, clubs, analytics, resources..."
                  />
                </Form.Item>
                <div className="mt-3 flex justify-end">
                  <Button
                    htmlType="submit"
                    icon={<Send size={16} />}
                    loading={isWaitingForAssistant}
                    type="primary"
                  >
                    Send
                  </Button>
                </div>
              </Form>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <h2 className="m-0 text-lg font-bold text-text">Campus Data</h2>
              <div className="mt-4 space-y-4">
                {capabilityItems.map(item => {
                  const Icon = item.icon

                  return (
                    <div className="flex gap-3" key={item.label}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-app bg-primary-soft text-primary">
                        <Icon aria-hidden="true" size={18} />
                      </span>
                      <div>
                        <p className="m-0 text-sm font-bold text-text">{item.label}</p>
                        <p className="m-0 mt-1 text-sm text-text-soft">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="rounded-app border border-border bg-surface p-5 shadow-panel">
              <h2 className="m-0 text-lg font-bold text-text">Recent Tools</h2>
              <div className="mt-4">
                <RecentTools tools={recentTools} />
              </div>
            </section>
          </aside>
        </section>
      </main>
    </AppShell>
  )
}
