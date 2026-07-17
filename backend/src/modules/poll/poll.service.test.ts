import { describe, expect, it } from 'vitest'

import { ApplicationError } from '../../utils/application-error.js'
import { validateVoteSelection } from './poll.service.js'

const poll = {
  options: [
    { id: 'a', label: 'A', voteCount: 0 },
    { id: 'b', label: 'B', voteCount: 0 }
  ],
  status: 'open' as const,
  type: 'single_choice' as const
}

describe('poll.service vote selection rules', () => {
  it('accepts one valid option for single-choice polls', () => {
    expect(validateVoteSelection(poll, ['a'])).toEqual(['a'])
  })

  it('rejects multiple options for single-choice polls', () => {
    expect(() => validateVoteSelection(poll, ['a', 'b'])).toThrow(ApplicationError)
  })

  it('rejects closed polls and unknown options', () => {
    expect(() => validateVoteSelection({ ...poll, status: 'closed' }, ['a'])).toThrow(
      ApplicationError
    )
    expect(() => validateVoteSelection(poll, ['x'])).toThrow(ApplicationError)
  })
})
