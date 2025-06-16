import { describe, expect, it } from 'vitest'

import { TmuxError } from '@/lib/tmux'

describe('TmuxError', () => {
  it('should create an error with message', () => {
    const error = new TmuxError('Test error')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(TmuxError)
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('TmuxError')
  })

  it('should create an error with code', () => {
    const error = new TmuxError('Test error', 'TMUX_CODE')
    expect(error.code).toBe('TMUX_CODE')
  })
})
