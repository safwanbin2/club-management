import { describe, expect, it } from 'vitest'

import { ApplicationError } from '../../utils/application-error.js'
import { assertChatMessageContent } from './chat.service.js'

describe('chat.service message content rules', () => {
  it('requires text or an attachment', () => {
    expect(() => assertChatMessageContent('', [])).toThrow(ApplicationError)
    expect(() => assertChatMessageContent('Hello club', [])).not.toThrow()
    expect(() =>
      assertChatMessageContent('', [
        {
          name: 'agenda.pdf',
          size: 1200,
          type: 'other',
          url: 'https://example.edu/agenda.pdf'
        }
      ])
    ).not.toThrow()
  })
})
