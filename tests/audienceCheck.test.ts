import { describe, it, expect } from 'vitest'
import { isAllowed } from '../src/auth/audienceCheck'

describe('isAllowed', () => {
  it('org mode: passes when email matches domain', () => {
    expect(isAllowed({ mode: 'org', audience: [] }, 'alice@cyberagent.co.jp', 'cyberagent.co.jp')).toBe(true)
  })

  it('org mode: rejects when email differs', () => {
    expect(isAllowed({ mode: 'org', audience: [] }, 'alice@other.com', 'cyberagent.co.jp')).toBe(false)
  })

  it('org mode: case-insensitive on domain', () => {
    expect(isAllowed({ mode: 'org', audience: [] }, 'ALICE@CyberAgent.co.jp', 'cyberagent.co.jp')).toBe(true)
  })

  it('list mode: passes when email in audience', () => {
    expect(isAllowed({ mode: 'list', audience: ['alice@x.com', 'bob@y.com'] }, 'BOB@y.com', 'cyberagent.co.jp')).toBe(true)
  })

  it('list mode: rejects when email not in audience', () => {
    expect(isAllowed({ mode: 'list', audience: ['alice@x.com'] }, 'eve@x.com', 'cyberagent.co.jp')).toBe(false)
  })

  it('public mode: always passes', () => {
    expect(isAllowed({ mode: 'public', audience: [] }, '', 'cyberagent.co.jp')).toBe(true)
  })
})
