import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import publicRoute from '../src/routes/public'
import noteRoute from '../src/routes/note'

class MockR2 implements Partial<R2Bucket> {
  store = new Map<string, string>()
  async put(key: string, value: any) {
    this.store.set(key, typeof value === 'string' ? value : '')
    return {} as any
  }
  async get(key: string) {
    const v = this.store.get(key)
    if (!v) return null
    return { text: async () => v, httpMetadata: {} } as any
  }
  async delete(keys: any) {
    const arr = Array.isArray(keys) ? keys : [keys]
    arr.forEach((k: string) => this.store.delete(k))
  }
}

const seedR2 = async (r2: MockR2, uuid: string, mode: string, audience: string[] = [], expires_at: string | null = null) => {
  const meta = { uuid, mode, audience, expires_at, created_at: '2026-05-30T00:00:00Z', updated_at: '2026-05-30T00:00:00Z', title: 'T', source_path: 'p.md', owner_email: 'me@x.com' }
  await r2.put(`notes/${uuid}.json`, JSON.stringify(meta))
  await r2.put(`notes/${uuid}.html`, '<html><body>hello</body></html>')
}

describe('GET /p/:uuid (public)', () => {
  it('returns 200 with HTML for public mode', async () => {
    const r2 = new MockR2()
    await seedR2(r2, 'pub1', 'public')
    const app = new Hono()
    app.route('/', publicRoute)
    const res = await app.request('/p/pub1', {}, { R2: r2 } as any)
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('hello')
  })

  it('returns 403 if note is not public mode', async () => {
    const r2 = new MockR2()
    await seedR2(r2, 'org1', 'org')
    const app = new Hono()
    app.route('/', publicRoute)
    const res = await app.request('/p/org1', {}, { R2: r2 } as any)
    expect(res.status).toBe(403)
  })

  it('returns 404 if missing', async () => {
    const r2 = new MockR2()
    const app = new Hono()
    app.route('/', publicRoute)
    const res = await app.request('/p/missing', {}, { R2: r2 } as any)
    expect(res.status).toBe(404)
  })

  it('returns 410 if expired', async () => {
    const r2 = new MockR2()
    await seedR2(r2, 'exp1', 'public', [], '2020-01-01T00:00:00Z')
    const app = new Hono()
    app.route('/', publicRoute)
    const res = await app.request('/p/exp1', {}, { R2: r2 } as any)
    expect(res.status).toBe(410)
  })
})

describe('GET /n/:uuid (private — no auth yet, just structure)', () => {
  it('returns 401 without CF-Access-Jwt-Assertion header', async () => {
    const r2 = new MockR2()
    await seedR2(r2, 'priv1', 'org')
    const app = new Hono()
    app.route('/', noteRoute)
    const res = await app.request('/n/priv1', {}, { R2: r2, ORG_DOMAIN: 'cyberagent.co.jp', CF_ACCESS_TEAM_DOMAIN: 't.cloudflareaccess.com', CF_ACCESS_AUD: 'aud' } as any)
    expect(res.status).toBe(401)
  })

  it('returns 404 if missing', async () => {
    const r2 = new MockR2()
    const app = new Hono()
    app.route('/', noteRoute)
    const res = await app.request('/n/missing', {}, { R2: r2, ORG_DOMAIN: 'cyberagent.co.jp', CF_ACCESS_TEAM_DOMAIN: 't.cloudflareaccess.com', CF_ACCESS_AUD: 'aud' } as any)
    expect(res.status).toBe(404)
  })
})
