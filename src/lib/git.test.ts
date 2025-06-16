import { describe, expect, it } from 'vitest'

import { GitError } from '@/lib/git'

describe('GitError', () => {
  it('should create an error with message', () => {
    const error = new GitError('Test error')
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(GitError)
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('GitError')
  })

  it('should create an error with code', () => {
    const error = new GitError('Test error', 'TEST_CODE')
    expect(error.code).toBe('TEST_CODE')
  })
})
