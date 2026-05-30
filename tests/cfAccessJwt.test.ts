import { describe, it, expect } from 'vitest'
import { verifyAccessJwt } from '../src/auth/cfAccessJwt'

describe('verifyAccessJwt', () => {
  it('returns null when jwt is empty', async () => {
    expect(await verifyAccessJwt('', 'team.cloudflareaccess.com', 'aud')).toBeNull()
  })

  it('returns null when jwt is malformed', async () => {
    expect(await verifyAccessJwt('not.a.jwt', 'team.cloudflareaccess.com', 'aud')).toBeNull()
  })

  // Note: full JWT round-trip test requires JWKS mock; covered in manual E2E.
})
